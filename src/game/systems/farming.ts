import type { FarmState } from '../types';
import { CROPS } from '../data/crops';
import { ITEMS } from '../data/items';
import { addCoins, addXp, spendCoins, spendSela, PLOW_COST, PLOW_XP } from './economy';
import { cropStage, objectState } from './growth';

export interface ActionResult {
  ok: boolean;
  message?: string;
}

function inBounds(s: FarmState, col: number, row: number): boolean {
  return col >= 0 && row >= 0 && col < s.cols && row < s.rows;
}

export function plow(s: FarmState, col: number, row: number): ActionResult {
  if (!inBounds(s, col, row)) return { ok: false, message: 'Out of bounds' };
  const i = col + row * s.cols;
  if (s.plots[i]) return { ok: false, message: 'Already plowed' };
  if (!spendCoins(s, PLOW_COST)) return { ok: false, message: 'Not enough shekels' };
  s.plots[i] = { state: 'plowed' };
  addXp(s, PLOW_XP);
  s.stats.plows++;
  return { ok: true };
}

export function plant(
  s: FarmState,
  col: number,
  row: number,
  cropId: string,
  now: number,
): ActionResult {
  if (!inBounds(s, col, row)) return { ok: false, message: 'Out of bounds' };
  const plot = s.plots[col + row * s.cols];
  if (!plot || plot.state !== 'plowed') return { ok: false, message: 'Plow first' };
  const crop = CROPS[cropId];
  if (!crop) return { ok: false, message: 'Unknown crop' };
  if (s.level < crop.unlockLevel) return { ok: false, message: 'Reach a higher level' };
  const affordable = spendCoins(s, crop.seedCost);
  if (!affordable) return { ok: false, message: 'Not enough coins' };
  plot.state = 'planted';
  plot.cropId = cropId;
  plot.plantedAt = now;
  addXp(s, crop.plantXp);
  s.stats.plants++;
  return { ok: true };
}

export function harvest(s: FarmState, col: number, row: number, now: number): ActionResult {
  if (!inBounds(s, col, row)) return { ok: false, message: 'Out of bounds' };
  const plot = s.plots[col + row * s.cols];
  if (!plot || plot.state !== 'planted') return { ok: false, message: 'Nothing to harvest' };
  const crop = CROPS[plot.cropId ?? ''];
  if (!crop) return { ok: false, message: 'Unknown crop' };
  const stage = cropStage(crop, plot.plantedAt ?? now, now);
  if (stage.withered) return { ok: false, message: 'Withered — clear it' };
  if (!stage.grown) return { ok: false, message: 'Still growing' };
  addCoins(s, crop.sell);
  s.stats.harvests++;
  if (Math.random() < 0.15) s.bushels[crop.id] = (s.bushels[crop.id] ?? 0) + 1;
  s.plots[col + row * s.cols] = null;
  return { ok: true };
}

export function clearPlot(s: FarmState, col: number, row: number): ActionResult {
  if (!inBounds(s, col, row)) return { ok: false, message: 'Out of bounds' };
  if (!s.plots[col + row * s.cols]) return { ok: false, message: 'Nothing here' };
  s.plots[col + row * s.cols] = null;
  return { ok: true };
}

export function placeObject(s: FarmState, itemId: string, col: number, row: number, now: number): ActionResult {
  if (!inBounds(s, col, row)) return { ok: false, message: 'Out of bounds' };
  const item = ITEMS[itemId];
  if (!item) return { ok: false, message: 'Unknown item' };
  if (s.level < item.unlockLevel) return { ok: false, message: 'Reach a higher level' };
  if (s.plots[col + row * s.cols]) return { ok: false, message: 'Occupied' };
  if (s.objects.some((o) => o.col === col && o.row === row)) return { ok: false, message: 'Occupied' };
  const affordable = item.selaCost > 0
    ? spendSela(s, item.selaCost)
    : spendCoins(s, item.cost);
  if (!affordable) return { ok: false, message: item.selaCost > 0 ? 'Not enough Sela' : 'Not enough coins' };
  let nextId = 1;
  for (const o of s.objects) if (o.id >= nextId) nextId = o.id + 1;
  s.objects.push({
    id: nextId,
    itemId,
    col,
    row,
    plantedAt: now,
  });
  addXp(s, item.xp);
  s.stats.objects++;
  return { ok: true };
}

export function harvestObject(s: FarmState, id: number, now: number): ActionResult {
  const obj = s.objects.find((o) => o.id === id);
  if (!obj) return { ok: false, message: 'Object gone' };
  const item = ITEMS[obj.itemId];
  if (!item) return { ok: false, message: 'Unknown item' };
  if (objectState(item, obj.plantedAt, now) !== 'grown') return { ok: false, message: 'Not ready' };
  addCoins(s, item.yieldCoins);
  s.stats.harvests++;
  obj.plantedAt = now; // reset growth cycle
  return { ok: true };
}

export function sellObject(s: FarmState, id: number): ActionResult {
  const i = s.objects.findIndex((o) => o.id === id);
  if (i < 0) return { ok: false, message: 'Object gone' };
  const item = ITEMS[s.objects[i].itemId];
  if (!item) return { ok: false, message: 'Unknown item' };
  addCoins(s, Math.round(item.cost * 0.05));
  s.objects.splice(i, 1);
  return { ok: true };
}
