import type { FarmState } from '../types';

export interface Gift {
  coins: number;
  sela: number;
  day: number;
}

export function rewardForDay(day: number): { coins: number; sela: number } {
  return {
    coins: Math.min(300, 100 + (day - 1) * 50),
    sela: day >= 5 ? 3 : day >= 3 ? 2 : 1,
  };
}

export function dailyRewardDue(s: FarmState): boolean {
  return s.lastGiftDay !== new Date().toDateString();
}

export function upcomingGiftDay(s: FarmState): number {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return s.lastGiftDay === yesterday.toDateString() ? s.giftStreak + 1 : 1;
}

export function claimDailyGift(s: FarmState): Gift | null {
  if (!dailyRewardDue(s)) return null;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  s.giftStreak = s.lastGiftDay === yesterday.toDateString() ? s.giftStreak + 1 : 1;
  const r = rewardForDay(s.giftStreak);
  s.coins = Math.min(999_999_999, s.coins + r.coins);
  s.sela = Math.min(99_999, s.sela + r.sela);
  s.lastGiftDay = new Date().toDateString();
  return { ...r, day: s.giftStreak };
}
