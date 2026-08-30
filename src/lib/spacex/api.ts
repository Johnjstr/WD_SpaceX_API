import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { FLEET_IDS, SNAPSHOT_ROCKETS, uniqueImages } from "./snapshot";
import type { Board, Launch, Rocket, SearchHit } from "./types";

const PW = "https://gateway.pipeworx.io/spacex/v4";
const LL2 = "https://ll.thespacedevs.com/2.2.0";
const UA = "Hawthorne/1.0 (portfolio revival of WD_SpaceX_API)";

type CacheEntry<T> = { at: number; data: T };
const memory = new Map<string, CacheEntry<unknown>>();
const LIVE_TTL = 5 * 60_000;
const SEARCH_TTL = 15 * 60_000;

function readCache<T>(key: string, ttl: number): T | null {
  const hit = memory.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > ttl) {
    memory.delete(key);
    return null;
  }
  return hit.data as T;
}

function writeCache<T>(key: string, data: T): T {
  memory.set(key, { at: Date.now(), data });
  return data;
}

async function fetchJson<T>(url: string, timeoutMs = 8000): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { Accept: "application/json", "User-Agent": UA },
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

function asArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === "object") return [value as T];
  return [];
}

type PwLaunch = {
  name?: string;
  rocket?: string;
  pad?: string;
  status?: string;
  success?: boolean | null;
  details?: string | null;
  date_utc?: string | null;
  links?: { webcast?: string | null; article?: string | null };
};

function mapPwLaunch(raw: PwLaunch): Launch {
  const name = raw.name ?? "Unnamed launch";
  const rocketFromName = name.includes("|")
    ? name.split("|")[0]?.trim()
    : undefined;
  return {
    name,
    rocket: raw.rocket || rocketFromName || "Unknown",
    pad: raw.pad ?? null,
    status: raw.status ?? "Unknown",
    success: typeof raw.success === "boolean" ? raw.success : null,
    details: raw.details ?? null,
    dateUtc: raw.date_utc ?? null,
    imageUrl: null,
    webcast: raw.links?.webcast ?? null,
    article: raw.links?.article ?? null,
  };
}

type PwRocket = {
  name?: string;
  family?: string;
  launch_count?: number;
  successful_launches?: number;
  failed_launches?: number;
  success_rate_pct?: number;
  launch_cost_usd?: number | null;
  maiden_flight?: string | null;
};

