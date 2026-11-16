import type { FarmState } from '../types';
import { levelForXp } from '../data/levels';

export const PLOW_COST = 15;
export const PLOW_XP = 1;
export const COINS_CAP = 999_999_999;
export const SELA_CAP = 99_999;
export const LEVELUP_SELA = 1; // +1 Sela per level gained
export const WITHER_MULTIPLIER = 2.2; // wither at growTime × 2.2 (gameSettingsCMS witherMultiplier)

function clamp(n: number, lo: number, hi: number): number {
  return n < lo ? lo : n > hi ? hi : n;
}

export function addCoins(s: FarmState, n: number): void {
  const amt = Math.round(n);
  s.coins = clamp(s.coins + amt, 0, COINS_CAP);
  if (amt > 0) s.stats.coinsEarned += amt;
}

export function spendCoins(s: FarmState, n: number): boolean {
  if (s.coins < n) return false;
  s.coins -= n;
  return true;
}

export function addSela(s: FarmState, n: number): void {
  s.sela = clamp(Math.round(s.sela + n), 0, SELA_CAP);
}

export function spendSela(s: FarmState, n: number): boolean {
  if (s.sela < n) return false;
  s.sela -= n;
  return true;
}

/** Adds XP; returns levels gained (each grants +LEVELUP_SELA Sela). */
export function addXp(s: FarmState, n: number): number {
  s.xp += Math.round(n);
  const newLevel = levelForXp(s.xp);
  const gained = newLevel - s.level;
  if (gained > 0) {
    s.level = newLevel;
    s.sela = clamp(s.sela + gained * LEVELUP_SELA, 0, SELA_CAP);
  }
  return gained;
}
