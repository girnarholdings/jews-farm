import type { FarmState, Plot } from '../types';
import { SHOSHANA, YOSSI, RIVKA, type Persona } from '../dialogue';

export interface Neighbor {
  id: string;
  persona: Persona;
  farm: FarmState;
}

function farm(cols: number, rows: number): FarmState {
  return {
    cols,
    rows,
    plots: new Array<null>(cols * rows).fill(null),
    objects: [],
    coins: 0,
    sela: 0,
    xp: 0,
    level: 1,
    quests: { completed: [], progress: {} },
    stats: { plows: 0, plants: 0, harvests: 0, objects: 0, coinsEarned: 0 },
    ribbons: [],
    giftStreak: 0,
    tutorial: { step: 0, done: true },
    bushels: {},
    crafts: {},
    craftQueue: [],
  };
}

function plot(cropId: string, plantedAt: number): Plot {
  return { state: 'planted', cropId, plantedAt };
}

function obj(id: number, itemId: string, col: number, row: number, plantedAt: number) {
  return { id, itemId, col, row, plantedAt };
}

/** Static NPC farms. Their crops grow over the session via plantedAt timestamps. */
export function makeNeighbors(): Neighbor[] {
  const now = Date.now();
  const day = 82_800 * 1000;

  const s = farm(8, 8);
  s.plots[2 + 2 * 8] = plot('wheat', now - day * 0.5); // growing
  s.plots[3 + 2 * 8] = plot('strawberry', now - day * 1.5); // ready
  s.plots[4 + 2 * 8] = plot('tomato', now - day * 0.3); // growing
  s.plots[2 + 3 * 8] = plot('grapes', now - day * 2); // ready
  s.objects.push(obj(1, 'chicken', 5, 3, now - day * 2));
  s.objects.push(obj(2, 'fig', 6, 2, now - day * 1));

  const y = farm(8, 8);
  y.plots[3 + 3 * 8] = plot('corn', now - day * 0.7);
  y.plots[4 + 3 * 8] = plot('onion', now - day * 0.2);
  y.plots[3 + 4 * 8] = plot('wheat', now - day * 2.5); // ready
  y.objects.push(obj(1, 'cow', 5, 4, now - day * 2));

  const r = farm(8, 8);
  r.plots[4 + 2 * 8] = plot('carrot', now - day * 0.4);
  r.plots[5 + 2 * 8] = plot('tomato', now - day * 1.8); // ready
  r.plots[4 + 3 * 8] = plot('grapes', now - day * 0.5);
  r.objects.push(obj(1, 'sheep', 6, 3, now - day * 2));

  return [
    { id: 'shoshana', persona: SHOSHANA, farm: s },
    { id: 'yossi', persona: YOSSI, farm: y },
    { id: 'rivka', persona: RIVKA, farm: r },
  ];
}
