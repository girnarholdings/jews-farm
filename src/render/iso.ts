export const TILE_W = 64;
export const TILE_H = 32;

export interface ScreenPos {
  x: number;
  y: number;
}

/** World (col,row) tile center -> camera-space (pre-zoom) screen position. */
export function tileCenter(col: number, row: number): ScreenPos {
  return {
    x: (col - row) * (TILE_W / 2),
    y: (col + row) * (TILE_H / 2),
  };
}

/** Camera-space screen position -> tile (col,row). Tiles are L∞-Voronoi cells centered on integers, so round (not floor). */
export function screenToTile(x: number, y: number): { col: number; row: number } {
  const fx = x / (TILE_W / 2);
  const fy = y / (TILE_H / 2);
  return {
    col: Math.round((fx + fy) / 2),
    row: Math.round((fy - fx) / 2),
  };
}
