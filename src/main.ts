import './style.css';
import { Renderer } from './render/renderer';
import { CROP_COLORS } from './render/palette';
import { icon } from './ui/icons';
import { Input } from './core/input';
import type { FarmState, PlacedObject } from './game/types';
import { CROPS, unlockedCrops } from './game/data/crops';
import { ITEMS, itemList } from './game/data/items';
import { RECIPES, recipesFor } from './game/data/recipes';
import { makeNeighbors, type Neighbor } from './game/data/neighbors';
import { cropStage, objectState } from './game/systems/growth';
import { plow, plant, harvest, clearPlot, placeObject, harvestObject, sellObject, instagrow, INSTAGROW_COST, fertilize, FERTILIZE_COST, harvestAllReady, countReadyCrops, unwither, UNWITHER_COST } from './game/systems/farming';
import { spendFuel, plowArea, plantAllPlowed, countPlowed, TRACTOR_FUEL, SEEDER_FUEL, HARVESTER_FUEL } from './game/systems/vehicles';
import { checkCollections, COLLECTIONS, collectionProgress } from './game/systems/collections';
import { addCoins, addXp, PLOW_COST } from './game/systems/economy';
import { saveState, loadState, clearSave } from './core/save';
import { unlock, playPlant, playHarvest, playLevelUp, playError, toggleMute, isMuted, playQuest, playRibbon, playBuy, playFertilize, playInstagrow, playCoin } from './core/audio';
import { TIPS } from './game/data/tips';
import { Hud } from './ui/hud';
import { DialogueBox } from './ui/dialogue';
import { QuestPanel } from './ui/quests';
import { SABA_MOISHE, lines } from './game/dialogue';
import { initQuestState, recordTask, currentQuest, isComplete, completeQuest } from './game/systems/quests';
import { claimDailyGift, dailyRewardDue, rewardForDay, upcomingGiftDay } from './game/systems/gifts';
import { computeReturnSummary } from './game/systems/summary';
import { checkRibbons } from './game/systems/collections';
import { hasBreedPair, startBreeding, collectLamb } from './game/systems/breeding';
import { bushelCount, craftCount, sellProduce } from './game/systems/market';
import { canCraft, startCraft, collectCrafts } from './game/systems/crafting';
import { waterNeighborCrop, helpHarvestNeighbor, neighborAnimalAct } from './game/systems/neighbors';
import { expandFarm, expansionCost } from './game/systems/expand';

declare global {
  interface Window {
    __farm?: {
      state: FarmState;
      save: () => void;
      renderer: Renderer;
      showBreedingModal: (pen: PlacedObject) => void;
      showMarketModal: () => void;
      showCraftingModal: (buildingId: string, buildingObjId: number) => void;
      showNeighborsModal: () => void;
    };
  }
}

function newState(): FarmState {
  const cols = 12;
  const rows = 12;
  return {
    cols,
    rows,
    plots: new Array<null>(cols * rows).fill(null),
    objects: [],
    coins: 200,
    sela: 5,
    xp: 0,
    level: 1,
    fuel: 20,
    maxFuel: 20,
    quests: initQuestState(),
    stats: { plows: 0, plants: 0, harvests: 0, objects: 0, coinsEarned: 0 },
    ribbons: [],
    giftStreak: 0,
    tutorial: { step: 0, done: false },
    mastery: {},
    sheepColors: [],
    collectionsDone: [],
    bushels: {},
    crafts: {},
    craftQueue: [],
  };
}

const app = document.getElementById('app');
if (!app) throw new Error('#app missing');

const renderer = new Renderer(app);
const hud = new Hud(app);
const dialogue = new DialogueBox(app);
const questPanel = new QuestPanel(app);

const loaded = loadState();
const state: FarmState = loaded ?? newState();
if (!state.quests) state.quests = initQuestState();
if (!state.stats) state.stats = { plows: 0, plants: 0, harvests: 0, objects: 0, coinsEarned: 0 };
if (!state.ribbons) state.ribbons = [];
if (!state.bushels) state.bushels = {};
if (!state.crafts) state.crafts = {};
if (!state.craftQueue) state.craftQueue = [];
if (state.giftStreak == null) state.giftStreak = 0;
if (state.tutorial == null) state.tutorial = { step: 0, done: true };
if (!state.mastery) state.mastery = {};
if (!state.sheepColors) state.sheepColors = [];
if (!state.collectionsDone) state.collectionsDone = [];
if (state.fuel == null) {
  state.fuel = 20;
  state.maxFuel = 20;
}

