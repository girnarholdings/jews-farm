import type { FarmState } from '../types';

export interface Gift {
  coins: number;
  sela: number;
}

/** Grants the once-per-day gift. Returns the granted amounts, or null if already claimed today. */
export function claimDailyGift(s: FarmState): Gift | null {
  const today = new Date().toDateString();
  if (s.lastGiftDay === today) return null;
  const coins = 100 + Math.floor(Math.random() * 901); // 100–1000
  const sela = 1 + Math.floor(Math.random() * 5); // 1–5
  s.coins = Math.min(999_999_999, s.coins + coins);
  s.sela = Math.min(99_999, s.sela + sela);
  s.lastGiftDay = today;
  return { coins, sela };
}
