import type { Rocket } from "./types";

const F9_GALLERY = [
  "https://thespacedevs-prod.nyc3.digitaloceanspaces.com/media/images/falcon_9_image_20230807133459.jpeg",
  "https://thespacedevs-prod.nyc3.digitaloceanspaces.com/media/images/falcon_9_liftof_image_20260816171423.jpg",
  "https://thespacedevs-prod.nyc3.digitaloceanspaces.com/media/images/falcon2520925_image_20221009234147.png",
];

const STARSHIP_GALLERY = [
  "https://thespacedevs-prod.nyc3.digitaloceanspaces.com/media/images/starship_on_the_image_20250111100520.jpg",
  "https://thespacedevs-prod.nyc3.digitaloceanspaces.com/media/images/starship_liftof_image_20240314160301.jpg",
];

export const SNAPSHOT_ROCKETS: Rocket[] = [
  {
    id: 133,
    name: "Falcon 1",
    fullName: "Falcon 1",
    family: "Falcon",
    variant: "1",
    description:
      "The Falcon 1 was the first launch vehicle developed and manufactured by SpaceX in 2006. It is an expendable, two-stage rocket where each stage is powered by a single LOX/RP-1 engine.",
    reusable: false,
    manufacturer: { name: "SpaceX", abbrev: "SpX" },
    spacex: true,
    lengthM: 22.25,
    diameterM: 1.7,
    massT: 33,
    leoKg: 470,
    gtoKg: null,
    thrustKn: 454,
    maidenFlight: "2006-03-24",
    launchCostUsd: 7_000_000,
    imageUrl:
      "https://thespacedevs-prod.nyc3.digitaloceanspaces.com/media/images/falcon_image_20190222030438.jpeg",
    gallery: [
      "https://thespacedevs-prod.nyc3.digitaloceanspaces.com/media/images/falcon_image_20190222030438.jpeg",
    ],
    infoUrl: null,
    wikiUrl: "https://en.wikipedia.org/wiki/Falcon_1",
    totalLaunches: 5,
    successfulLaunches: 2,
    failedLaunches: 3,
    pendingLaunches: 0,
    aliases: ["f1", "falcon1", "falcon-1"],
  },
  {
    id: 164,
    name: "Falcon 9",
    fullName: "Falcon 9 Block 5",
    family: "Falcon",
    variant: "Block 5",
    description:
      "Falcon 9 is a two-stage rocket designed and manufactured by SpaceX for the reliable and safe transport of satellites and the Dragon spacecraft into orbit. Block 5 is the operational, rapidly reusable variant.",
    reusable: true,
    manufacturer: { name: "SpaceX", abbrev: "SpX" },
    spacex: true,
    lengthM: 70,
    diameterM: 3.65,
    massT: 549,
    leoKg: 22_800,
    gtoKg: 8_300,
    thrustKn: 7_607,
    maidenFlight: "2018-05-11",
    launchCostUsd: 52_000_000,
    imageUrl: F9_GALLERY[0] ?? null,
    gallery: F9_GALLERY,
    infoUrl: "https://www.spacex.com/vehicles/falcon-9/",
    wikiUrl: "https://en.wikipedia.org/wiki/Falcon_9",
    totalLaunches: 627,
    successfulLaunches: 626,
    failedLaunches: 1,
    pendingLaunches: 109,
    aliases: ["f9", "falcon9", "falcon-9", "block 5", "block5"],
  },
  {
    id: 161,
    name: "Falcon Heavy",
    fullName: "Falcon Heavy",
    family: "Falcon",
    variant: "Heavy",
    description:
      "Falcon Heavy is a Falcon 9 core with two additional Falcon 9-derived side boosters. It is the most powerful operational rocket in the SpaceX fleet.",
    reusable: true,
    manufacturer: { name: "SpaceX", abbrev: "SpX" },
    spacex: true,
    lengthM: 70,
    diameterM: 12.2,
    massT: 1_400,
    leoKg: 63_800,
    gtoKg: 26_700,
    thrustKn: 22_819,
    maidenFlight: "2018-02-06",
    launchCostUsd: 90_000_000,
    imageUrl:
      "https://thespacedevs-prod.nyc3.digitaloceanspaces.com/media/images/falcon_heavy_image_20220129192819.jpeg",
    gallery: [
      "https://thespacedevs-prod.nyc3.digitaloceanspaces.com/media/images/falcon_heavy_image_20220129192819.jpeg",
    ],
    infoUrl: "https://www.spacex.com/vehicles/falcon-heavy/",
    wikiUrl: "https://en.wikipedia.org/wiki/Falcon_Heavy",
    totalLaunches: 12,
    successfulLaunches: 12,
    failedLaunches: 0,
    pendingLaunches: 14,
    aliases: ["fh", "heavy", "falconheavy", "falcon-heavy"],
  },
  {
    id: 527,
    name: "Starship",
    fullName: "Starship V2",
    family: "Starship",
    variant: "V2",
    description:
      "Starship is SpaceX's fully reusable two-stage super heavy-lift vehicle — the ship stacked on a Super Heavy booster — built to carry crew and cargo to Earth orbit, the Moon, and Mars.",
    reusable: true,
    manufacturer: { name: "SpaceX", abbrev: "SpX" },
    spacex: true,
    lengthM: 123.3,
    diameterM: 9,
    massT: 5_000,
    leoKg: 35_000,
    gtoKg: null,
    thrustKn: 73_550,
    maidenFlight: "2025-01-16",
    launchCostUsd: null,
    imageUrl: STARSHIP_GALLERY[0] ?? null,
    gallery: STARSHIP_GALLERY,
    infoUrl: "https://www.spacex.com/vehicles/starship",
    wikiUrl: "https://en.wikipedia.org/wiki/SpaceX_Starship",
    totalLaunches: 5,
    successfulLaunches: 2,
    failedLaunches: 3,
    pendingLaunches: 0,
    aliases: ["ss", "star ship", "super heavy", "bfr", "v2"],
  },
  {
    id: 464,
    name: "Starship",
    fullName: "Starship V1",
    family: "Starship",
    variant: "V1",
    description:
      "First development version of the Starship reusable two-stage super heavy-lift launch vehicle.",
    reusable: true,
    manufacturer: { name: "SpaceX", abbrev: "SpX" },
    spacex: true,
    lengthM: 121.3,
    diameterM: 9,
    massT: 5_000,
    leoKg: 15_000,
    gtoKg: null,
    thrustKn: 73_550,
    maidenFlight: "2023-04-20",
    launchCostUsd: null,
    imageUrl: STARSHIP_GALLERY[1] ?? STARSHIP_GALLERY[0] ?? null,
    gallery: STARSHIP_GALLERY,
    infoUrl: "https://www.spacex.com/vehicles/starship",
    wikiUrl: "https://en.wikipedia.org/wiki/SpaceX_Starship",
    totalLaunches: 6,
    successfulLaunches: 4,
    failedLaunches: 2,
    pendingLaunches: 0,
    aliases: ["v1", "starship v1", "ift"],
  },
  {
    id: 200,
    name: "Vulcan",
    fullName: "Vulcan Centaur",
    family: "Vulcan",
    variant: "Centaur",
    description:
      "United Launch Alliance's Vulcan Centaur — a next-generation expendable launcher. It is not a SpaceX vehicle; it sits in this index so a name search still returns a rocket, the way the original gallery was meant to.",
    reusable: false,
    manufacturer: { name: "United Launch Alliance", abbrev: "ULA" },
    spacex: false,
    lengthM: 61.6,
    diameterM: 5.4,
    massT: 546,
    leoKg: 27_200,
    gtoKg: 15_300,
    thrustKn: 17_000,
    maidenFlight: "2024-01-08",
    launchCostUsd: null,
    imageUrl:
      "https://thespacedevs-prod.nyc3.digitaloceanspaces.com/media/images/vulcan_image_20240107162928.jpeg",
    gallery: [
      "https://thespacedevs-prod.nyc3.digitaloceanspaces.com/media/images/vulcan_image_20240107162928.jpeg",
    ],
    infoUrl: "https://www.ulalaunch.com/rockets/vulcan-centaur",
    wikiUrl: "https://en.wikipedia.org/wiki/Vulcan_Centaur",
    totalLaunches: null,
    successfulLaunches: null,
    failedLaunches: null,
    pendingLaunches: null,
    aliases: ["vulcan centaur", "vc", "ula", "vulcan-centaur"],
  },
];

export const FLEET_IDS = [133, 164, 161, 527];

export function uniqueImages(urls: Array<string | null | undefined>): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const url of urls) {
    if (!url) continue;
    if (seen.has(url)) continue;
    seen.add(url);
    out.push(url);
  }
  return out;
}
