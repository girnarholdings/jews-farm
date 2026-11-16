import type { CropDef } from '../types';
import { GROW_DAY_SECONDS } from '../types';
import { WITHER_MULTIPLIER } from '../systems/economy';

function crop(
  id: string,
  name: string,
  hebrew: string,
  seedCost: number,
  sell: number,
  plantXp: number,
  growDays: number,
  unlockLevel: number,
): CropDef {
  const growSeconds = Math.round(growDays * GROW_DAY_SECONDS);
  return {
    id,
    name,
    hebrew,
    seedCost,
    sell,
    plantXp,
    growSeconds,
    witherSeconds: Math.round(growSeconds * (WITHER_MULTIPLIER - 1)),
    unlockLevel,
  };
}

// Full FarmVille 1 crop roster (73) — real stats from items.xml (type="seed").
export const CROPS: Record<string, CropDef> = {
  cornwhite: crop('cornwhite', 'White Corn', 'תירס לבן', 10, 125, 3, 0.261, 1),
  sweetpotato: crop('sweetpotato', 'Sweet Potato', 'בטטה', 10, 125, 3, 1, 1),
  cornred: crop('cornred', 'Red Corn', 'תירס אדום', 10, 125, 3, 0.261, 1),
  peanuts: crop('peanuts', 'Peanuts', 'בוטנים', 20, 78, 1, 0.696, 1),
  strawberry: crop('strawberry', 'Strawberry', 'תות שדה', 10, 35, 1, 0.174, 1),
  superstrawberry: crop('superstrawberry', 'Super Strawberry', 'תות על', 10, 100, 1, 0.087, 1),
  eggplant: crop('eggplant', 'Eggplant', 'חציל', 25, 88, 2, 2, 1),
  wheat: crop('wheat', 'Wheat', 'חיטה (Chitah)', 35, 115, 2, 3, 1),
  soybeans: crop('soybeans', 'Soybeans', 'סויה', 15, 63, 2, 1, 1),
  squash: crop('squash', 'Squash', 'קישוא', 40, 121, 2, 2, 4),
  lilac: crop('lilac', 'Lilac', 'לילך', 35, 75, 1, 0.417, 4),
  pumpkin: crop('pumpkin', 'Pumpkin', 'דלעת', 30, 68, 1, 0.348, 5),
  superpumpkin: crop('superpumpkin', 'Super Pumpkin', 'דלעת על', 30, 100, 1, 0.174, 1),
  artichoke: crop('artichoke', 'Artichoke', 'ארטישוק', 70, 204, 2, 4, 6),
  rice: crop('rice', 'Rice', 'אורז', 45, 96, 1, 0.522, 7),
  raspberry: crop('raspberry', 'Raspberry', 'פטל', 20, 46, 0, 0.087, 8),
  daffodils: crop('daffodils', 'Daffodils', 'נרקיס', 60, 135, 2, 2, 8),
  cotton: crop('cotton', 'Cotton', 'כותנה', 75, 207, 2, 3, 9),
  cranberry: crop('cranberry', 'Cranberry', 'חמוצית', 55, 98, 1, 0.417, 10),
  bellpepperyellow: crop('bellpepperyellow', 'Yellow Pepper', 'פלפל צהוב', 75, 198, 2, 2, 11),
  peppers: crop('peppers', 'Peppers', 'פלפל', 70, 162, 2, 1, 12),
  bluemorningglory: crop('bluemorningglory', 'Morning Glory', 'תהילת הבוקר', 60, 123, 1, 0.522, 13),
  aloe: crop('aloe', 'Aloe', 'אלוי', 50, 85, 1, 0.261, 14),
  pineapples: crop('pineapples', 'Pineapple', 'אננס', 95, 242, 2, 2, 15),
  tulipred: crop('tulipred', 'Tulip', 'צבעוני', 75, 159, 2, 1, 15),
  squashpetitpan: crop('squashpetitpan', 'Pattypan Squash', 'קישוא פטיפן', 65, 160, 1, 0.696, 16),
  blueberry: crop('blueberry', 'Blueberry', 'אוכמנית', 50, 91, 1, 0.174, 17),
  watermelon: crop('watermelon', 'Watermelon', 'אבטיח', 130, 348, 2, 4, 18),
  grapes: crop('grapes', 'Grapes', 'ענבים (Anavim)', 85, 270, 2, 1, 19),
  tomato: crop('tomato', 'Tomato', 'עגבנייה', 100, 173, 1, 0.348, 20),
  rosepink: crop('rosepink', 'Pink Rose', 'ורד ורוד', 120, 254, 2, 2, 20),
  potato: crop('potato', 'Potato', 'תפוח אדמה', 135, 345, 2, 3, 21),
  riceforbidden: crop('riceforbidden', 'Black Rice', 'אורז שחור', 300, 400, 1, 0.348, 22),
  carrot: crop('carrot', 'Carrot', 'גזר', 110, 200, 1, 0.522, 22),
  coffee: crop('coffee', 'Coffee', 'קפה', 120, 243, 1, 0.696, 23),
  corn: crop('corn', 'Corn', 'תירס', 150, 380, 2, 3, 24),
  goldenpoppy: crop('goldenpoppy', 'Golden Poppy', 'פרג זהוב', 120, 200, 2, 0.348, 25),
  sunflowers: crop('sunflowers', 'Sunflowers', 'חמניות', 135, 315, 2, 1, 25),
  ghostchili: crop('ghostchili', 'Ghost Chili', "צ'ילי חריף", 80, 136, 1, 0.261, 26),
  agave: crop('agave', 'Agave', 'אגבה', 120, 240, 1, 0.696, 27),
  cabbage: crop('cabbage', 'Cabbage', 'כרוב', 140, 388, 2, 2, 27),
  greentea: crop('greentea', 'Green Tea', 'תה ירוק', 105, 191, 1, 0.417, 28),
  grapewhite: crop('grapewhite', 'White Grapes', 'ענבים לבנים', 245, 360, 2, 0.522, 29),
  blackberries: crop('blackberries', 'Blackberries', 'פטל שחור', 75, 117, 1, 0.174, 29),
  wheatred: crop('wheatred', 'Red Wheat', 'חיטה אדומה', 180, 449, 2, 3, 30),
  lavender: crop('lavender', 'Lavender', 'אזוביון', 160, 384, 2, 2, 30),
  rosegreen: crop('rosegreen', 'Green Rose', 'ורד ירוק', 155, 343, 3, 1, 30),
  lotus: crop('lotus', 'Lotus', 'לוטוס', 160, 250, 2, 0.348, 30),
  sugarcane: crop('sugarcane', 'Sugarcane', 'קנה סוכר', 165, 239, 1, 0.348, 31),
  saffron: crop('saffron', 'Saffron', 'זעפרן', 190, 333, 1, 0.417, 32),
  peas: crop('peas', 'Peas', 'אפונה', 190, 381, 3, 1, 32),
  watermelonyellow: crop('watermelonyellow', 'Yellow Watermelon', 'אבטיח צהוב', 205, 528, 2, 4, 33),
  onion: crop('onion', 'Onion', 'בצל', 170, 275, 1, 0.522, 34),
  broccoli: crop('broccoli', 'Broccoli', 'ברוקולי', 200, 473, 2, 2, 35),
  lily: crop('lily', 'Lily', 'שושן', 195, 369, 2, 1, 35),
  squashacorn: crop('squashacorn', 'Acorn Squash', 'דלעת בלוט', 175, 258, 1, 0.417, 36),
  asparagus: crop('asparagus', 'Asparagus', 'אספרגוס', 220, 357, 2, 0.696, 37),
  poppypurple: crop('poppypurple', 'Purple Poppy', 'פרג סגול', 200, 238, 1, 0.348, 38),
  iris: crop('iris', 'Iris', 'אירוס', 400, 520, 2, 1, 45),
  yampurple: crop('yampurple', 'Purple Yam', 'בטטה סגולה', 10, 125, 3, 0.261, 1),
  carnationpink: crop('carnationpink', 'Carnation', 'ציפורן', 11, 111, 3, 1, 1),
  tomatillos: crop('tomatillos', 'Tomatillo', 'עגבנייה מקסיקנית', 20, 120, 1, 0.417, 3),
  rosefireice: crop('rosefireice', 'Fire & Ice Rose', 'ורד אש-קרח', 150, 350, 3, 0.696, 20),
  roseyellow: crop('roseyellow', 'Yellow Rose', 'ורד צהוב', 20, 200, 3, 2, 5),
  rosewhite: crop('rosewhite', 'White Rose', 'ורד לבן', 75, 275, 3, 1, 12),
  lentilyellow: crop('lentilyellow', 'Lentils', 'עדשים', 20, 80, 1, 0.174, 5),
  forgetmenot: crop('forgetmenot', 'Forget-Me-Not', 'אל-תשכחני', 45, 126, 2, 0.783, 8),
  poinsettia: crop('poinsettia', 'Poinsettia', 'כלילת החורף', 45, 126, 3, 1, 8),
  clover: crop('clover', 'Clover', 'תלתן', 28, 68, 1, 0.174, 5),
  bamboo: crop('bamboo', 'Bamboo', 'במבוק', 75, 190, 2, 0.696, 12),
  nopales: crop('nopales', 'Prickly Pear', 'צבר (Tzabar)', 80, 200, 1, 0.696, 12),
  hellebore: crop('hellebore', 'Hellebore', 'חבצלת החורף', 75, 174, 2, 0.696, 12),
  nachos: crop('nachos', 'Nachos', 'נאצ׳וס', 25, 50, 1, 0.083, 1),

  // Themed additions (Seven Species + Israeli staples)
  etrog: crop('etrog', 'Etrog (Citron)', 'אתרוג', 60, 150, 2, 2, 4),
  sesame: crop('sesame', 'Sesame', 'שומשום (Sumsum)', 50, 120, 1, 0.5, 12),
  jaffaorange: crop('jaffaorange', 'Jaffa Orange', 'תפוז יפו', 80, 200, 2, 1.25, 10),
  chickpea: crop('chickpea', 'Chickpea', 'חומוס (Chimtza)', 30, 90, 2, 1, 5),
  barley: crop('barley', 'Barley', 'שעורה (Seora)', 30, 100, 2, 2, 2),
};

export function cropList(): CropDef[] {
  return Object.values(CROPS);
}

export function unlockedCrops(level: number): CropDef[] {
  return cropList().filter((c) => c.unlockLevel <= level);
}
