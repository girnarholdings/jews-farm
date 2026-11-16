import type { FarmState } from '../types';
import { CROPS } from '../data/crops';
import { RECIPES } from '../data/recipes';
import { addCoins } from './economy';

/** Daily market multiplier (0.8–1.2). */
export function marketRate(): number {
  return 0.8 + Math.random() * 0.4;
}

export function bushelCount(s: FarmState): number {
  let n = 0;
  for (const c of Object.values(s.bushels)) n += c;
  return n;
}

export function craftCount(s: FarmState): number {
  let n = 0;
  for (const c of Object.values(s.crafts)) n += c;
  return n;
}

function bushelValue(s: FarmState): number {
  let total = 0;
  for (const [cropId, count] of Object.entries(s.bushels)) {
    const crop = CROPS[cropId];
    if (crop && count > 0) total += crop.sell * 1.5 * count;
  }
  return total;
}

function craftValue(s: FarmState): number {
  let total = 0;
  for (const [recipeId, count] of Object.entries(s.crafts)) {
    const r = RECIPES.find((x) => x.id === recipeId);
    if (r && count > 0) total += r.outputValue * count;
  }
  return total;
}

/** Sells all bushels + crafted goods at the daily rate. Returns coins gained. */
export function sellProduce(s: FarmState): number {
  const gross = bushelValue(s) + craftValue(s);
  if (gross <= 0) return 0;
  const total = Math.round(gross * marketRate());
  addCoins(s, total);
  s.bushels = {};
  s.crafts = {};
  return total;
}
