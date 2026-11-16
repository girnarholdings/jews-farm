// Visual palette for procedural canvas art (no image assets — keeps the game tiny).

export const CROP_COLORS: Record<string, string> = {
  wheat: '#e8c24a', wheatred: '#d2691e', rice: '#f5e6c8', riceforbidden: '#4a3a5a',
  corn: '#e8c24a', cornwhite: '#f5f0dc', cornred: '#c0392b',
  strawberry: '#e74c3c', superstrawberry: '#ff4d4d', blueberry: '#5b6ee1', blackberries: '#3a2a4a',
  raspberry: '#d84b6a', cranberry: '#c0392b',
  tomato: '#e74c3c', tomatillos: '#8bc34a', carrot: '#e67e22', potato: '#c9a26b',
  sweetpotato: '#b5651d', yampurple: '#8e44ad',
  eggplant: '#6c3483', grapes: '#8e44ad', grapewhite: '#c9d1a0',
  pumpkin: '#e67e22', superpumpkin: '#ff8c42', squash: '#f1c40f', squashpetitpan: '#d4ac0d',
  squashacorn: '#2e7d32',
  peppers: '#e74c3c', bellpepperyellow: '#f1c40f', ghostchili: '#c0392b',
  onion: '#e8d8b0', broccoli: '#2e7d32', cabbage: '#7cb342', peas: '#66bb6a',
  lentilyellow: '#f1c40f', soybeans: '#c9b87a', peanuts: '#b5651d', chickpea: '#e8d8b0',
  watermelon: '#e74c3c', watermelonyellow: '#f1c40f', pineapples: '#f1c40f',
  cotton: '#f5f5f5', coffee: '#6d4c41', greentea: '#7cb342', sugarcane: '#c9d1a0',
  bamboo: '#66bb6a', artichoke: '#7cb342', asparagus: '#66bb6a', aloe: '#4caf50',
  agave: '#5b8a5b', nopales: '#2e7d32',
  sunflowers: '#f1c40f', goldenpoppy: '#e67e22', poppypurple: '#8e44ad', rosepink: '#ff9eb5',
  roseyellow: '#f1c40f', rosewhite: '#f5f5f5', rosegreen: '#7cb342', rosefireice: '#ff6b6b',
  tulipred: '#e74c3c', lily: '#f5f5f5', iris: '#5b6ee1', daffodils: '#f1c40f',
  lavender: '#8e7cc3', lilac: '#c9a0dc', carnationpink: '#ff9eb5', clover: '#66bb6a',
  lotus: '#ff9eb5', forgetmenot: '#5b6ee1', poinsettia: '#e74c3c', bluemorningglory: '#5b6ee1',
  hellebore: '#c9a0dc', saffron: '#e67e22', sesame: '#e8d8b0', etrog: '#f1c40f',
  jaffaorange: '#e67e22', barley: '#e8c24a', nachos: '#f1c40f',
};

export const TREE_FRUIT: Record<string, string> = {
  olive: '#5b6e1a', pomegranate: '#c0392b', date: '#8b4513', fig: '#6c3483', almond: '#b5651d',
  orange: '#e67e22', clementine: '#e67e22', lemon: '#f1c40f', lime: '#7cb342', grapefruit: '#e67e22',
  apple: '#e74c3c', cherry: '#c0392b', plum: '#8e44ad', peach: '#ffab66', apricot: '#f0a860',
  banana: '#f1c40f', passionfruit: '#8e44ad', cashew: '#d4ac0d', walnut: '#6d4c41', guava: '#e74c3c',
  starfruit: '#f1c40f', durian: '#c9a26b', jackfruit: '#c9a26b', breadfruit: '#7cb342',
  tamarind: '#8b4513', acai: '#5b2a7a',
};

export const ANIMAL_COLORS: Record<string, string> = {
  chicken: '#f5f5f5', cow: '#e8dcc8', sheep: '#f2ead8', goat: '#c9c9c9', duck: '#f5f0dc',
  goose: '#f5f5f5', rabbit: '#e8dcc8', horse: '#8b5a2b', turkey: '#6d4c41', bull: '#4a3a2a',
  calf: '#c9b87a', ram: '#f2ead8', ewe: '#f2ead8',
};

export const BUILDING_COLORS: Record<string, string> = {
  sheep_pen: '#8a6a4a', market_stall: '#c0392b', bakery: '#e8c24a', winery: '#6c3483',
  oil_press: '#7cb342',
};

// 14 sheep colors (from AnimalBreeding.xml) + pattern genes.
export const SHEEP_COLORS: Record<string, string> = {
  red: '#e74c3c', blue: '#3498db', navy: '#2c3e50', maroon: '#7f1d1d', fuchsia: '#c026d3',
  olive: '#808000', emerald: '#10b981', gold: '#d4a017', slate: '#708090', yellow: '#f1c40f',
  orange: '#e67e22', tangerine: '#f97316', white: '#f5f5f5', black: '#333333',
};

export const SHEEP_PATTERNS: readonly string[] = ['plain', 'dots', 'stripes', 'stars', 'patches'];