const neighbors = makeNeighbors();
let pendingItem: string | null = null;
let lastLevel = state.level;
let viewing: Neighbor | null = null;

function save(): void {
  saveState(state);
}

function celebrateLevel(level: number): void {
  const el = document.createElement('div');
  el.id = 'levelup';
  el.textContent = `LEVEL ${level}!`;
  document.body.appendChild(el);
  window.setTimeout(() => el.remove(), 1900);
}

function postAction(): void {
  if (state.level > lastLevel) {
    playLevelUp();
    celebrateLevel(state.level);
    dialogue.say(SABA_MOISHE, lines.levelUp());
    const unlocked = unlocksAt(state.level);
    if (unlocked.length) {
      window.setTimeout(() => hud.toast(`Unlocked: ${unlocked.join(', ')}`), 1000);
    }
    lastLevel = state.level;
  }
  const earned = checkRibbons(state);
  if (earned.length) {
    playRibbon();
    const r = earned[earned.length - 1];
    dialogue.say(SABA_MOISHE, `Ribbon earned: ${r.name} \u2014 ${r.desc}. Mazel tov!`);
  }
  const collections = checkCollections(state);
  if (collections.length) {
    playRibbon();
    const c = collections[collections.length - 1];
    dialogue.say(SABA_MOISHE, `Collection complete: ${c.name}! +${c.coins}\u20aa +${c.sela} Sela.`);
  }
  save();
}

function finishAction(): void {
  const q = currentQuest(state.quests);
  const done = q && isComplete(q, state.quests);
  if (done && q) completeQuest(state, q);
  postAction();
  if (done && q) {
    playQuest();
    dialogue.say(SABA_MOISHE, `Mazel tov! "${q.name}" complete \u2014 kol hakavod!`);
  }
}

function sellObjectAt(id: number, name: string, cost: number): void {
  hud.confirm(name, `Sell it for ${Math.round(cost * 0.05)}\u20aa?`, 'Sell', () => {
    const r = sellObject(state, id);
    if (r.ok) playCoin();
    hud.toast(r.message ?? 'Sold!');
    postAction();
  });
}

function showBreedingModal(pen: PlacedObject): void {
  const now = Date.now();
  if (pen.breeding && now < pen.breeding) {
    const remain = Math.max(1, Math.ceil((pen.breeding - now) / 60000));
    hud.modal('Sheep Pen', [['Breeding', `~${remain}m remaining`]], []);
    return;
  }
  if (pen.breeding && now >= pen.breeding) {
    hud.modal('Sheep Pen', [['A lamb is ready!', '']], [
      {
        label: 'Collect Lamb',
        primary: true,
        cb: () => {
          const ok = collectLamb(state, pen, Date.now());
          hud.toast(ok ? 'Mazel tov! A new lamb joined the flock.' : 'No empty tile nearby \u2014 clear some space.');
          postAction();
        },
      },
    ]);
    return;
  }
  const pair = hasBreedPair(state);
  hud.modal(
    'Sheep Pen',
    [
      ['Ram', state.objects.some((o) => o.itemId === 'ram') ? '\u2713' : '\u2717'],
      ['Ewe', state.objects.some((o) => o.itemId === 'ewe') ? '\u2713' : '\u2717'],
      ['Breeding time', '24 hours'],
    ],
    pair
      ? [
          {
            label: 'Breed',
            primary: true,
            cb: () => {
              if (startBreeding(pen, Date.now())) {
                hud.toast('Breeding started! Come back in a day.');
                save();
              }
            },
          },
        ]
      : [],
  );
}

function showMarketModal(): void {
  const bc = bushelCount(state);
  const cc = craftCount(state);
  const rows: Array<[string, string]> = [
    ['Bushels', `${bc}`],
    ['Crafted goods', `${cc}`],
  ];
  hud.modal(
    'Market Stall',
    rows,
    bc + cc > 0
      ? [
          {
            label: 'Sell all produce',
            primary: true,
            cb: () => {
              const gained = sellProduce(state);
              hud.toast(gained > 0 ? `Sold! +${gained}\u20aa` : 'Nothing to sell yet.');
              postAction();
            },
          },
        ]
      : [],
  );
}

