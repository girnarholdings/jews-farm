import type { FarmState } from '../types';
import { CROPS } from '../data/crops';
import { ITEMS } from '../data/items';
import { cropStage, objectState } from './growth';

export interface ReturnSummary {
  ready: number;
  growing: number;
  withered: number;
  readyNames: string[];
}

/** What changed while the player was away. */
export function computeReturnSummary(s: FarmState, now: number): ReturnSummary {
  const summary: ReturnSummary = { ready: 0, growing: 0, withered: 0, readyNames: [] };
  for (const plot of s.plots) {
    if (!plot || plot.state !== 'planted') continue;
    const crop = CROPS[plot.cropId ?? ''];
    if (!crop) continue;
    const st = cropStage(crop, plot.plantedAt ?? now, now, plot.watered);
    if (st.withered) summary.withered++;
    else if (st.grown) {
      summary.ready++;
      if (summary.readyNames.length < 4) summary.readyNames.push(crop.name);
    } else summary.growing++;
  }
  for (const obj of s.objects) {
    const item = ITEMS[obj.itemId];
    if (!item || item.kind === 'decor' || item.kind === 'building') continue;
    if (objectState(item, obj.plantedAt, now) === 'grown') {
      summary.ready++;
      if (summary.readyNames.length < 4) summary.readyNames.push(item.name);
    } else summary.growing++;
  }
  return summary;
}
