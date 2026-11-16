export interface Recipe {
  id: string;
  name: string;
  hebrew: string;
  building: string; // itemId of the crafting building
  input: string; // cropId of the required bushel
  inputQty: number;
  outputValue: number; // coins per crafted good
  cookSeconds: number;
}

export const RECIPES: Recipe[] = [
  { id: 'challah', name: 'Challah', hebrew: 'חלה', building: 'bakery', input: 'wheat', inputQty: 3, outputValue: 400, cookSeconds: 45 * 60 },
  { id: 'pita', name: 'Pita', hebrew: 'פיתה', building: 'bakery', input: 'wheat', inputQty: 2, outputValue: 200, cookSeconds: 20 * 60 },
  { id: 'soybread', name: 'Soy Bread', hebrew: 'לחם סויה', building: 'bakery', input: 'soybeans', inputQty: 2, outputValue: 280, cookSeconds: 30 * 60 },
  { id: 'wine', name: 'Wine', hebrew: 'יין (Yayin)', building: 'winery', input: 'grapes', inputQty: 3, outputValue: 500, cookSeconds: 60 * 60 },
  { id: 'grapejuice', name: 'Grape Juice', hebrew: 'מיץ ענבים', building: 'winery', input: 'grapes', inputQty: 2, outputValue: 250, cookSeconds: 25 * 60 },
  { id: 'sesameoil', name: 'Sesame Oil', hebrew: 'שמן שומשום', building: 'oil_press', input: 'sesame', inputQty: 3, outputValue: 350, cookSeconds: 40 * 60 },
  { id: 'tahini', name: 'Tahini', hebrew: 'טחינה', building: 'oil_press', input: 'sesame', inputQty: 2, outputValue: 200, cookSeconds: 20 * 60 },
];

export function recipesFor(buildingId: string): Recipe[] {
  return RECIPES.filter((r) => r.building === buildingId);
}