function showCraftingModal(buildingId: string, buildingObjId: number): void {
  const body = hud.beginModal(ITEMS[buildingId].name);
  const now = Date.now();

  const ready = state.craftQueue.filter((j) => j.buildingId === buildingObjId && j.finishAt <= now);
  if (ready.length) {
    const btn = document.createElement('button');
    btn.textContent = `Collect ${ready.length} ready`;
    btn.style.cssText =
      'grid-column:1/-1;padding:12px;border:0;border-radius:12px;background:#2e7d32;color:#fff;font-weight:700;';
    btn.addEventListener('click', () => {
      const done = collectCrafts(state, buildingObjId, Date.now());
      hud.toast(`Collected ${done.length} craft${done.length === 1 ? '' : 's'}!`);
      postAction();
      showCraftingModal(buildingId, buildingObjId);
    });
    body.appendChild(btn);
  }

  for (const r of recipesFor(buildingId)) {
    const have = state.bushels[r.input] ?? 0;
    const row = document.createElement('div');
    row.style.cssText =
      'grid-column:1/-1;display:flex;justify-content:space-between;align-items:center;gap:8px;padding:8px 4px;border-bottom:1px solid rgba(0,0,0,0.08);';
    row.innerHTML = `<div><div style="font-weight:600">${r.name} <small style="color:#888">${r.hebrew}</small></div><div style="font-size:12px;color:#666">${have}/${r.inputQty} ${r.input} \u00b7 ${Math.round(r.cookSeconds / 60)}m \u00b7 ${r.outputValue}\u20aa</div></div>`;
    const craftBtn = document.createElement('button');
    craftBtn.textContent = 'Craft';
    craftBtn.disabled = !canCraft(state, r.id);
    craftBtn.style.cssText = `padding:8px 12px;border:0;border-radius:10px;font-weight:700;${
      canCraft(state, r.id) ? 'background:#0038b8;color:#fff;' : 'background:#ddd;color:#999;'
    }`;
    craftBtn.addEventListener('click', () => {
      if (startCraft(state, r.id, buildingObjId, Date.now())) {
        hud.toast(`Crafting ${r.name}...`);
        save();
      }
      showCraftingModal(buildingId, buildingObjId);
    });
    row.appendChild(craftBtn);
    body.appendChild(row);
  }

  for (const j of state.craftQueue.filter((x) => x.buildingId === buildingObjId && x.finishAt > now)) {
    const r = RECIPES.find((x) => x.id === j.recipeId);
    const remain = Math.max(1, Math.ceil((j.finishAt - now) / 60000));
    const row = document.createElement('div');
    row.style.cssText = 'grid-column:1/-1;padding:6px 4px;font-size:12px;color:#b8860b;';
    row.textContent = `\u23f3 ${r?.name ?? j.recipeId} \u2014 ${remain}m`;
    body.appendChild(row);
  }

  const close = document.createElement('button');
  close.textContent = 'Close';
  close.style.cssText =
    'grid-column:1/-1;padding:10px;border:0;border-radius:12px;background:rgba(0,0,0,0.08);color:#1b2a1e;';
  close.addEventListener('click', () => hud.hideModal());
  body.appendChild(close);
}

function showNeighborsModal(): void {
  hud.modal(
    'Neighbors',
    neighbors.map((n) => [n.persona.name, n.persona.role] as [string, string]),
    neighbors.map((n) => ({
      label: `Visit ${n.persona.name}`,
      cb: () => {
        setViewing(n);
        hud.toast(`Visiting ${n.persona.name} \u2014 tap crops to water or help harvest.`);
      },
    })),
  );
}

const TUTORIAL_TEXT = [
  'Shalom! Tap an empty grass tile to plow it.',
  'Now tap the plowed plot to plant a seed.',
  'Your crop is growing \u2014 tap it when it\u2019s ready to harvest.',
];

function advanceTutorial(): void {
  if (state.tutorial.done) return;
  state.tutorial.step++;
  if (state.tutorial.step >= 3) state.tutorial.done = true;
}

