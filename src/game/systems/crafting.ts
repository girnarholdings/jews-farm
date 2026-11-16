import type { FarmState } from '../types';
import { RECIPES } from '../data/recipes';

export function canCraft(s: FarmState, recipeId: string): boolean {
  const r = RECIPES.find((x) => x.id === recipeId);
  if (!r) return false;
  return (s.bushels[r.input] ?? 0) >= r.inputQty;
}

export function startCraft(s: FarmState, recipeId: string, buildingId: number, now: number): boolean {
  const r = RECIPES.find((x) => x.id === recipeId);
  if (!r) return false;
  if ((s.bushels[r.input] ?? 0) < r.inputQty) return false;
  s.bushels[r.input] -= r.inputQty;
  let nextId = 1;
  for (const j of s.craftQueue) if (j.id >= nextId) nextId = j.id + 1;
  s.craftQueue.push({ id: nextId, recipeId, buildingId, finishAt: now + r.cookSeconds * 1000 });
  return true;
}

/** Collects finished crafts from a building. Returns the recipe ids collected. */
export function collectCrafts(s: FarmState, buildingId: number, now: number): string[] {
  const done: string[] = [];
  s.craftQueue = s.craftQueue.filter((j) => {
    if (j.buildingId === buildingId && j.finishAt <= now) {
      done.push(j.recipeId);
      return false;
    }
    return true;
  });
  for (const id of done) s.crafts[id] = (s.crafts[id] ?? 0) + 1;
  return done;
}
