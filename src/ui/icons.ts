// Authored inline SVG icon set — one consistent stroke system (24px grid, 2px stroke, round caps).
const ATTRS =
  'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"';

const ICONS: Record<string, string> = {
  cart: `<svg ${ATTRS}><path d="M6 7h12l1.4 12.2a1 1 0 0 1-1 1.3H5.6a1 1 0 0 1-1-1.3L6 7z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg>`,
  people: `<svg ${ATTRS}><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20.5c.6-3.7 3.3-5.5 6.5-5.5s5.9 1.8 6.5 5.5"/><circle cx="17.5" cy="9" r="2.5"/><path d="M16 20.5c.4-2.6 2.1-4.4 4.4-5"/></svg>`,
  expand: `<svg ${ATTRS}><path d="M15 3h6v6"/><path d="M21 3l-7 7"/><path d="M9 21H3v-6"/><path d="M3 21l7-7"/></svg>`,
  soundOn: `<svg ${ATTRS}><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>`,
  soundOff: `<svg ${ATTRS}><path d="M11 5 6 9H3v6h3l5 4z"/><path d="m16 9 6 6"/><path d="m22 9-6 6"/></svg>`,
  help: `<svg ${ATTRS}><circle cx="12" cy="12" r="9"/><path d="M9.3 9.1a2.7 2.7 0 0 1 5.4.4c0 1.7-2.7 2-2.7 3.9"/><circle cx="12" cy="17.4" r="0.6" fill="currentColor" stroke="none"/></svg>`,
  quest: `<svg ${ATTRS}><path d="M6 3h9l3 3v15H6z"/><path d="M8 9h8"/><path d="M8 13h8"/><path d="M8 17h5"/></svg>`,
  reset: `<svg ${ATTRS}><path d="M3 12a9 9 0 1 0 2.7-6.4L3 8"/><path d="M3 3v5h5"/></svg>`,
  close: `<svg ${ATTRS}><path d="M6 6l12 12"/><path d="M18 6 6 18"/></svg>`,
  back: `<svg ${ATTRS}><path d="M19 12H5"/><path d="m11 6-6 6 6 6"/></svg>`,
};

export function icon(name: string, size = 20): string {
  const svg = ICONS[name];
  return svg ? svg.replace('<svg', `<svg width="${size}" height="${size}"`) : '';
}
