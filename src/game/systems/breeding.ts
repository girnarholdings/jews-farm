import type { FarmState, PlacedObject } from '../types';
import { SHEEP_COLORS, SHEEP_PATTERNS } from '../../render/palette';

export const BREED_SECONDS = 24 * 3600;

export function hasBreedPair(s: FarmState): boolean {
  const ram = s.objects.some((o) => o.itemId === 'ram');
  const ewe = s.objects.some((o) => o.itemId === 'ewe');
  return ram && ewe;
}

export function startBreeding(pen: PlacedObject, now: number): boolean {
  if (pen.breeding) return false;
  pen.breeding = now + BREED_SECONDS * 1000;
  return true;
}

function emptyTileNear(s: FarmState, col: number, row: number): { col: number; row: number } | null {
  const dirs = [
    [1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1],
  ];
  for (const [dc, dr] of dirs) {
    const c = col + dc;
    const r = row + dr;
    if (c < 0 || r < 0 || c >= s.cols || r >= s.rows) continue;
    if (s.plots[c + r * s.cols]) continue;
    if (s.objects.some((o) => o.col === c && o.row === r)) continue;
    return { col: c, row: r };
  }
  return null;
}

/** Spawns a lamb (sheep with a random color) beside the pen. Returns true if collected. */
export function collectLamb(s: FarmState, pen: PlacedObject, now: number): boolean {
  if (!pen.breeding || now < pen.breeding) return false;
  const tile = emptyTileNear(s, pen.col, pen.row);
  if (!tile) return false;
  const colors = Object.keys(SHEEP_COLORS);
  const variant = colors[Math.floor(Math.random() * colors.length)];
  const pattern = SHEEP_PATTERNS[Math.floor(Math.random() * SHEEP_PATTERNS.length)];
  let nextId = 1;
  for (const o of s.objects) if (o.id >= nextId) nextId = o.id + 1;
  s.objects.push({
    id: nextId,
    itemId: 'sheep',
    col: tile.col,
    row: tile.row,
    plantedAt: now,
    state: 'growing',
    variant,
    pattern,
  });
  pen.breeding = undefined;
  return true;
}
