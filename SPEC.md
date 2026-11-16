# jews.farm — Reverse-Engineered Mechanics Spec

A clean-room reimplementation of FarmVille 1's game design, themed for Israel. All mechanics
and numbers below are extracted from the preservation repos, not invented.

## Sources (evidence)
- `study/farmvillage/` — original FarmVille 1 SWF + Python server (`commands.py`, `player.py`,
  `engine.py`, `game_settings.py`, `items.py`, `quests.py`, `storage.py`) + `extracted/` (zlib-decompressed
  `gameSettings.xml`, `gameSettingsCMS.xml`, `MarketData.xml`, `AnimalBreeding.xml`, `crafting.xml`,
  `collections.xml`, `questSettings_0.xml`).
- `study/fv-replowed/` — Laravel/AMFPHP revival: `public/farmville/xml/gz/v855038/items.xml` (17,120
  lines, authoritative per-item economy), `flashservices/amfphp/Helpers/` (`market_transactions.php`,
  `user_resources.php`, `constants.php`), `props/gameSettings.json`.

## Currency
- **Shekel (₪)** = coins (`gold`). **Sela** = premium cash. Soft cap 999,999,999; premium cap 99,999.
- Starting: **200 coins, 5 Sela, level 1, 0 XP** (gameSettingsCMS `startingGold=200`, `startingCash=5`).

## Core loop (actions)
| Action | Cost | Gain |
|---|---|---|
| Plow | −15 coins | +1 XP |
| Plant seed | −`cost` coins | +`plantXp` XP |
| Harvest crop | — | +`coinYield` coins (no XP) |
| Buy/place tree-animal-decor | −`cost` coins | +`cost/100` XP (buyXpGainRatio 0.01) |
| Harvest tree/animal | — | +`coinYield` coins |
| Sell object | — | +5% of cost |

## Growth & wither
- `<growTime>` is in **in-game days**; 1 day = **82,800 s (23 h)** (gameSettingsCMS `inGameDaySeconds`).
- **Wither at growTime × 2.2** (`witherMultiplier`), ±0.5 random range (`witherRandomRange`).
- Plot state machine: `fallow → plowed → planted → {grown | withered} → fallow`.

## Leveling
- Fixed 100-entry table (`user_resources.php deriveLevel`); L1=0 … L100=1,387,500 XP.
- **+1 Sela per level gained**.

## Content (real stats)
- **73 crops** (`items.xml type="seed"`) — e.g. wheat 35₪/3d/115₪/2xp, grapes 85₪/1d/270₪/2xp,
  watermelon 130₪/4d/348₪/2xp, strawberry 10₪/0.174d/35₪/1xp.
- **36 trees** (olive 1200₪/4d/112₪, pomegranate 1075₪/5d/108₪, date 800₪/3d/69₪, fig 375₪/3d/33₪).
- **Animals** (chicken 400₪/1d/8₪ Eggs, cow 300₪/1d/6₪ Milk, sheep 700₪/3d/28₪ Wool, goat 1800₪/2d/54₪).
- **Animal breeding** (sheep/pig/turtle pens): base success 0.5, breed 24h, 14 colors + pattern genes.
- **Crafting**: tax 20%, bushel capacity 400, skill levels 1–5, recipe MinutesToCook 45–4320.
- **Quests**: 3233 story quests; chains via `children` + `quest_complete` prereqs; task actions
  (`plowPlot`, `plantCropByCode`, `harvestByCode`, `useItemByCode`, `buyItemByCode`, …); skip = 5 cash.
- **Daily gift**: 1–5 cash / 100–1000 coins.

## Theme mapping
- Seven Species: wheat (חיטה), barley→mapped grain, grapes (ענבים), figs (תאנה), pomegranates (רימון),
  olives (זית), dates (תמר). Plus etrog, Jaffa oranges, almonds, chickpeas, sabra (צבר), etc.
- Premium coin = **Sela** (סלע). Soft = Shekel (₪). Festivals anchor the quest chapters.

## Stack
Vite + TypeScript, custom Canvas 2D isometric renderer (no framework), touch-first pointer events,
DPR-capped, localStorage save, static deploy. Build ~9 kB gzip JS.
