# GTA VI Trophy Guide & Tracker — v5

[![make.fun bounty](https://img.shields.io/badge/make.fun-gta6--trophy--guide--01-gold)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline guide and tracker for all **55 PlayStation 5 trophies** of Grand Theft Auto VI — 1 platinum, 2 gold, 6 silver, 46 bronze — built for the [make.fun bounty **gta6-trophy-guide-01**](https://make.fun/bounty/gta6-trophy-guide-01) ($250, top 50).

## What it does

- **Checklist** of all 55 trophies with official names, descriptions, and grades, plus PSN counters on the trophies that track a count (e.g. `87/250` stunts). Progress is saved in the browser (localStorage), with export to a file and import back.
- **Numbered, sourced guides**: every trophy has a multi-step guide in our own words, with a visible `Sources:` line naming its sources (Exophase, PSNProfiles, PowerPyx, PlayStationTrophies.org, TrueTrophies).
- **Missable warnings**: 21 missable trophies carry a warning box in their guide and on the Missables tab.
- **Roadmap to the platinum**: six stages built from the official descriptions — story, stranger strands, activities, money, exploration and oddities, then the 100% cleanup.
- **Next Up planner**: the five trophies to chase next, with a reason for each.
- **Filters**: by kind (Story, Side strand, Money, Exploration, Activity, Combat, Collectible, Oddity, Completion, Platinum), by earned/unearned/missable, and text search.
- **Spoiler-safe mode**: hides the names and descriptions of story trophies until they are earned.
- **Paper look** of its own — no Rockstar logo, official artwork, box art, or game screenshot anywhere.

## Run it

Serve `app/` with any static file server and open `index.html` — it works with the network off:

```sh
cd app && python3 -m http.server 8080
```

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored `vendor/makefun-frontend.ts`.

## License

MIT — see [LICENSE](LICENSE).
