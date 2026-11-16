export interface Persona {
  id: string;
  name: string;
  hebrew: string;
  role: string;
}

export const PLAYER: Persona = { id: 'player', name: 'You', hebrew: 'אתה', role: 'Kibbutznik' };
export const SABA_MOISHE: Persona = { id: 'moishe', name: 'Saba Moishe', hebrew: 'סבא מוישה', role: 'Kibbutz Elder' };
export const SHOSHANA: Persona = { id: 'shoshana', name: 'Shoshana', hebrew: 'שושנה', role: 'Neighbor' };
export const YOSSI: Persona = { id: 'yossi', name: 'Yossi', hebrew: 'יוסי', role: 'Neighbor' };
export const RIVKA: Persona = { id: 'rivka', name: 'Rivka', hebrew: 'רבקה', role: 'Neighbor' };

function pick(lines: readonly string[]): string {
  return lines[Math.floor(Math.random() * lines.length)];
}

const GREET_FIRST = [
  'Shalom aleichem, olim chadashim! Welcome to the kibbutz. Your bubbe\u2019s farm \u2014 may her memory be a blessing \u2014 it\u2019s yours now. The soil remembers her hands.',
  'Nu, you finally came! The land has been waiting, my friend. Roll up your sleeves, we\u2019ll shlep some earth together.',
  'Shalom, yedid! A new farmer, a new beginning. B\u2019hatzlacha \u2014 and b\u2019ezrat Hashem, the rain will come on time.',
];

const GREET_BACK = [
  'Shalom aleichem! Good to see you back on the land.',
  'Ah, you returned! The tomatoes were asking for you. Nu, come, come.',
  'Baruch ha\u2019ba \u2014 welcome back. The kibbutz missed your hands.',
];

const HARVEST = [
  'Mazel tov! A sheynem dank to the soil. That\u2019s naches, my friend \u2014 your zayde would kvell.',
  'Kol hakavod! You\u2019ve got the touch. Beseder, that\u2019s farming.',
  'Oy, look at that! Sababa. The land gave you a mechaye today.',
  'Yalla, that\u2019s the way! Harvest it, sell it, plant again.',
];

const PLANT = [
  'Plant it with love, it grows with pride. That\u2019s the kibbutz way, a chaim.',
  'Nu, good seed. Now the sun and the rain will do their part, b\u2019ezrat Hashem.',
];

const LEVELUP = [
  'Mazel tov on the level! You\u2019re becoming a real mensch of the soil.',
  'Kol hakavod! Higher and higher \u2014 like the dates in the Golan.',
];

const POOR = [
  'Oy vey, not enough shekels. Go shlep some more harvest first.',
  'Nu, the pockets are empty. A farmer needs coins like the Negev needs rain.',
];

const WITHERED = [
  'Oy, it withered! Don\u2019t kvetch, just clear it and plant anew. Tomorrow is another day.',
  'It happens to the best of us. A little tzuris, a little rain, and you start again.',
];

const GROWING = [
  'Patience, a chaim. Good things come b\u2019sha\u2019ah tovah \u2014 in their own time.',
  'Let it grow, let it grow. The wheat doesn\u2019t ask how long, it just grows.',
];

const SELL = [
  'A sheynem dank, and a few shekels richer. Now that\u2019s a shidduch made in the market.',
];

export const lines = {
  greetFirst: () => pick(GREET_FIRST),
  greetBack: () => pick(GREET_BACK),
  harvest: () => pick(HARVEST),
  plant: () => pick(PLANT),
  levelUp: () => pick(LEVELUP),
  poor: () => pick(POOR),
  withered: () => pick(WITHERED),
  growing: () => pick(GROWING),
  sell: () => pick(SELL),
};
