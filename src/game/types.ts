export type PlotState = 'plowed' | 'planted';

export interface CropDef {
  id: string;
  name: string;
  hebrew: string;
  seedCost: number;
  sell: number;
  plantXp: number;
  growSeconds: number;
  witherSeconds: number;
  unlockLevel: number;
  premium: boolean;
}

export type ItemKind = 'tree' | 'animal' | 'decor' | 'building';

export interface ItemDef {
  id: string;
  name: string;
  hebrew: string;
  kind: ItemKind;
  cost: number;
  selaCost: number;
  xp: number;
  growSeconds: number;
  yieldCoins: number;
  product: string;
  unlockLevel: number;
  sizeX: number;
  sizeY: number;
}

export interface Plot {
  state: PlotState;
  cropId?: string;
  plantedAt?: number;
  watered?: boolean;
}

export type ObjectState = 'growing' | 'grown';

export interface PlacedObject {
  id: number;
  itemId: string;
  col: number;
  row: number;
  plantedAt: number;
  state: ObjectState;
  variant?: string; // bred animal color
  pattern?: string; // bred animal pattern gene
  breeding?: number; // pen: breeding finishAt (epoch ms)
}

export type QuestAction = 'plow' | 'plant' | 'harvest' | 'buy' | 'harvestObject';

export interface QuestTask {
  action: QuestAction;
  target?: string;
  total: number;
  label: string;
}

export interface QuestDef {
  id: string;
  chapter: string;
  name: string;
  description: string;
  tasks: QuestTask[];
  coins: number;
  xp: number;
  sela: number;
}

export interface QuestState {
  completed: string[];
  progress: Record<string, number[]>;
}

export interface Stats {
  plows: number;
  plants: number;
  harvests: number;
  objects: number;
  coinsEarned: number;
}

export interface CraftJob {
  id: number;
  recipeId: string;
  buildingId: number;
  finishAt: number;
}

export interface FarmState {
  cols: number;
  rows: number;
  plots: (Plot | null)[];
  objects: PlacedObject[];
  coins: number;
  sela: number;
  xp: number;
  level: number;
  energy: number;
  maxEnergy: number;
  inventory: Record<string, number>;
  lastSeen: number;
  quests: QuestState;
  stats: Stats;
  ribbons: string[];
  lastGiftDay?: string;
  bushels: Record<string, number>;
  crafts: Record<string, number>;
  craftQueue: CraftJob[];
}

/** FarmVille "in-game day" is 23h; growTime(days) × this = real seconds. */
export const GROW_DAY_SECONDS = 82_800;
