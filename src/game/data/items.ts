import type { ItemDef } from '../types';
import { GROW_DAY_SECONDS } from '../types';

function item(
  id: string,
  name: string,
  hebrew: string,
  kind: ItemDef['kind'],
  cost: number,
  growDays: number,
  yieldCoins: number,
  product: string,
  unlockLevel: number,
  selaCost = 0,
): ItemDef {
  return {
    id,
    name,
    hebrew,
    kind,
    cost,
    selaCost,
    xp: Math.floor(cost / 100),
    growSeconds: growDays === 0 ? 0 : Math.round(growDays * GROW_DAY_SECONDS),
    yieldCoins,
    product,
    unlockLevel,
    sizeX: 1,
    sizeY: 1,
  };
}

// Fruit/nut trees (real FarmVille stats; Seven Species: olive, fig, pomegranate, date, almond).
export const ITEMS: Record<string, ItemDef> = {
  olive: item('olive', 'Olive Tree', 'זית (Zayit)', 'tree', 1200, 4, 112, 'Olives', 32),
  pomegranate: item('pomegranate', 'Pomegranate Tree', 'רימון (Rimon)', 'tree', 1075, 5, 108, 'Pomegranates', 23),
  date: item('date', 'Date Palm', 'תמר (Tamar)', 'tree', 800, 3, 69, 'Dates', 20),
  fig: item('fig', 'Fig Tree', 'תאנה (Te\'enah)', 'tree', 375, 3, 33, 'Figs', 3),
  almond: item('almond', 'Almond Tree', 'שקד (Shaked)', 'tree', 675, 3, 55, 'Almonds', 1),
  grapefruit: item('grapefruit', 'Grapefruit Tree', 'אשכולית', 'tree', 575, 3, 50, 'Grapefruit', 11),
  orange: item('orange', 'Orange Tree', 'תפוז (Tapuz)', 'tree', 425, 4, 40, 'Oranges', 1),
  clementine: item('clementine', 'Clementine Tree', 'קלמנטינה', 'tree', 850, 4, 80, 'Clementines', 1),
  lemon: item('lemon', 'Lemon Tree', 'לימון', 'tree', 475, 3, 41, 'Lemons', 7),
  lime: item('lime', 'Lime Tree', 'ליים', 'tree', 750, 5, 75, 'Limes', 10),
  avocado: item('avocado', 'Avocado Tree', 'אבוקדו', 'tree', 425, 3, 37, 'Avocados', 5),
  apple: item('apple', 'Apple Tree', 'תפוח (Tapuach)', 'tree', 325, 3, 28, 'Apples', 1),
  cherry: item('cherry', 'Cherry Tree', 'דובדבן', 'tree', 225, 2, 18, 'Cherries', 1),
  plum: item('plum', 'Plum Tree', 'שזיף (Shezif)', 'tree', 350, 3, 30, 'Plums', 2),
  peach: item('peach', 'Peach Tree', 'אפרסק', 'tree', 500, 4, 47, 'Peaches', 4),
  apricot: item('apricot', 'Apricot Tree', 'משמש (Mishmesh)', 'tree', 600, 4, 56, 'Apricots', 8),
  banana: item('banana', 'Banana Tree', 'בננה', 'tree', 650, 3, 56, 'Bananas', 14),
  passionfruit: item('passionfruit', 'Passionfruit Vine', 'פסיפלורה', 'tree', 925, 5, 93, 'Passionfruit', 17),
  cashew: item('cashew', 'Cashew Tree', 'קשיו', 'tree', 800, 3, 41, 'Cashews', 7),
  walnut: item('walnut', 'Walnut Tree', 'אגוז מלך', 'tree', 575, 3, 50, 'Walnuts', 11),
  guava: item('guava', 'Guava Tree', 'גויאבה', 'tree', 675, 3, 55, 'Guavas', 15),
  starfruit: item('starfruit', 'Starfruit Tree', 'כוכבית', 'tree', 1200, 4, 65, 'Starfruit', 2),
  durian: item('durian', 'Durian Tree', 'דוריאן', 'tree', 1300, 4, 65, 'Durian', 1),
  jackfruit: item('jackfruit', 'Jackfruit Tree', "ג'קפרוט", 'tree', 3000, 3, 140, 'Jackfruit', 1),
  breadfruit: item('breadfruit', 'Breadfruit Tree', 'עץ הלחם', 'tree', 600, 3, 55, 'Breadfruit', 1),
  tamarind: item('tamarind', 'Tamarind Tree', 'תמרינדי', 'tree', 700, 3, 35, 'Tamarind', 15),
  acai: item('acai', 'Açaí Palm', 'אסאי', 'tree', 0, 2, 158, 'Açaí Berries', 1, 27),

  // Animals (kosher/neutral farm set — no pig, out of respect for the theme).
  chicken: item('chicken', 'Chicken', 'תרנגולת', 'animal', 400, 1, 8, 'Eggs', 4),
  cow: item('cow', 'Cow', 'פרה (Parah)', 'animal', 300, 1, 6, 'Milk', 1),
  sheep: item('sheep', 'Sheep', 'כבש (Keves)', 'animal', 700, 3, 28, 'Wool', 7),
  goat: item('goat', 'Goat', 'עז (Ez)', 'animal', 1800, 2, 54, 'Goat Milk', 18),
  duck: item('duck', 'Duck', 'ברווז', 'animal', 1500, 2, 45, 'Down', 15),
  goose: item('goose', 'Goose', 'אווז (Avaz)', 'animal', 2000, 2, 80, 'Goose Feathers', 1),
  rabbit: item('rabbit', 'Rabbit', 'ארנב (Arnav)', 'animal', 1200, 4, 60, 'Fur', 12),
  horse: item('horse', 'Horse', 'סוס (Sus)', 'animal', 2100, 3, 84, 'Horsehair', 21),
  turkey: item('turkey', 'Turkey', 'תרנגול הודו', 'animal', 2500, 2, 80, 'Feathers', 20),
  bull: item('bull', 'Bull', 'שור (Shor)', 'animal', 3000, 1, 80, 'Bull Hair', 1),
  calf: item('calf', 'Calf', 'עגל (Egel)', 'animal', 2400, 1, 80, 'Calf Hair', 1),

  // Decorations
  israeli_flag: item('israeli_flag', 'Flag of Israel', 'דגל ישראל', 'decor', 500, 0, 0, '', 1),
  hanukkiah: item('hanukkiah', 'Hanukkiah', 'חנוכייה', 'decor', 300, 0, 0, '', 1),
  well: item('well', 'Stone Well', 'באר', 'decor', 800, 0, 0, '', 2),
  bench: item('bench', 'Garden Bench', 'ספסל', 'decor', 400, 0, 0, '', 2),

  // Breeding
  ram: item('ram', 'Ram', 'איל (Ayil)', 'animal', 1500, 1, 60, 'Wool', 8),
  ewe: item('ewe', 'Ewe', 'רחל (Rachel)', 'animal', 1200, 1, 60, 'Wool', 8),
  sheep_pen: item('sheep_pen', 'Sheep Pen', 'דיר כבשים', 'building', 2000, 0, 0, '', 8),

  // Economy buildings
  market_stall: item('market_stall', 'Market Stall', 'דוכן שוק', 'building', 1500, 0, 0, '', 10),
  bakery: item('bakery', 'Bakery', 'מאפייה', 'building', 2000, 0, 0, '', 12),
  winery: item('winery', 'Winery', 'יקב', 'building', 2500, 0, 0, '', 14),
  oil_press: item('oil_press', 'Oil Press', 'בית בד', 'building', 3000, 0, 0, '', 16),
};

export function itemList(kind?: ItemDef['kind']): ItemDef[] {
  const all = Object.values(ITEMS);
  return kind ? all.filter((i) => i.kind === kind) : all;
}
