import type { FarmState, Plot, CropDef } from '../types';
import { CROPS } from '../data/crops';
import { ITEMS } from '../data/items';
import { addCoins, addXp, spendCoins, spendSela, PLOW_COST, PLOW_XP } from './economy';
import { cropStage, objectState } from './growth';
import { MASTERY_BONUS, MASTERY_MAX } from './mastery';

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

function harvestPlot(s: FarmState, plot: Plot, crop: CropDef, col: number, row: number): void {
  const mastered = (s.mastery[crop.id] ?? 0) >= MASTERY_MAX;
  addCoins(s, crop.sell + (mastered ? Math.round(crop.sell * MASTERY_BONUS) : 0));
  s.mastery[crop.id] = (s.mastery[crop.id] ?? 0) + 1;
  if (plot.fertilized) addXp(s, crop.plantXp * 2);
  s.stats.harvests++;
  if (Math.random() < 0.15) s.bushels[crop.id] = (s.bushels[crop.id] ?? 0) + 1;
  s.plots[col + row * s.cols] = null;
}

export function harvest(s: FarmState, col: number, row: number, now: number): ActionResult {
  if (!inBounds(s, col, row)) return { ok: false, message: 'Out of bounds' };
  const plot = s.plots[col + row * s.cols];
  if (!plot || plot.state !== 'planted') return { ok: false, message: 'Nothing to harvest' };
  const crop = CROPS[plot.cropId ?? ''];
  if (!crop) return { ok: false, message: 'Unknown crop' };
  const stage = cropStage(crop, plot.plantedAt ?? now, now, plot.watered);
  if (stage.withered) return { ok: false, message: 'Withered — clear it' };
  if (!stage.grown) return { ok: false, message: 'Still growing' };
  harvestPlot(s, plot, crop, col, row);
  return { ok: true };
}

export const FERTILIZE_COST = 3; // Sela

export function fertilize(s: FarmState, col: number, row: number): ActionResult {
  if (!inBounds(s, col, row)) return { ok: false, message: 'Out of bounds' };
  const plot = s.plots[col + row * s.cols];
  if (!plot || plot.state !== 'planted') return { ok: false, message: 'Nothing to fertilize' };
  if (plot.fertilized) return { ok: false, message: 'Already fertilized' };
  if (!spendSela(s, FERTILIZE_COST)) return { ok: false, message: 'Not enough Sela' };
  plot.fertilized = true;
  return { ok: true };
}

/** Harvests every ready crop. Returns how many were collected. */
export function harvestAllReady(s: FarmState, now: number): number {
  let count = 0;
  for (let row = 0; row < s.rows; row++) {
    for (let col = 0; col < s.cols; col++) {
      const plot = s.plots[col + row * s.cols];
      if (!plot || plot.state !== 'planted') continue;
      const crop = CROPS[plot.cropId ?? ''];
      if (!crop) continue;
      const stage = cropStage(crop, plot.plantedAt ?? now, now, plot.watered);
      if (!stage.grown || stage.withered) continue;
      harvestPlot(s, plot, crop, col, row);
      count++;
    }
  }
  return count;
}

export function countReadyCrops(s: FarmState, now: number): number {
  let count = 0;
  for (const plot of s.plots) {
    if (!plot || plot.state !== 'planted') continue;
    const crop = CROPS[plot.cropId ?? ''];
    if (!crop) continue;
    const stage = cropStage(crop, plot.plantedAt ?? now, now, plot.watered);
    if (stage.grown && !stage.withered) count++;
  }
  return count;
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

export const INSTAGROW_COST = 4; // Sela

export function instagrow(s: FarmState, col: number, row: number, now: number): ActionResult {
  const plot = s.plots[col + row * s.cols];
  if (!plot || plot.state !== 'planted' || plot.cropId == null) return { ok: false, message: 'Nothing to grow' };
  const crop = CROPS[plot.cropId];
  if (!crop) return { ok: false, message: 'Unknown crop' };
  if (!spendSela(s, INSTAGROW_COST)) return { ok: false, message: 'Not enough Sela' };
  const scale = plot.watered ? 0.5 : 1;
  plot.plantedAt = now - crop.growSeconds * scale * 1000 - 1000;
  return { ok: true };
}
