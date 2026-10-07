import { createFileRoute } from "@tanstack/react-router";
import { Explorer } from "@/components/range/explorer";
import { getBoard } from "@/lib/spacex/api";

export const Route = createFileRoute("/")({
  loader: () => getBoard(),
  component: Home,
  pendingComponent: PendingBoard,
});

function Home() {
  const board = Route.useLoaderData();
  return <Explorer board={board} />;
}

function PendingBoard() {
  return (
    <main className="flex min-h-dvh items-end bg-bg px-6 py-16 text-fg">
      <div>
        <p className="font-mono text-[0.6875rem] tracking-[0.22em] text-muted uppercase">
          Range · SpaceX fleet
        </p>
        <h1 className="mt-3 font-display text-5xl font-semibold tracking-tight">HAWTHORNE</h1>
        <p className="mt-3 text-sm text-muted">Opening the index…</p>
      </div>
    </main>
  );
}