function showReturnModal(): boolean {
  const summary = computeReturnSummary(state, Date.now());
  const due = dailyRewardDue(state);
  const hasSummary = summary.ready + summary.growing + summary.withered > 0;
  if (!hasSummary && !due) return false;
  const rows: Array<[string, string]> = [];
  if (summary.ready) rows.push(['Finished while away', summary.readyNames.join(', ')]);
  if (summary.growing) rows.push(['Still growing', `${summary.growing}`]);
  if (summary.withered) rows.push(['Withered', `${summary.withered}`]);
  if (due) {
    const day = upcomingGiftDay(state);
    const r = rewardForDay(day);
    rows.push([`Daily reward (Day ${day})`, `+${r.coins}\u20aa +${r.sela} Sela`]);
  }
  hud.modal(
    'Welcome back!',
    rows,
    due
      ? [
          {
            label: 'Claim daily reward',
            primary: true,
            cb: () => {
              const g = claimDailyGift(state);
              if (g) {
                hud.toast(`+${g.coins}\u20aa +${g.sela} Sela!`);
                postAction();
              }
            },
          },
        ]
      : [{ label: 'OK', primary: true, cb: () => {} }],
  );
  return true;
}

let tipIndex = Math.floor(Math.random() * TIPS.length);

function showTipModal(): void {
  const body = hud.beginModal('Tip');
  const p = document.createElement('p');
  p.style.cssText = 'grid-column:1/-1;padding:12px 4px;font-size:15px;line-height:1.45;';
  p.textContent = TIPS[tipIndex];
  body.appendChild(p);
  const next = document.createElement('button');
  next.textContent = 'Another tip';
  next.style.cssText = 'grid-column:1/-1;padding:12px;border:0;border-radius:12px;background:#0038b8;color:#fff;font-weight:700;font-size:15px;';
  next.addEventListener('click', () => {
    tipIndex = (tipIndex + 1) % TIPS.length;
    showTipModal();
  });
  body.appendChild(next);
  const close = document.createElement('button');
  close.textContent = 'Close';
  close.style.cssText = 'grid-column:1/-1;padding:10px;border:0;border-radius:12px;background:rgba(0,0,0,0.08);color:#1b2a1e;';
  close.addEventListener('click', () => hud.hideModal());
  body.appendChild(close);
}

function showHarvesterModal(): void {
  const ready = countReadyCrops(state, Date.now());
  hud.modal(
    'Harvester',
    [['Ready crops', `${ready}`], ['Fuel', `${state.fuel}/${state.maxFuel}`]],
    ready > 0
      ? [
          {
            label: `Harvest all ${ready} (${HARVESTER_FUEL} fuel)`,
            primary: true,
            cb: () => {
              if (!spendFuel(state, HARVESTER_FUEL)) {
                hud.toast('Not enough fuel.');
                return;
              }
              const n = harvestAllReady(state, Date.now());
              playHarvest();
              hud.toast(`Harvested ${n} crop${n === 1 ? '' : 's'}!`);
              finishAction();
            },
          },
        ]
      : [{ label: 'Nothing ready yet', cb: () => {} }],
  );
}

function showTractorModal(obj: PlacedObject): void {
  hud.modal(
    'Tractor',
    [['Plows a 3x3 patch', `Costs ${TRACTOR_FUEL} fuel`], ['Fuel', `${state.fuel}/${state.maxFuel}`]],
    [
      {
        label: `Plow (${TRACTOR_FUEL} fuel)`,
        primary: true,
        cb: () => {
          if (!spendFuel(state, TRACTOR_FUEL)) {
            hud.toast('Not enough fuel.');
            return;
          }
          const n = plowArea(state, obj.col, obj.row);
          playPlant();
          hud.toast(n > 0 ? `Plowed ${n} plots!` : 'No empty tiles nearby.');
          finishAction();
        },
      },
    ],
  );
}

function showSeederModal(): void {
  if (countPlowed(state) === 0) {
    hud.modal('Seeder', [['No plowed plots', 'Plow some land first']], [{ label: 'Close', cb: () => {} }]);
    return;
  }
  hud.showSeeds(unlockedCrops(state.level), state.level, state.mastery, (cropId) => {
    if (!spendFuel(state, SEEDER_FUEL)) {
      hud.toast('Not enough fuel.');
      return;
    }
    const n = plantAllPlowed(state, cropId, Date.now());
    playPlant();
    hud.toast(n > 0 ? `Seeded ${n} plots!` : 'Not enough coins for seeds.');
    finishAction();
  });
}

