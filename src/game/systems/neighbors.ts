import type { FarmState } from '../types';
import { CROPS } from '../data/crops';
import { ITEMS } from '../data/items';
import { cropStage } from './growth';

export interface NeighborAct {
  ok: boolean;
  coins: number;
  xp: number;
  message: string;
}

export function waterNeighborCrop(farm: FarmState, col: number, row: number, now: number): NeighborAct {
  const plot = farm.plots[col + row * farm.cols];
  if (!plot || plot.state !== 'planted') return { ok: false, coins: 0, xp: 0, message: 'Nothing to water' };
  const crop = CROPS[plot.cropId ?? ''];
  if (!crop) return { ok: false, coins: 0, xp: 0, message: 'Nothing to water' };
  const st = cropStage(crop, plot.plantedAt ?? now, now, plot.watered);
  if (st.withered) return { ok: false, coins: 0, xp: 0, message: 'Withered' };
  if (st.grown) return { ok: false, coins: 0, xp: 0, message: 'Ready to harvest instead' };
  if (plot.watered) return { ok: false, coins: 0, xp: 0, message: 'Already watered' };
  plot.watered = true;
  return { ok: true, coins: 10, xp: 1, message: 'Watered their crop!' };
}

export function helpHarvestNeighbor(farm: FarmState, col: number, row: number, now: number): NeighborAct {
  const plot = farm.plots[col + row * farm.cols];
  if (!plot || plot.state !== 'planted') return { ok: false, coins: 0, xp: 0, message: 'Nothing here' };
  const crop = CROPS[plot.cropId ?? ''];
  if (!crop) return { ok: false, coins: 0, xp: 0, message: 'Nothing here' };
  const st = cropStage(crop, plot.plantedAt ?? now, now, plot.watered);
  if (st.withered) {
    plot.plantedAt = now;
    plot.watered = false;
    return { ok: true, coins: 10, xp: 1, message: 'Cleared their withered crop' };
  }
  if (!st.grown) return { ok: false, coins: 0, xp: 0, message: 'Still growing — water it instead' };
  plot.plantedAt = now;
  plot.watered = false;
  return { ok: true, coins: 10, xp: 1, message: 'Helped harvest!' };
}

export function neighborAnimalAct(farm: FarmState, objId: number, now: number): NeighborAct {
  const o = farm.objects.find((x) => x.id === objId);
  if (!o) return { ok: false, coins: 0, xp: 0, message: 'Gone' };
  const item = ITEMS[o.itemId];
  if (!item) return { ok: false, coins: 0, xp: 0, message: 'Gone' };
  const grown = now - o.plantedAt >= item.growSeconds * 1000;
  if (!grown) return { ok: false, coins: 0, xp: 0, message: 'Not ready yet' };
  const isChicken = o.itemId === 'chicken';
  o.plantedAt = now;
  if (isChicken) return { ok: true, coins: 100, xp: 10, message: 'Fed the chickens! +100\u20aa' };
  return { ok: true, coins: 10, xp: 1, message: 'Helped with the animal!' };
}
