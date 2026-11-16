# jews.farm 🌾

A clean-room, reverse-engineered **FarmVille 1** clone, themed as an Israeli kibbutz. Built to be
served at [jews.farm](https://jews.farm) — single-player, no backend, ~19 kB gzip, and fast on iPhone.

The mechanics and economy are extracted from the original FarmVille 1 preservation projects
([AcidCaos/farmvillage](https://github.com/AcidCaos/farmvillage) and
[FV-Replowed/fv-replowed](https://github.com/FV-Replowed/fv-replowed)), not copied. Full design
notes + evidence are in [`SPEC.md`](SPEC.md).

## Features

- **Core loop** — plow → seed → grow → wither → harvest, with 73 crops, 36 trees, and 11 animals
  using the real FarmVille economy (prices, grow times, XP, unlock levels).
- **Economy** — Shekel (₪) soft currency + **Sela** premium coin, XP/levels (100-entry table),
  +1 Sela per level-up, bushels, daily gifts, ribbons/achievements.
- **Storyline** — a 20-quest festival campaign (Aliyah → Shavuot → Sukkot → Tu BiShvat →
  Rosh Hashanah → Shmita).
- **Depth** — sheep breeding (14 colors × 5 pattern genes), crafting (bakery/winery/oil-press,
  7 recipes), market stall (bushels), NPC neighbors (visit/water/help), land expansion.
- **Theme** — Saba Moishe (סבא מוישה) narrates in Yiddish/Hebrew-English; kibbutz farmer avatar
  (kippah + tzitzit); the Seven Species; Star-of-David icon.
- **iOS/WebKit first** — touch-first pointer input, DPR-capped canvas, safe-area insets,
  PWA manifest + icons, ~60fps, zero image downloads (procedural canvas art).

## Stack

Vite + TypeScript, custom Canvas 2D isometric renderer, localStorage save. No framework, no
backend, no asset downloads.

## Run locally

```bash
npm install
npm run dev        # http://127.0.0.1:5173
```

## Build & deploy

```bash
npm run build      # -> dist/ (static site)
```

Upload `dist/` to any static host. See [`DEPLOY.md`](DEPLOY.md) for details (domain + HTTPS + PWA).

## Layout

```
src/
  game/          # types, data (crops/trees/animals/recipes/quests/neighbors), systems
  render/        # isometric renderer, procedural art + palette, farmer avatar
  core/          # input (touch/gestures), save
  ui/            # HUD, dialogue, quests
  main.ts        # game loop + wiring
```