function unlocksAt(level: number): string[] {
  const names: string[] = [];
  for (const c of Object.values(CROPS)) if (c.unlockLevel === level) names.push(c.name);
  for (const i of Object.values(ITEMS)) if (i.unlockLevel === level) names.push(i.name);
  return names;
}

function showSettingsModal(): void {
  hud.modal(
    'Settings',
    [['Sound', isMuted() ? 'Off' : 'On']],
    [
      { label: isMuted() ? 'Turn sound on' : 'Turn sound off', cb: () => { toggleMute(); showSettingsModal(); } },
      { label: 'Tips & help', cb: () => showTipModal() },
      { label: 'Collections', cb: () => showCollectionsModal() },
      { label: 'Reset farm', cb: () => { if (window.confirm('Start your farm over?')) { clearSave(); location.reload(); } } },
      { label: 'Close', primary: true, cb: () => {} },
    ],
  );
}

function showCollectionsModal(): void {
  const rows: Array<[string, string]> = COLLECTIONS.map((c) => {
    const done = state.collectionsDone.includes(c.id);
    const value = `${collectionProgress(state, c)}/${c.total}${done ? ' \u00b7 Done' : ''}`;
    return [c.name, value];
  });
  hud.modal('Collections', rows, [{ label: 'Close', primary: true, cb: () => {} }]);
}

function setViewing(n: Neighbor | null): void {
  viewing = n;
  backBtn.style.display = n ? '' : 'none';
  storeBtn.style.display = n ? 'none' : '';
  neighborsBtn.style.display = n ? 'none' : '';
  expandBtn.style.display = n ? 'none' : '';
  renderer.fit(n ? n.farm : state);
}

function handleNeighborTap(col: number, row: number): void {
  const farm = viewing!.farm;
  if (col < 0 || row < 0 || col >= farm.cols || row >= farm.rows) return;
  const now = Date.now();
  const plot = farm.plots[col + row * farm.cols];
  const obj = farm.objects.find((o) => o.col === col && o.row === row);
  if (plot && plot.state === 'planted') {
    const crop = CROPS[plot.cropId ?? ''];
    if (crop) {
      const st = cropStage(crop, plot.plantedAt ?? now, now, plot.watered);
      const r = st.grown || st.withered
        ? helpHarvestNeighbor(farm, col, row, now)
        : waterNeighborCrop(farm, col, row, now);
      if (r.ok) {
        addCoins(state, r.coins);
        addXp(state, r.xp);
      }
      hud.toast(r.message);
      postAction();
    }
    return;
  }
  if (obj) {
    const r = neighborAnimalAct(farm, obj.id, now);
    if (r.ok) {
      addCoins(state, r.coins);
      addXp(state, r.xp);
    }
    hud.toast(r.message);
    postAction();
    return;
  }
  hud.toast('Nothing to do here.');
}

function handleBuildingTap(obj: PlacedObject): void {
  switch (obj.itemId) {
    case 'sheep_pen':
      showBreedingModal(obj);
      break;
    case 'market_stall':
      showMarketModal();
      break;
    case 'bakery':
    case 'winery':
    case 'oil_press':
      showCraftingModal(obj.itemId, obj.id);
      break;
    case 'harvester':
      showHarvesterModal();
      break;
    case 'tractor':
      showTractorModal(obj);
      break;
    case 'seeder':
      showSeederModal();
      break;
    default:
      sellObjectAt(obj.id, ITEMS[obj.itemId].name, ITEMS[obj.itemId].cost);
  }
}

