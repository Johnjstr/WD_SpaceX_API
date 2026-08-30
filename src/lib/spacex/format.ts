export function formatNumber(value: number | null | undefined, unit?: string): string {
  if (value == null || Number.isNaN(value)) return "—";
  const formatted = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(value);
  return unit ? `${formatted} ${unit}` : formatted;
}

export function formatUsd(value: number | null | undefined): string {
  if (value == null) return "—";
  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    return `$${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(millions)}M`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "TBD";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(date);
}

export function formatShortDate(iso: string | null | undefined): string {
  if (!iso) return "TBD";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function pad2(n: number): string {
  return String(Math.max(0, n)).padStart(2, "0");
}

export function countdownParts(targetIso: string | null, now = Date.now()) {
  if (!targetIso) return null;
  const target = new Date(targetIso).getTime();
  if (Number.isNaN(target)) return null;
  const diff = target - now;
  const past = diff < 0;
  const abs = Math.abs(diff);
  const totalSec = Math.floor(abs / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  return { past, days, hours, minutes, seconds };
}

export function missionName(full: string): { vehicle: string; mission: string } {
  const idx = full.indexOf("|");
  if (idx === -1) return { vehicle: full, mission: full };
  return {
    vehicle: full.slice(0, idx).trim(),
    mission: full.slice(idx + 1).trim(),
  };
}
