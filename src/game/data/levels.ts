// XP required to REACH each level (index = level - 1). Source: user_resources.php deriveLevel.
const LEVEL_XP: number[] = [
  0, 15, 30, 70, 140, 250, 400, 600, 850, 1150, 1500, 1900, 2400, 3000, 3700, 4500,
  5400, 6400, 7500, 8700, 10000, 11500, 13500, 16000, 19000, 22500, 26500, 31000,
  36000, 42000, 49000, 57000, 65000, 74000, 83000, 93000, 103000, 113000, 123000, 133000,
];
// L41..L70: linear +10k per level (143000 .. 433000)
for (let i = 40; i < 70; i++) LEVEL_XP[i] = 133000 + (i - 39) * 10000;
// L71..L100
LEVEL_XP.push(
  443500, 454500, 466000, 478000, 490500, 504000, 518500, 534000, 550500, 568000,
  587000, 607500, 629500, 653000, 678500, 706000, 735500, 767000, 801000, 837500,
  876500, 918500, 963500, 1012000, 1064000, 1120000, 1180000, 1244500, 1313500, 1387500,
);

export const MAX_LEVEL = LEVEL_XP.length;

export function levelForXp(xp: number): number {
  let lvl = 1;
  for (let i = 0; i < LEVEL_XP.length; i++) {
    if (xp >= LEVEL_XP[i]) lvl = i + 1;
    else break;
  }
  return lvl;
}

export function xpForLevel(level: number): number {
  return LEVEL_XP[level - 1] ?? LEVEL_XP[LEVEL_XP.length - 1];
}
