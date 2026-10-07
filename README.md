# Hawthorne

2026 revival of this repo’s original **Space X Photos** project — a 2020
bootcamp gallery that called `api.spacexdata.com/v3/rockets` and dumped
Flickr stills onto the page.

Hawthorne is a range console for the fleet:

- Search a rocket by name (Falcon 1, Falcon 9, Falcon Heavy, Starship, plus other launchers)
- Open the vehicle dossier: gallery, specs, related launches
- Follow the live next / latest launch board with a countdown
- Fall back to a local fleet snapshot if live feeds are down

The original 2020 site is unchanged under [`legacy/`](legacy/).

## Why the rewrite

The v3 SpaceX API this project was built against is gone. Search never
filtered by the typed name, and the gallery always showed the same four
images. Hawthorne keeps the original idea — type a rocket, view the
gallery — and makes that path actually work.

## Stack

React 19, TanStack Start, Tailwind v4. Live launch stats come from a
SpaceX v4-compatible feed; vehicle search can also query Launch Library 2
when the local fleet does not match.

## Original (2020)

| File | Role |
| --- | --- |
| `legacy/index.html` | Bootstrap jumbotron + search form |
| `legacy/index.js` | Fetch all rockets, always append four Flickr images |
| `legacy/index.css` | Lobster / powder-blue styling |

## Layout (this branch)

```
legacy/                 2020 Space X Photos
src/components/range/   search, fleet grid, dossier, lightbox
src/lib/spacex/         live + snapshot data layer
src/routes/             Hawthorne home
public/                 brand assets
```
