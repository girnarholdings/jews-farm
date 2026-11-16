export const MASTERY_MAX = 50;
export const MASTERY_BONUS = 0.1; // +10% coins at full mastery

export function masteryStars(count: number): number {
  if (count >= MASTERY_MAX) return 3;
  if (count >= 25) return 2;
  if (count >= 10) return 1;
  return 0;
}
