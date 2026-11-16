import type { QuestDef, QuestTask, QuestAction } from '../types';

function t(action: QuestAction, total: number, label: string, target?: string): QuestTask {
  return { action, total, label, target };
}

function q(
  id: string,
  chapter: string,
  name: string,
  description: string,
  tasks: QuestTask[],
  coins: number,
  xp: number,
  sela = 0,
): QuestDef {
  return { id, chapter, name, description, tasks, coins, xp, sela };
}

// Linear festival campaign — the farmer's first year on the kibbutz.
export const QUESTS: QuestDef[] = [
  // — Chapter 1: Aliyah (the arrival) —
  q('q1', 'Aliyah', 'Welcome to the Kibbutz',
    'Plow three plots of earth. The land has waited for your hands.',
    [t('plow', 3, 'Plow 3 plots')], 50, 10),
  q('q2', 'Aliyah', 'The First Seed',
    'Plant wheat \u2014 chitah, first of the Seven Species.',
    [t('plant', 1, 'Plant wheat', 'wheat')], 40, 10),
  q('q3', 'Aliyah', 'First Harvest',
    'Harvest your wheat. Mazel tov in advance, a chaim.',
    [t('harvest', 1, 'Harvest wheat', 'wheat')], 60, 15),
  q('q4', 'Aliyah', 'Put Down Roots',
    'Plant a tree. A farm needs shade, roots, and a little patience.',
    [t('buy', 1, 'Plant any tree or animal')], 100, 20),

  // — Chapter 2: Shavuot (first fruits) —
  q('q5', 'Shavuot', 'The Wheat of Shavuot',
    'Shavuot is the festival of the wheat harvest. Bring in five.',
    [t('harvest', 5, 'Harvest 5 wheat', 'wheat')], 150, 25),
  q('q6', 'Shavuot', 'Shtei HaLechem',
    'Two loaves were brought to the Temple. Grow the grain for them.',
    [t('plant', 3, 'Plant 3 soybeans', 'soybeans')], 120, 20),
  q('q7', 'Shavuot', 'Bikkurim \u2014 First Fruits',
    'Gather grapes, the vine of the Seven Species.',
    [t('harvest', 3, 'Harvest 3 grapes', 'grapes')], 180, 30),
  q('q8', 'Shavuot', 'The Omer',
    'Count the harvest \u2014 bring in ten of anything that grows.',
    [t('harvest', 10, 'Harvest 10 crops')], 200, 35),

  // — Chapter 3: Sukkot (harvest festival) —
  q('q9', 'Sukkot', 'Chag HaAsif',
    'Sukkot is the great harvest festival. Fill the barn with fifteen.',
    [t('harvest', 15, 'Harvest 15 crops')], 250, 40),
  q('q10', 'Sukkot', 'The Four Species',
    'The etrog is the heart of Sukkot. Plant two of them.',
    [t('plant', 2, 'Plant 2 etrog', 'etrog')], 160, 25),
  q('q11', 'Sukkot', 'Sukkah of Plenty',
    'Plant more trees and animals around your sukkah of a farm.',
    [t('buy', 2, 'Plant 2 trees/animals')], 220, 35),
  q('q12', 'Sukkot', 'Lulav & Etrog',
    'Harvest your etrogim \u2014 the fruit of the lulav.',
    [t('harvest', 3, 'Harvest 3 etrog', 'etrog')], 300, 45),

  // — Chapter 4: Tu BiShvat (new year for trees) —
  q('q13', 'Tu BiShvat', 'New Year for Trees',
    'Tu BiShvat is the birthday of the trees. Plant three.',
    [t('buy', 3, 'Plant 3 trees/animals')], 350, 50),
  q('q14', 'Tu BiShvat', 'The Almond Blossom',
    'The almond is the first to blossom in Israel. Plant one.',
    [t('buy', 1, 'Plant an almond tree', 'almond')], 200, 30),
  q('q15', 'Tu BiShvat', 'The Seven Species',
    'Harvest the fruits of the land \u2014 three harvests from your trees.',
    [t('harvestObject', 3, 'Harvest 3 trees')], 400, 55),

  // — Chapter 5: Rosh Hashanah —
  q('q16', 'Rosh Hashanah', 'Apples & Honey',
    'For a sweet new year, plant an apple tree.',
    [t('buy', 1, 'Plant an apple tree', 'apple')], 250, 40),
  q('q17', 'Rosh Hashanah', 'A Sweet New Year',
    'Pomegranates \u2014 may your merits be as many as their seeds.',
    [t('harvestObject', 3, 'Harvest 3 pomegranates', 'pomegranate')], 380, 50),
  q('q18', 'Rosh Hashanah', 'Shanah Tovah',
    'Bring in a bountiful twenty harvests to welcome the new year.',
    [t('harvest', 20, 'Harvest 20 crops')], 450, 60),

  // — Chapter 6: Shmita & Jubilee —
  q('q19', 'Shmita', 'Rest the Land',
    'Work the land \u2014 plow five, plant ten. The sabbatical year remembers.',
    [t('plow', 5, 'Plow 5 plots'), t('plant', 10, 'Plant 10 crops')], 500, 70, 1),
  q('q20', 'Shmita', 'The Jubilee',
    'Bring in thirty harvests. A year of release, a year of plenty.',
    [t('harvest', 30, 'Harvest 30 crops')], 800, 100, 2),
];