function handleTap(col: number, row: number): void {
  if (viewing) {
    handleNeighborTap(col, row);
    return;
  }
  if (col < 0 || row < 0 || col >= state.cols || row >= state.rows) return;
  const now = Date.now();
  if (pendingItem) {
    const placedId = pendingItem;
    const r = placeObject(state, pendingItem, col, row, now);
    if (r.ok) {
      pendingItem = null;
      playBuy();
      recordTask(state.quests, 'buy', placedId);
      finishAction();
      hud.toast('Mazel tov! Placed.');
    } else {
      hud.toast(r.message ?? 'Error');
    }
    return;
  }

  const plot = state.plots[col + row * state.cols];
  const obj = state.objects.find((o) => o.col === col && o.row === row);

  if (plot) {
    if (plot.state === 'plowed') {
      hud.showSeeds(unlockedCrops(state.level), state.level, state.mastery, (cropId) => {
        const r = plant(state, col, row, cropId, Date.now());
        hud.toast(r.message ?? 'Planted!');
        if (r.ok) {
          playPlant();
          dialogue.say(SABA_MOISHE, lines.plant());
          recordTask(state.quests, 'plant', cropId);
          advanceTutorial();
          finishAction();
        }
      });
      return;
    }
    const crop = CROPS[plot.cropId ?? ''];
    if (crop) {
      const st = cropStage(crop, plot.plantedAt ?? now, now, plot.watered);
      if (st.withered) {
        hud.modal(
          'Withered crop',
          [['Restore it or clear it?', '']],
          [
            {
              label: `Unwither \u2014 ${UNWITHER_COST} Sela`,
              primary: true,
              cb: () => {
                const r = unwither(state, col, row, Date.now());
                hud.toast(r.ok ? 'Restored!' : (r.message ?? 'Error'));
                if (r.ok) {
                  playFertilize();
                  postAction();
                }
              },
            },
            {
              label: 'Clear it',
              cb: () => {
                clearPlot(state, col, row);
                dialogue.say(SABA_MOISHE, lines.withered());
                hud.toast('Cleared the withered crop.');
                postAction();
              },
            },
          ],
        );
        return;
      }
      if (st.grown) {
        hud.confirm(crop.name, `Harvest for +${crop.sell}\u20aa?`, 'Harvest', () => {
          const r = harvest(state, col, row, now);
          hud.toast(r.ok ? `Harvested! +${crop.sell}\u20aa` : (r.message ?? 'Error'));
          if (r.ok) {
            playHarvest();
            renderer.burstAt(col, row, CROP_COLORS[crop.id] ?? '#ffd54f');
            renderer.floatTextAt(col, row, `+${crop.sell}\u20aa`, '#ffd54f');
            dialogue.say(SABA_MOISHE, lines.harvest());
            recordTask(state.quests, 'harvest', plot.cropId);
            advanceTutorial();
            finishAction();
          }
        });
        return;
      }
      const scale = plot.watered ? 0.5 : 1;
      const remainMin = Math.max(1, Math.ceil((crop.growSeconds * scale - (now - (plot.plantedAt ?? now)) / 1000) / 60));
      hud.modal(
        crop.name,
        [['Status', `Still growing \u2014 ~${remainMin}m to go`]],
        [
          {
            label: `Fertilize \u2014 ${FERTILIZE_COST} Sela (2x XP)`,
            primary: true,
            cb: () => {
              const r = fertilize(state, col, row);
              hud.toast(r.ok ? 'Fertilized! Double XP on harvest.' : (r.message ?? 'Error'));
              if (r.ok) {
                playFertilize();
                postAction();
              }
            },
          },
          {
            label: `Instagrow \u2014 ${INSTAGROW_COST} Sela`,
            cb: () => {
              const r = instagrow(state, col, row, Date.now());
              hud.toast(r.ok ? 'Instagrow! It is ready.' : (r.message ?? 'Error'));
              if (r.ok) {
                playInstagrow();
                postAction();
              }
            },
          },
          { label: 'Close', cb: () => {} },
        ],
      );
    }
    return;
  }

  if (obj) {
    const item = ITEMS[obj.itemId];
    if (!item) return;
    if (item.kind === 'building') {
      handleBuildingTap(obj);
      return;
    }
    if (item.kind === 'tree' || item.kind === 'animal') {
      if (objectState(item, obj.plantedAt, now) === 'grown') {
        hud.confirm(item.name, `Collect ${item.product} for +${item.yieldCoins}\u20aa?`, 'Collect', () => {
          const r = harvestObject(state, obj.id, now);
          hud.toast(r.ok ? `${item.product} collected! +${item.yieldCoins}\u20aa` : (r.message ?? 'Error'));
          if (r.ok) {
            playHarvest();
            renderer.burstAt(obj.col, obj.row, '#ffd54f');
            renderer.floatTextAt(obj.col, obj.row, `+${item.yieldCoins}\u20aa`, '#ffd54f');
            dialogue.say(SABA_MOISHE, lines.harvest());
            recordTask(state.quests, 'harvestObject', obj.itemId);
            finishAction();
          }
        });
      } else {
        sellObjectAt(obj.id, item.name, item.cost);
      }
    } else {
      sellObjectAt(obj.id, item.name, item.cost);
    }
    return;
  }

  hud.confirm('Plow this plot?', `Costs ${PLOW_COST}\u20aa.`, 'Plow', () => {
    const r = plow(state, col, row);
    hud.toast(r.message ?? 'Plowed. (+1 XP)');
    if (!r.ok) {
      playError();
      dialogue.say(SABA_MOISHE, lines.poor());
    } else {
      recordTask(state.quests, 'plow');
      advanceTutorial();
      finishAction();
    }
  });
}

