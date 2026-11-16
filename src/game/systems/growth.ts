import type { CropDef, ObjectState } from '../types';

export interface CropStage {
  withered: boolean;
  grown: boolean;
  progress: number; // 0..1 fraction toward maturity
}

export function cropStage(
  crop: CropDef,
  plantedAt: number,
  now: number,
  watered = false,
): CropStage {
  const scale = watered ? 0.5 : 1;
  const grow = crop.growSeconds * scale;
  const witherAt = grow + crop.witherSeconds * scale;
  const elapsed = (now - plantedAt) / 1000;
  if (elapsed >= witherAt) return { withered: true, grown: false, progress: 1 };
  if (elapsed >= grow) return { withered: false, grown: true, progress: 1 };
  return { withered: false, grown: false, progress: elapsed / grow };
}

export function objectState(
  item: { growSeconds: number },
  plantedAt: number,
  now: number,
): ObjectState {
  return now - plantedAt >= item.growSeconds * 1000 ? 'grown' : 'growing';
}
