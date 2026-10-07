import { useEffect, useMemo, useRef, useState, type FormEvent, type RefObject } from "react";
import {
  ArrowUpRight,
  Calendar,
  ExternalLink,
  Gauge,
  ImageIcon,
  Radio,
  Search,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getRocket, searchRockets } from "@/lib/spacex/api";
import {
  countdownParts,
  formatDate,
  formatNumber,
  formatShortDate,
  formatUsd,
  missionName,
  pad2,
} from "@/lib/spacex/format";
import type { Board, Launch, Rocket, SearchHit } from "@/lib/spacex/types";
import { cn } from "@/lib/utils";

const RECENT_KEY = "hawthorne:recent";
const FLEET_CHIPS = ["Falcon 1", "Falcon 9", "Falcon Heavy", "Starship"] as const;

type Detail = {
  rocket: Rocket;
  launches: Launch[];
  upcoming: Launch[];
};

type Props = { board: Board };

export function Explorer({ board }: Props) {
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [searched, setSearched] = useState(false);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [searching, setSearching] = useState(false);
  const [loadingRocket, setLoadingRocket] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recent, setRecent] = useState<string[]>([]);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [now, setNow] = useState<number | null>(null);
  const galleryRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      if (raw) setRecent(JSON.parse(raw) as string[]);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const nextName = board.next?.rocket;
    if (!nextName) return;
    const match = board.fleet.find((rocket) =>
      nextName.toLowerCase().includes(rocket.name.toLowerCase()),
    );
    if (match) {
      setQuery(match.name);
      void openRocket(match.id);
    }
    // Only on first board paint.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function remember(term: string) {
    const clean = term.trim();
    if (!clean) return;
    setRecent((prev) => {
      const next = [clean, ...prev.filter((item) => item.toLowerCase() !== clean.toLowerCase())].slice(
        0,
        6,
      );
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  async function openRocket(id: number) {
    setLoadingRocket(true);
    setError(null);
    try {
      const result = await getRocket({ data: { id } });
      if (!result) {
        setError("That vehicle record could not be opened.");
        return;
      }
      setDetail(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load that rocket.");
    } finally {
      setLoadingRocket(false);
    }
  }

  async function runSearch(term: string, scroll = false) {
    const q = term.trim();
    setQuery(q);
    setSearching(true);
    setSearched(true);
    setError(null);
    if (!q) {
      const falcon9 = board.fleet.find((item) => item.name === "Falcon 9");
      setHits(
        board.fleet.map((rocket) => ({ rocket, score: 50, reason: "family" as const })),
      );
      if (falcon9) await openRocket(falcon9.id);
      if (scroll) scrollToGallery();
      setSearching(false);
      return;
    }
    remember(q);
    try {
      const result = await searchRockets({ data: { q } });
      setHits(result.hits);
      const top = result.hits[0];
      if (top) {
        await openRocket(top.rocket.id);
        if (scroll) scrollToGallery();
      } else {
        setDetail(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed.");
    } finally {
      setSearching(false);
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void runSearch(query, true);
  }

  const rocket = detail?.rocket ?? null;
  const gallery = rocket?.gallery?.length ? rocket.gallery : rocket?.imageUrl ? [rocket.imageUrl] : [];
  const count = now == null ? null : countdownParts(board.next?.dateUtc ?? null, now);
  const nextMission = board.next ? missionName(board.next.name) : null;
  const miss = searched && !searching && hits.length === 0;

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <header className="relative isolate overflow-hidden">
        <img
          src="/heritage-pad.jpg"
          alt=""
          className="hero-photo absolute inset-0 size-full object-cover opacity-40"
        />
        <div className="hero-wash absolute inset-0" />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pb-16 pt-6 sm:px-6 sm:pt-8">
          <div className="flex items-center justify-between gap-3">
            <p className="font-mono text-xs tracking-[0.22em] text-muted uppercase">
              Range · SpaceX fleet
            </p>
            <p className="font-mono text-[0.6875rem] tracking-[0.18em] text-subtle uppercase">
              {board.source === "live" ? "Live index" : "Cached fleet"}
            </p>
          </div>

          <div className="reveal max-w-3xl">
            <p className="mb-3 font-mono text-xs tracking-[0.28em] text-muted uppercase">
              Hawthorne, CA
            </p>
            <h1 className="font-display text-display leading-[0.86] font-semibold tracking-tight text-fg">
              HAWTHORNE
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
              Type a rocket name — Falcon 9, Starship, Vulcan — and open the gallery.
              Rebuilt from the original SpaceX photos project, with a search that
              actually returns a vehicle.
            </p>
          </div>

          <form
            onSubmit={onSubmit}
            className="reveal-2 flex w-full flex-col gap-3 sm:flex-row sm:items-stretch"
          >
            <label className="sr-only" htmlFor="rocket-search">
              Elon's Choice
            </label>
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-subtle" />
              <Input
                id="rocket-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Elon's Choice — Falcon 9, Starship, Vulcan…"
                className="h-12 pl-11"
                autoComplete="off"
                enterKeyHint="search"
              />
            </div>
            <Button type="submit" size="lg" className="h-12 min-h-12 shrink-0 sm:w-auto" disabled={searching}>
              <ImageIcon />
              View Gallery
            </Button>
          </form>

          <div className="reveal-3 flex flex-wrap gap-2">
            {FLEET_CHIPS.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => void runSearch(name, true)}
                className={cn(
                  "h-11 min-h-11 rounded-full px-4 text-sm text-fg shadow-[var(--shadow-border)]",
                  "bg-surface/80 backdrop-blur-sm transition-[box-shadow,background-color] duration-150",
                  "hover:shadow-[var(--shadow-border-hover)] hover:bg-elevated",
                  query.toLowerCase() === name.toLowerCase() && "bg-accent text-accent-fg shadow-none",
                )}
              >
                {name}
              </button>
            ))}
          </div>

          {recent.length > 0 && (
            <p className="font-mono text-xs tracking-wide text-subtle uppercase">
              Recent{" "}
              {recent.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => void runSearch(term, true)}
                  className="ml-3 text-muted lowercase tracking-normal hover:text-fg"
                >
                  {term}
                </button>
              ))}
            </p>
          )}
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
        {board.next && nextMission && (
          <section className="reveal-4 -mt-4 mb-10 rounded-card bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="flex items-center gap-2 font-mono text-xs tracking-[0.2em] text-muted uppercase">
                  <Radio className="size-3.5 text-go" />
                  Next on the range
                </p>
                <h2 className="mt-2 font-display text-2xl leading-tight font-semibold tracking-tight sm:text-3xl">
                  {nextMission.mission}
                </h2>
                <p className="mt-1 text-sm text-muted">
                  {nextMission.vehicle}
                  {board.next.pad ? ` · ${board.next.pad}` : ""}
                </p>
              </div>
              <Countdown count={count} status={board.next.status} />
            </div>
          </section>
        )}

        {error && (
          <p className="mb-6 rounded-control bg-fail/10 px-4 py-3 text-sm text-fail">{error}</p>
        )}

        {miss && (
          <div className="mb-10 rounded-card bg-surface p-6 shadow-[var(--shadow-border)]">
            <h2 className="font-display text-2xl font-semibold tracking-tight">No vehicle with that name</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
              The SpaceX fleet in this index is Falcon 1, Falcon 9, Falcon Heavy, and Starship.
              Vulcan is included as a known miss that still returns a rocket — ULA, not SpaceX.
            </p>
          </div>
        )}

        {hits.length > 1 && (
          <div className="mb-8 flex gap-2 overflow-x-auto pb-1">
            {hits.map((hit) => (
              <button
                key={`${hit.rocket.id}-${hit.rocket.fullName}`}
                type="button"
                onClick={() => void openRocket(hit.rocket.id)}
                className={cn(
                  "h-11 shrink-0 rounded-full px-4 text-sm shadow-[var(--shadow-border)]",
                  rocket?.id === hit.rocket.id
                    ? "bg-accent text-accent-fg"
                    : "bg-elevated text-fg hover:bg-surface",
                )}
              >
                {hit.rocket.fullName}
              </button>
            ))}
          </div>
        )}

        {loadingRocket && !rocket && <DossierSkeleton />}

        {rocket && (
          <Dossier
            detail={detail!}
            loading={loadingRocket}
            galleryRef={galleryRef}
            onOpenPhoto={setLightbox}
          />
        )}

        {!rocket && !loadingRocket && (
          <FleetGrid
            fleet={board.fleet}
            onOpen={(id) => {
              const chosen = board.fleet.find((item) => item.id === id);
              if (chosen) setQuery(chosen.name);
              void openRocket(id);
            }}
          />
        )}

        {board.upcoming.length > 0 && (
          <section className="mt-14">
            <h2 className="font-display text-title font-semibold tracking-tight">Upcoming</h2>
            <ul className="mt-5 divide-y divide-border">
              {board.upcoming.map((launch, index) => {
                const parsed = missionName(launch.name);
                return (
                  <li key={`${launch.name}-${launch.dateUtc}-${index}`} className="flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-medium">{parsed.mission}</p>
                      <p className="text-sm text-muted">
                        {parsed.vehicle}
                        {launch.pad ? ` · ${launch.pad}` : ""}
                      </p>
                    </div>
                    <p className="font-mono text-xs text-subtle tabular-nums">
                      {formatDate(launch.dateUtc)}
                    </p>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-subtle sm:px-6">
          <p>Not affiliated with SpaceX. Data from a SpaceX API mirror and Launch Library 2.</p>
          <p>Rebuilt from the 2020 WD_SpaceX_API gallery — search, then a rocket, then photographs.</p>
        </div>
      </footer>

      {lightbox != null && gallery[lightbox] && (
        <Lightbox
          src={gallery[lightbox]}
          alt={rocket?.fullName ?? "Rocket"}
          onClose={() => setLightbox(null)}
          onPrev={() =>
            setLightbox((index) =>
              index == null ? 0 : (index + gallery.length - 1) % gallery.length,
            )
          }
          onNext={() =>
            setLightbox((index) => (index == null ? 0 : (index + 1) % gallery.length))
          }
          count={`${lightbox + 1} / ${gallery.length}`}
        />
      )}
    </div>
  );
}

function Countdown({
  count,
  status,
}: {
  count: ReturnType<typeof countdownParts>;
  status: string;
}) {
  if (!count) {
    return <Badge variant="hold">{status}</Badge>;
  }
  const label = count.past ? "T+" : "T−";
  return (
    <div className="flex flex-col items-start gap-2 sm:items-end">
      <Badge variant={count.past ? "go" : "hold"}>{status}</Badge>
      <p className="font-mono text-lg tracking-wide text-fg tabular-nums sm:text-xl">
        {label}
        {count.days > 0 ? `${count.days}d ` : ""}
        {pad2(count.hours)}:{pad2(count.minutes)}:{pad2(count.seconds)}
      </p>
    </div>
  );
}

function FleetGrid({
  fleet,
  onOpen,
}: {
  fleet: Rocket[];
  onOpen: (id: number) => void;
}) {
  return (
    <section>
      <h2 className="font-display text-title font-semibold tracking-tight">The fleet</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {fleet.map((rocket) => (
          <button
            key={rocket.id}
            type="button"
            onClick={() => onOpen(rocket.id)}
            className="group overflow-hidden rounded-card bg-surface text-left shadow-[var(--shadow-border)] transition-[box-shadow] duration-150 hover:shadow-[var(--shadow-border-hover)]"
          >
            <div className="aspect-16/10 overflow-hidden bg-elevated">
              {rocket.imageUrl ? (
                <img
                  src={rocket.imageUrl}
                  alt={rocket.fullName}
                  className="size-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                />
              ) : null}
            </div>
            <div className="p-4">
              <p className="font-mono text-xs tracking-[0.18em] text-subtle uppercase">
                {rocket.family}
              </p>
              <h3 className="mt-1 font-display text-2xl font-semibold tracking-tight">
                {rocket.name}
              </h3>
              <p className="mt-2 line-clamp-2 text-sm text-muted">{rocket.description}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

function Dossier({
  detail,
  loading,
  galleryRef,
  onOpenPhoto,
}: {
  detail: Detail;
  loading: boolean;
  galleryRef: RefObject<HTMLElement | null>;
  onOpenPhoto: (index: number) => void;
}) {
  const { rocket, launches, upcoming } = detail;
  const gallery = rocket.gallery.length ? rocket.gallery : rocket.imageUrl ? [rocket.imageUrl] : [];
  const stats = useMemo(
    () => [
      { label: "Height", value: formatNumber(rocket.lengthM, "m") },
      { label: "Diameter", value: formatNumber(rocket.diameterM, "m") },
      { label: "Mass", value: formatNumber(rocket.massT, "t") },
      { label: "Thrust", value: formatNumber(rocket.thrustKn, "kN") },
      { label: "LEO", value: formatNumber(rocket.leoKg, "kg") },
      { label: "GTO", value: formatNumber(rocket.gtoKg, "kg") },
      { label: "Flights", value: formatNumber(rocket.totalLaunches) },
      { label: "Cost", value: formatUsd(rocket.launchCostUsd) },
    ],
    [rocket],
  );

  return (
    <article className={cn("space-y-8", loading && "opacity-70")}>
      <div className="overflow-hidden rounded-shell bg-surface shadow-[var(--shadow-border)]">
        <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
          <div className="aspect-4/3 bg-elevated lg:aspect-auto lg:min-h-full">
            {rocket.imageUrl ? (
              <button
                type="button"
                className="block size-full"
                onClick={() => onOpenPhoto(0)}
              >
                <img
                  src={rocket.imageUrl}
                  alt={rocket.fullName}
                  className="size-full object-cover"
                />
              </button>
            ) : (
              <div className="flex size-full min-h-64 items-center justify-center text-subtle">
                No photograph
              </div>
            )}
          </div>
          <div className="flex flex-col gap-5 p-5 sm:p-7">
            <div className="flex flex-wrap gap-2">
              <Badge>{rocket.manufacturer.abbrev || rocket.manufacturer.name}</Badge>
              {rocket.reusable ? <Badge variant="go">Reusable</Badge> : <Badge>Expendable</Badge>}
              {!rocket.spacex && <Badge variant="hold">Outside the fleet</Badge>}
            </div>
            <div>
              <p className="font-mono text-xs tracking-[0.2em] text-subtle uppercase">
                {rocket.family}
                {rocket.variant ? ` · ${rocket.variant}` : ""}
              </p>
              <h2 className="mt-2 font-display text-title font-semibold tracking-tight">
                {rocket.name}
              </h2>
              <p className="mt-1 text-sm text-muted">{rocket.fullName}</p>
            </div>
            <p className="text-sm leading-relaxed text-muted sm:text-base">{rocket.description}</p>
            <p className="font-mono text-xs text-subtle">
              Maiden {formatShortDate(rocket.maidenFlight)}
            </p>
            <div className="mt-auto flex flex-wrap gap-3">
              {rocket.infoUrl && (
                <a
                  href={rocket.infoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 items-center gap-1.5 text-sm text-fg hover:text-accent"
                >
                  Vehicle page <ArrowUpRight className="size-4" />
                </a>
              )}
              {rocket.wikiUrl && (
                <a
                  href={rocket.wikiUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 items-center gap-1.5 text-sm text-muted hover:text-fg"
                >
                  Wiki <ExternalLink className="size-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <section>
        <h3 className="flex items-center gap-2 font-display text-xl font-semibold tracking-tight">
          <Gauge className="size-4 text-muted" />
          Telemetry
        </h3>
        <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-card bg-border sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-surface px-4 py-4">
              <dt className="font-mono text-xs tracking-[0.18em] text-subtle uppercase">
                {stat.label}
              </dt>
              <dd className="mt-1 font-mono text-sm text-fg tabular-nums sm:text-base">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section ref={galleryRef} id="gallery" className="scroll-mt-6">
        <h3 className="flex items-center gap-2 font-display text-xl font-semibold tracking-tight">
          <ImageIcon className="size-4 text-muted" />
          Gallery
        </h3>
        {gallery.length === 0 ? (
          <p className="mt-4 text-sm text-muted">No photographs published for this vehicle.</p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {gallery.map((src, index) => (
              <button
                key={src}
                type="button"
                onClick={() => onOpenPhoto(index)}
                className="aspect-4/3 overflow-hidden rounded-card bg-elevated shadow-[var(--shadow-border)]"
              >
                <img src={src} alt={`${rocket.fullName} ${index + 1}`} className="size-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </section>

      {(upcoming.length > 0 || launches.length > 0) && (
        <section>
          <h3 className="flex items-center gap-2 font-display text-xl font-semibold tracking-tight">
            <Calendar className="size-4 text-muted" />
            Manifest
          </h3>
          <ul className="mt-4 divide-y divide-border">
            {uniqueManifest([...upcoming, ...launches]).map((launch, index) => {
              const parsed = missionName(launch.name);
              return (
                <li
                  key={`${launch.name}-${launch.dateUtc}-${index}`}
                  className="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:justify-between"
                >
                  <div>
                    <p className="font-medium">{parsed.mission}</p>
                    <p className="text-sm text-muted">{launch.pad ?? parsed.vehicle}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {launch.success === true && <Badge variant="go">Success</Badge>}
                    {launch.success === false && <Badge variant="fail">Failure</Badge>}
                    {launch.success == null && launch.status && (
                      <Badge variant="hold">{launch.status}</Badge>
                    )}
                    <p className="font-mono text-xs text-subtle tabular-nums">
                      {formatDate(launch.dateUtc)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </article>
  );
}

function scrollToGallery() {
  window.setTimeout(() => {
    document.getElementById("gallery")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 200);
}

function uniqueManifest(launches: Launch[]): Launch[] {
  const seen = new Set<string>();
  const out: Launch[] = [];
  for (const launch of launches) {
    const key = `${launch.name}|${launch.dateUtc ?? ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(launch);
  }
  return out.slice(0, 8);
}

function DossierSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-72 w-full rounded-shell" />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-control" />
        ))}
      </div>
    </div>
  );
}

function Lightbox({
  src,
  alt,
  onClose,
  onPrev,
  onNext,
  count,
}: {
  src: string;
  alt: string;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  count: string;
}) {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") onPrev();
      if (event.key === "ArrowRight") onNext();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onPrev, onNext]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg/92 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Photograph"
      onClick={onClose}
    >
      <button
        type="button"
        className="absolute top-4 right-4 flex size-11 items-center justify-center rounded-control text-fg"
        onClick={onClose}
        aria-label="Close"
      >
        <X className="size-5" />
      </button>
      <img
        src={src}
        alt={alt}
        className="max-h-[82dvh] max-w-full object-contain"
        onClick={(event) => event.stopPropagation()}
      />
      <p className="absolute bottom-5 font-mono text-xs text-muted tabular-nums">{count}</p>
    </div>
  );
}
