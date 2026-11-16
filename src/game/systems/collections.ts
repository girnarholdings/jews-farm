import type { FarmState, Stats } from '../types';
import { ITEMS } from '../data/items';
import { SHEEP_COLORS } from '../../render/palette';
import { MASTERY_MAX } from './mastery';
import { addCoins, addSela } from './economy';

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

export interface CollectionDef {
  id: string;
  name: string;
  desc: string;
  total: number;
  coins: number;
  sela: number;
}

export const COLLECTIONS: CollectionDef[] = [
  { id: 'sheep', name: 'Flock of Colors', desc: 'Breed all sheep colors', total: Object.keys(SHEEP_COLORS).length, coins: 2000, sela: 5 },
  { id: 'trees', name: 'The Orchard', desc: 'Plant every kind of tree', total: 27, coins: 3000, sela: 8 },
  { id: 'animals', name: 'The Barnyard', desc: 'Raise every animal', total: 11, coins: 1500, sela: 4 },
  { id: 'mastery', name: 'Master Farmer', desc: 'Master 10 crops to 3 stars', total: 10, coins: 2500, sela: 6 },
];

export function collectionProgress(s: FarmState, c: CollectionDef): number {
  switch (c.id) {
    case 'sheep':
      return s.sheepColors.length;
    case 'trees': {
      const ids = new Set(s.objects.filter((o) => ITEMS[o.itemId]?.kind === 'tree').map((o) => o.itemId));
      return ids.size;
    }
    case 'animals': {
      const ids = new Set(s.objects.filter((o) => ITEMS[o.itemId]?.kind === 'animal').map((o) => o.itemId));
      return ids.size;
    }
    case 'mastery':
      return Object.values(s.mastery).filter((n) => n >= MASTERY_MAX).length;
    default:
      return 0;
  }
}

/** Marks any newly-completed collections and grants their rewards. */
export function checkCollections(s: FarmState): CollectionDef[] {
  const done: CollectionDef[] = [];
  for (const c of COLLECTIONS) {
    if (s.collectionsDone.includes(c.id)) continue;
    if (collectionProgress(s, c) >= c.total) {
      s.collectionsDone.push(c.id);
      if (c.coins) addCoins(s, c.coins);
      if (c.sela) addSela(s, c.sela);
      done.push(c);
    }
  }
  return done;
}
