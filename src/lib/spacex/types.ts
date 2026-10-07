export type Manufacturer = {
  name: string;
  abbrev?: string | null;
};

export type Rocket = {
  id: number;
  name: string;
  fullName: string;
  family: string;
  variant: string;
  description: string;
  reusable: boolean;
  manufacturer: Manufacturer;
  spacex: boolean;
  lengthM: number | null;
  diameterM: number | null;
  massT: number | null;
  leoKg: number | null;
  gtoKg: number | null;
  thrustKn: number | null;
  maidenFlight: string | null;
  launchCostUsd: number | null;
  imageUrl: string | null;
  gallery: string[];
  infoUrl: string | null;
  wikiUrl: string | null;
  totalLaunches: number | null;
  successfulLaunches: number | null;
  failedLaunches: number | null;
  pendingLaunches: number | null;
  aliases: string[];
};

export type Launch = {
  name: string;
  rocket: string;
  pad: string | null;
  status: string;
  success: boolean | null;
  details: string | null;
  dateUtc: string | null;
  imageUrl: string | null;
  webcast: string | null;
  article: string | null;
};

export type SearchHit = {
  rocket: Rocket;
  score: number;
  reason: "exact" | "alias" | "prefix" | "includes" | "family" | "remote";
};

export type Board = {
  fleet: Rocket[];
  latest: Launch | null;
  next: Launch | null;
  upcoming: Launch[];
  source: "live" | "snapshot";
  fetchedAt: string;
};