const input = new Input(renderer.canvas, renderer, {
  onTapTile: handleTap,
  onDrag: (dx, dy) => {
    renderer.camera.x += dx;
    renderer.camera.y += dy;
  },
  onPinch: (f) => {
    renderer.camera.zoom = Math.min(3, Math.max(0.5, renderer.camera.zoom * f));
  },
});

const storeBtn = document.createElement('button');
storeBtn.id = 'store-btn';
storeBtn.innerHTML = `${icon('cart')}<span>Shuk</span>`;
storeBtn.addEventListener('click', () => {
  hud.showStore(itemList('tree'), itemList('animal'), itemList('decor'), itemList('building'), state.level, (id) => {
    pendingItem = id;
    hud.toast('Tap a tile to place it.');
  });
});
app.appendChild(storeBtn);

const neighborsBtn = document.createElement('button');
neighborsBtn.id = 'neighbors-btn';
neighborsBtn.innerHTML = `${icon('people')}<span>Neighbors</span>`;
neighborsBtn.addEventListener('click', showNeighborsModal);
app.appendChild(neighborsBtn);

const backBtn = document.createElement('button');
backBtn.id = 'back-btn';
backBtn.innerHTML = `${icon('back')}<span>Back to my farm</span>`;
backBtn.style.display = 'none';
backBtn.addEventListener('click', () => {
  setViewing(null);
  hud.toast('Back on your farm.');
});
app.appendChild(backBtn);

const expandBtn = document.createElement('button');
expandBtn.id = 'expand-btn';
expandBtn.innerHTML = `${icon('expand')}<span>Expand</span>`;
expandBtn.addEventListener('click', () => {
  const cost = expansionCost(state);
  const size = state.cols;
  hud.modal(
    'Expand Farm',
    [
      ['Current size', `${size}\u00d7${size}`],
      ['New size', `${size + 2}\u00d7${size + 2}`],
      ['Cost', `${cost}\u20aa`],
    ],
    [
      {
        label: `Expand for ${cost}\u20aa`,
        primary: true,
        cb: () => {
          if (expandFarm(state)) {
            renderer.fit(state);
            hud.toast('Mazel tov! Your farm grew.');
            postAction();
          } else {
            hud.toast('Not enough shekels.');
            dialogue.say(SABA_MOISHE, lines.poor());
          }
        },
      },
    ],
  );
});
app.appendChild(expandBtn);

const settingsBtn = document.createElement('button');
settingsBtn.id = 'settings-btn';
settingsBtn.innerHTML = icon('settings', 18);
settingsBtn.addEventListener('click', showSettingsModal);
app.appendChild(settingsBtn);

const tutorialEl = document.createElement('div');
tutorialEl.id = 'tutorial';
tutorialEl.style.display = 'none';
app.appendChild(tutorialEl);

renderer.fit(state);

const isFresh = !loaded;
save();

// debug/testing hook
window.__farm = {
  state,
  save,
  renderer,
  showBreedingModal,
  showMarketModal,
  showCraftingModal,
  showNeighborsModal,
};

function frame(): void {
  renderer.render(viewing ? viewing.farm : state, Date.now());
  hud.update(state);
  questPanel.update(state);
  if (!state.tutorial.done) {
    tutorialEl.textContent = TUTORIAL_TEXT[state.tutorial.step] ?? '';
    tutorialEl.style.display = '';
  } else {
    tutorialEl.style.display = 'none';
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

window.setTimeout(() => {
  if (isFresh) {
    dialogue.say(SABA_MOISHE, lines.greetFirst());
  } else if (!showReturnModal()) {
    dialogue.say(SABA_MOISHE, lines.greetBack());
  }
}, 700);

window.addEventListener('beforeunload', save);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') save();
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      // dev (http) or unsupported — offline install simply unavailable
    });
  });
}

window.addEventListener('pointerdown', () => unlock(), { once: true });

void input;
