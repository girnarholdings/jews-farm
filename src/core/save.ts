import type { FarmState } from '../game/types';

const KEY = 'jews-farm-save-v1';

export function saveState(s: FarmState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    // quota exceeded or storage blocked — ignore, keep in-memory state
  }
}

export function loadState(): FarmState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as FarmState;
  } catch {
    return null;
  }
}

export function clearSave(): void {
  localStorage.removeItem(KEY);
}