function overlayFleet(pwRockets: PwRocket[]): Rocket[] {
  const byName = new Map(
    pwRockets
      .filter((r) => r.name)
      .map((r) => [r.name!.toLowerCase(), r] as const),
  );
  return SNAPSHOT_ROCKETS.filter((r) => FLEET_IDS.includes(r.id)).map((rocket) => {
    const direct = byName.get(rocket.fullName.toLowerCase()) ??
      byName.get(rocket.name.toLowerCase());
    if (!direct) return rocket;
    return {
      ...rocket,
      totalLaunches: direct.launch_count ?? rocket.totalLaunches,
      successfulLaunches: direct.successful_launches ?? rocket.successfulLaunches,
      failedLaunches: direct.failed_launches ?? rocket.failedLaunches,
      launchCostUsd: direct.launch_cost_usd ?? rocket.launchCostUsd,
      maidenFlight: direct.maiden_flight ?? rocket.maidenFlight,
    };
  });
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function scoreRocket(rocket: Rocket, query: string): SearchHit | null {
  const q = normalize(query);
  if (!q) return null;
  const name = normalize(rocket.name);
  const full = normalize(rocket.fullName);
  const family = normalize(rocket.family);
  const variant = normalize(rocket.variant);
  const aliases = rocket.aliases.map(normalize);

  if (q === name || q === full) {
    return { rocket, score: 100, reason: "exact" };
  }
  if (aliases.includes(q)) {
    return { rocket, score: 92, reason: "alias" };
  }
  if (name.startsWith(q) || full.startsWith(q)) {
    return { rocket, score: 84, reason: "prefix" };
  }
  if (aliases.some((a) => a.startsWith(q) || q.startsWith(a))) {
    return { rocket, score: 78, reason: "alias" };
  }
  if (name.includes(q) || full.includes(q) || variant.includes(q)) {
    return { rocket, score: 70, reason: "includes" };
  }
  if (family === q || (q.length >= 3 && family.startsWith(q) && !name.startsWith(q))) {
    return { rocket, score: 62, reason: "family" };
  }
  const tokens = q.split(" ").filter(Boolean);
  if (tokens.length > 1 && tokens.every((t) => `${full} ${name} ${family}`.includes(t))) {
    return { rocket, score: 66, reason: "includes" };
  }
  return null;
}

function collapseHits(hits: SearchHit[]): SearchHit[] {
  const byKey = new Map<string, SearchHit>();
  for (const hit of hits) {
    const key = `${hit.rocket.family}:${hit.rocket.name}:${hit.rocket.fullName}`;
    const prev = byKey.get(key);
    if (!prev || hit.score > prev.score) byKey.set(key, hit);
  }
  return [...byKey.values()].sort((a, b) => {
    if (b.rocket.spacex !== a.rocket.spacex) return a.rocket.spacex ? -1 : 1;
    if (b.score !== a.score) return b.score - a.score;
    return (b.rocket.totalLaunches ?? 0) - (a.rocket.totalLaunches ?? 0);
  });
}

type Ll2Launcher = {
  id: number;
  name?: string;
  full_name?: string;
  family?: string;
  variant?: string;
  reusable?: boolean;
  description?: string | null;
  image_url?: string | null;
  info_url?: string | null;
  wiki_url?: string | null;
  length?: number | null;
  diameter?: number | null;
  launch_mass?: number | null;
  leo_capacity?: number | null;
  gto_capacity?: number | null;
  to_thrust?: number | null;
  maiden_flight?: string | null;
  launch_cost?: string | number | null;
  total_launch_count?: number | null;
  successful_launches?: number | null;
  failed_launches?: number | null;
  pending_launches?: number | null;
  manufacturer?: { name?: string; abbrev?: string } | null;
};

function mapLl2(raw: Ll2Launcher): Rocket {
  const manufacturerName = raw.manufacturer?.name ?? "Unknown";
  const cost =
    typeof raw.launch_cost === "number"
      ? raw.launch_cost
      : typeof raw.launch_cost === "string"
        ? Number.parseInt(raw.launch_cost, 10) || null
        : null;
  const image = raw.image_url ?? null;
  return {
    id: raw.id,
    name: raw.name ?? "Unknown",
    fullName: raw.full_name ?? raw.name ?? "Unknown",
    family: raw.family ?? raw.name ?? "Unknown",
    variant: raw.variant ?? "",
    description: raw.description?.trim() || "No description published for this vehicle.",
    reusable: Boolean(raw.reusable),
    manufacturer: {
      name: manufacturerName,
      abbrev: raw.manufacturer?.abbrev ?? null,
    },
    spacex: manufacturerName.toLowerCase() === "spacex",
    lengthM: raw.length ?? null,
    diameterM: raw.diameter ?? null,
    massT: raw.launch_mass ?? null,
    leoKg: raw.leo_capacity ?? null,
    gtoKg: raw.gto_capacity ?? null,
    thrustKn: raw.to_thrust ?? null,
    maidenFlight: raw.maiden_flight ?? null,
    launchCostUsd: cost,
    imageUrl: image,
    gallery: uniqueImages([image]),
    infoUrl: raw.info_url ?? null,
    wikiUrl: raw.wiki_url ?? null,
    totalLaunches: raw.total_launch_count ?? null,
    successfulLaunches: raw.successful_launches ?? null,
    failedLaunches: raw.failed_launches ?? null,
    pendingLaunches: raw.pending_launches ?? null,
    aliases: [],
  };
}

async function liveLaunches(): Promise<{
  latest: Launch | null;
  next: Launch | null;
  upcoming: Launch[];
  past: Launch[];
  pwRockets: PwRocket[];
  live: boolean;
}> {
  const cached = readCache<{
    latest: Launch | null;
    next: Launch | null;
    upcoming: Launch[];
    past: Launch[];
    pwRockets: PwRocket[];
    live: boolean;
  }>("pw-board", LIVE_TTL);
  if (cached) return cached;
  try {
    const [latestRaw, nextRaw, upcomingRaw, pastRaw, rocketsRaw] = await Promise.all([
      fetchJson<PwLaunch>(`${PW}/launches/latest`),
      fetchJson<PwLaunch>(`${PW}/launches/next`),
      fetchJson<unknown>(`${PW}/launches/upcoming?limit=8`),
      fetchJson<unknown>(`${PW}/launches/past?limit=12`),
      fetchJson<unknown>(`${PW}/rockets`),
    ]);
    const payload = {
      latest: mapPwLaunch(latestRaw),
      next: mapPwLaunch(nextRaw),
      upcoming: asArray<PwLaunch>(upcomingRaw).slice(0, 8).map(mapPwLaunch),
      past: asArray<PwLaunch>(pastRaw).slice(0, 12).map(mapPwLaunch),
      pwRockets: asArray<PwRocket>(rocketsRaw),
      live: true,
    };
    return writeCache("pw-board", payload);
  } catch {
    return {
      latest: null,
      next: null,
      upcoming: [],
      past: [],
      pwRockets: [],
      live: false,
    };
  }
}

async function remoteSearch(query: string): Promise<Rocket[]> {
  const key = `ll2:${normalize(query)}`;
  const cached = readCache<Rocket[]>(key, SEARCH_TTL);
  if (cached) return cached;
  try {
    const data = await fetchJson<{ results?: Ll2Launcher[] }>(
      `${LL2}/config/launcher/?search=${encodeURIComponent(query)}&limit=8`,
      7000,
    );
    const mapped = (data.results ?? []).map(mapLl2);
    return writeCache(key, mapped);
  } catch {
    return writeCache(key, []);
  }
}

function rocketById(id: number): Rocket | null {
  return SNAPSHOT_ROCKETS.find((r) => r.id === id) ?? null;
}

function launchesFor(rocket: Rocket, pool: Launch[]): Launch[] {
  const name = rocket.name.toLowerCase();
  const full = rocket.fullName.toLowerCase();
  return pool.filter((launch) => {
    const hay = `${launch.rocket} ${launch.name}`.toLowerCase();
    if (name === "falcon 9") return hay.includes("falcon 9");
    if (name === "falcon heavy") return hay.includes("falcon heavy");
    if (name === "starship") return hay.includes("starship");
    return hay.includes(name) || hay.includes(full);
  });
}

export const getBoard = createServerFn({ method: "GET" }).handler(
  async (): Promise<Board> => {
    const live = await liveLaunches();
    return {
      fleet: overlayFleet(live.pwRockets),
      latest: live.latest,
      next: live.next,
      upcoming: uniqueLaunches(live.upcoming),
      source: live.live ? "live" : "snapshot",
      fetchedAt: new Date().toISOString(),
    };
  },
);

export const searchRockets = createServerFn({ method: "GET" })
  .validator(z.object({ q: z.string().max(80) }))
  .handler(async ({ data }): Promise<{ query: string; hits: SearchHit[] }> => {
    const query = data.q.trim();
    if (!query) {
      return {
        query,
        hits: SNAPSHOT_ROCKETS.filter((r) => FLEET_IDS.includes(r.id)).map(
          (rocket) => ({ rocket, score: 50, reason: "family" as const }),
        ),
      };
    }

    const local = SNAPSHOT_ROCKETS.map((rocket) => scoreRocket(rocket, query)).filter(
      (hit): hit is SearchHit => Boolean(hit),
    );

    const strong = local.some((hit) => hit.score >= 78);
    const remote = strong ? [] : await remoteSearch(query);
    const remoteHits: SearchHit[] = remote.map((rocket) => ({
      rocket,
      score: rocket.spacex ? 74 : 60,
      reason: "remote" as const,
    }));

    return { query, hits: collapseHits([...local, ...remoteHits]).slice(0, 8) };
  });

export const getRocket = createServerFn({ method: "GET" })
  .validator(z.object({ id: z.number().int() }))
  .handler(
    async ({
      data,
    }): Promise<{ rocket: Rocket; launches: Launch[]; upcoming: Launch[] } | null> => {
      let rocket = rocketById(data.id);
      if (!rocket) {
        const cached = readCache<Rocket>(`ll2-id:${data.id}`, SEARCH_TTL);
        if (cached) rocket = cached;
        else {
          try {
            const raw = await fetchJson<Ll2Launcher>(
              `${LL2}/config/launcher/${data.id}/`,
              7000,
            );
            rocket = writeCache(`ll2-id:${data.id}`, mapLl2(raw));
          } catch {
            return null;
          }
        }
      }

      const live = await liveLaunches();
      const pool = uniqueLaunches(
        [...live.past, live.latest, live.next, ...live.upcoming].filter(
          Boolean,
        ) as Launch[],
      );
      return {
        rocket,
        launches: launchesFor(rocket, pool).slice(0, 8),
        upcoming: launchesFor(rocket, live.upcoming).slice(0, 4),
      };
    },
  );

function uniqueLaunches(launches: Launch[]): Launch[] {
  const seen = new Set<string>();
  const out: Launch[] = [];
  for (const launch of launches) {
    const key = `${launch.name}|${launch.dateUtc ?? ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(launch);
  }
  return out;
}
