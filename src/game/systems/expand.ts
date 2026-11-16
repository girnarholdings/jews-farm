import type { FarmState, Plot } from '../types';
import { spendCoins } from './economy';

export const BASE_SIZE = 8;

export function expansionLevel(s: FarmState): number {
  return (s.cols - BASE_SIZE) / 2;
}

export function expansionCost(s: FarmState): number {
  const level = expansionLevel(s);
  return 1000 * Math.pow(5, level); // 1,000 → 5,000 → 25,000 …
}

/** Grows the farm by one ring (2 cols + 2 rows), centering existing content. */
export function expandFarm(s: FarmState): boolean {
  const cost = expansionCost(s);
  if (!spendCoins(s, cost)) return false;
  const newCols = s.cols + 2;
  const newRows = s.rows + 2;
  const plots = new Array<Plot | null>(newCols * newRows).fill(null);
  for (let row = 0; row < s.rows; row++) {
    for (let col = 0; col < s.cols; col++) {
      const p = s.plots[col + row * s.cols];
      if (p) plots[col + 1 + (row + 1) * newCols] = p;
    }
  }
  s.plots = plots;
  s.cols = newCols;
  s.rows = newRows;
  for (const o of s.objects) {
    o.col += 1;
    o.row += 1;
  }
  return true;
}
