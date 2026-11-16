import type { FarmState, Stats } from '../types';

export interface Ribbon {
  id: string;
  name: string;
  desc: string;
  stat: keyof Stats | 'level';
  need: number;
}

export const RIBBONS: Ribbon[] = [
  { id: 'r_plow', name: 'First Furrow', desc: 'Plow your first plot', stat: 'plows', need: 1 },
  { id: 'r_plant', name: 'Green Thumb', desc: 'Plant 10 crops', stat: 'plants', need: 10 },
  { id: 'r_harvest', name: 'Bountiful Harvest', desc: 'Harvest 50 crops', stat: 'harvests', need: 50 },
  { id: 'r_objects', name: 'Tree Hugger', desc: 'Place 5 trees or animals', stat: 'objects', need: 5 },
  { id: 'r_coins', name: 'Rich Uncle', desc: 'Earn 10,000 shekels', stat: 'coinsEarned', need: 10000 },
  { id: 'r_level', name: 'Master Farmer', desc: 'Reach level 10', stat: 'level', need: 10 },
];

/** Marks any newly-earned ribbons and returns them. */
export function checkRibbons(s: FarmState): Ribbon[] {
  const earned: Ribbon[] = [];
  for (const r of RIBBONS) {
    if (s.ribbons.includes(r.id)) continue;
    const val = r.stat === 'level' ? s.level : s.stats[r.stat];
    if (val >= r.need) {
      s.ribbons.push(r.id);
      earned.push(r);
    }
  }
  return earned;
}
