import type { FarmState } from '../types';
import { CROPS } from '../data/crops';
import { addXp, spendCoins, PLOW_COST, PLOW_XP } from './economy';

export const TRACTOR_FUEL = 3;
export const SEEDER_FUEL = 3;
export const HARVESTER_FUEL = 3;

export function spendFuel(s: FarmState, n: number): boolean {
  if (s.fuel < n) return false;
  s.fuel -= n;
  return true;
}

/** Plows a 3x3 patch of empty tiles around (col,row). Returns how many were plowed. */
export function plowArea(s: FarmState, col: number, row: number): number {
  let count = 0;
  for (let dc = -1; dc <= 1; dc++) {
    for (let dr = -1; dr <= 1; dr++) {
      const c = col + dc;
      const r = row + dr;
      if (c < 0 || r < 0 || c >= s.cols || r >= s.rows) continue;
      const i = c + r * s.cols;
      if (s.plots[i]) continue;
      if (s.objects.some((o) => o.col === c && o.row === r)) continue;
      if (!spendCoins(s, PLOW_COST)) continue;
      s.plots[i] = { state: 'plowed' };
      addXp(s, PLOW_XP);
      s.stats.plows++;
      count++;
    }
  }
  return count;
}

export function countPlowed(s: FarmState): number {
  return s.plots.filter((p) => p && p.state === 'plowed').length;
}

/** Plants a seed on every plowed plot. Returns how many were planted. */
export function plantAllPlowed(s: FarmState, cropId: string, now: number): number {
  const crop = CROPS[cropId];
  if (!crop) return 0;
  let count = 0;
  for (let row = 0; row < s.rows; row++) {
    for (let col = 0; col < s.cols; col++) {
      const plot = s.plots[col + row * s.cols];
      if (!plot || plot.state !== 'plowed') continue;
      if (!spendCoins(s, crop.seedCost)) continue;
      plot.state = 'planted';
      plot.cropId = cropId;
      plot.plantedAt = now;
      addXp(s, crop.plantXp);
      s.stats.plants++;
      count++;
    }
  }
  return count;
}
