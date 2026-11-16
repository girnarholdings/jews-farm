import type { CropDef, FarmState, ItemDef } from '../game/types';
import { xpForLevel, MAX_LEVEL } from '../game/data/levels';
import { masteryStars } from '../game/systems/mastery';
import { icon } from './icons';

export class Hud {
  private levelEl: HTMLElement;
  private xpFill: HTMLElement;
  private xpText: HTMLElement;
  private coinsEl: HTMLElement;
  private selaEl: HTMLElement;
  private fuelEl: HTMLElement;
  private toastEl: HTMLElement;
  private modalEl: HTMLElement;
  private modalBody: HTMLElement;
  private toastTimer = 0;

  constructor(container: HTMLElement) {
    const bar = document.createElement('div');
    bar.id = 'hud';
    bar.innerHTML = `
      <div class="hud-left">
        <span class="badge" id="level">Lv 1</span>
        <div class="xp"><div class="xp-fill" id="xp-fill"></div><span class="xp-text" id="xp-text"></span></div>
      </div>
      <div class="hud-right">
        <span class="res fuel" id="fuel">Fuel 20</span>
        <span class="res coins" id="coins">₪0</span>
        <span class="res sela" id="sela">Sela 0</span>
      </div>`;
    container.appendChild(bar);

    this.toastEl = document.createElement('div');
    this.toastEl.id = 'toast';
    container.appendChild(this.toastEl);

    this.modalEl = document.createElement('div');
    this.modalEl.id = 'modal';
    this.modalEl.className = 'hidden';
    this.modalEl.innerHTML = `
      <div class="modal-card">
        <div class="modal-head"><span id="modal-title"></span><button id="modal-close"></button></div>
        <div class="modal-body" id="modal-body"></div>
      </div>`;
    container.appendChild(this.modalEl);
    this.modalEl.querySelector('#modal-close')!.innerHTML = icon('close', 16);
    this.modalEl.querySelector('#modal-close')!.addEventListener('click', () => this.hideModal());
    this.modalEl.addEventListener('click', (e) => {
      if (e.target === this.modalEl) this.hideModal();
    });
    this.modalBody = this.modalEl.querySelector('#modal-body')!;

    this.levelEl = bar.querySelector('#level')!;
    this.xpFill = bar.querySelector('#xp-fill')!;
    this.xpText = bar.querySelector('#xp-text')!;
    this.coinsEl = bar.querySelector('#coins')!;
    this.selaEl = bar.querySelector('#sela')!;
    this.fuelEl = bar.querySelector('#fuel')!;
  }

  update(s: FarmState): void {
    this.levelEl.textContent = `Lv ${s.level}`;
    this.coinsEl.textContent = `₪${s.coins.toLocaleString()}`;
    this.selaEl.textContent = `Sela ${s.sela}`;
    this.fuelEl.textContent = `Fuel ${Math.floor(s.fuel)}`;
    const base = xpForLevel(s.level);
    const next = s.level >= MAX_LEVEL ? base : xpForLevel(s.level + 1);
    const span = Math.max(1, next - base);
    const pct = Math.min(100, Math.max(0, ((s.xp - base) / span) * 100));
    this.xpFill.style.width = `${pct}%`;
    this.xpText.textContent = `${Math.max(0, s.xp - base)}/${span} XP`;
  }

  toast(msg: string): void {
    this.toastEl.textContent = msg;
    this.toastEl.classList.add('show');
    clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => this.toastEl.classList.remove('show'), 2400);
  }

  showSeeds(crops: CropDef[], level: number, mastery: Record<string, number>, onPick: (id: string) => void): void {
    this.modalEl.querySelector('#modal-title')!.textContent = 'Plant a seed';
    this.modalBody.innerHTML = '';
    for (const c of crops) {
      const btn = document.createElement('button');
      btn.className = 'seed-card';
      if (c.unlockLevel > level) {
        btn.classList.add('locked');
        btn.innerHTML = `<span class="sc-name">${c.name}</span><span class="sc-lock">Lv ${c.unlockLevel}</span>`;
      } else {
        const stars = masteryStars(mastery[c.id] ?? 0);
        btn.innerHTML = `<span class="sc-name">${c.name} <span class="sc-stars">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</span> <small>${c.hebrew}</small></span><span class="sc-cost">${c.seedCost}₪</span><span class="sc-sell">+${c.sell}₪</span>`;
        btn.addEventListener('click', () => {
          this.hideModal();
          onPick(c.id);
        });
      }
      this.modalBody.appendChild(btn);
    }
    this.modalEl.classList.remove('hidden');
  }

  showStore(
    trees: ItemDef[],
    animals: ItemDef[],
    decors: ItemDef[],
    buildings: ItemDef[],
    level: number,
    onPick: (id: string) => void,
  ): void {
    this.modalEl.querySelector('#modal-title')!.textContent = 'The Shuk';
    this.modalBody.innerHTML = '';
    this.addSection('Trees', trees, level, onPick);
    this.addSection('Animals', animals, level, onPick);
    this.addSection('Buildings', buildings, level, onPick);
    this.addSection('Decorations', decors, level, onPick);
    this.modalEl.classList.remove('hidden');
  }

  confirm(title: string, message: string, yesLabel: string, onYes: () => void): void {
    this.modalEl.querySelector('#modal-title')!.textContent = title;
    this.modalBody.innerHTML = '';
    const p = document.createElement('p');
    p.textContent = message;
    p.style.cssText = 'grid-column:1/-1;padding:8px 4px;font-size:14px;';
    this.modalBody.appendChild(p);
    const btn = document.createElement('button');
    btn.textContent = yesLabel;
    btn.style.cssText =
      'grid-column:1/-1;padding:12px;border:0;border-radius:12px;background:#0038b8;color:#fff;font-weight:700;font-size:15px;';
    btn.addEventListener('click', () => {
      this.hideModal();
      onYes();
    });
    this.modalBody.appendChild(btn);
    const cancel = document.createElement('button');
    cancel.textContent = 'Cancel';
    cancel.style.cssText =
      'grid-column:1/-1;padding:10px;border:0;border-radius:12px;background:rgba(0,0,0,0.08);color:#1b2a1e;font-size:14px;';
    cancel.addEventListener('click', () => this.hideModal());
    this.modalBody.appendChild(cancel);
    this.modalEl.classList.remove('hidden');
  }

  private addSection(title: string, items: ItemDef[], level: number, onPick: (id: string) => void): void {
    const h = document.createElement('h3');
    h.textContent = title;
    this.modalBody.appendChild(h);
    for (const it of items) {
      const btn = document.createElement('button');
      btn.className = 'seed-card';
      if (it.unlockLevel > level) {
        btn.classList.add('locked');
        btn.innerHTML = `<span class="sc-name">${it.name}</span><span class="sc-lock">Lv ${it.unlockLevel}</span>`;
      } else {
        btn.innerHTML = `<span class="sc-name">${it.name} <small>${it.hebrew}</small></span><span class="sc-cost">${it.selaCost > 0 ? it.selaCost + ' Sela' : it.cost + '₪'}</span><span class="sc-sell">${it.yieldCoins}₪</span>`;
        btn.addEventListener('click', () => {
          this.hideModal();
          onPick(it.id);
        });
      }
      this.modalBody.appendChild(btn);
    }
  }

  hideModal(): void {
    this.modalEl.classList.add('hidden');
  }

  /** Generic modal: rows of label/value + action buttons. */
  modal(
    title: string,
    rows: Array<[string, string]>,
    buttons: Array<{ label: string; cb: () => void; primary?: boolean }>,
  ): void {
    this.modalEl.querySelector('#modal-title')!.textContent = title;
    this.modalBody.innerHTML = '';
    for (const [label, value] of rows) {
      const row = document.createElement('div');
      row.style.cssText =
        'grid-column:1/-1;display:flex;justify-content:space-between;gap:8px;padding:8px 4px;font-size:14px;';
      row.innerHTML = `<span>${label}</span><span style="font-weight:600;text-align:right">${value}</span>`;
      this.modalBody.appendChild(row);
    }
    for (const b of buttons) {
      const btn = document.createElement('button');
      btn.textContent = b.label;
      btn.style.cssText = `grid-column:1/-1;padding:12px;border:0;border-radius:12px;${
        b.primary ? 'background:#0038b8;color:#fff;' : 'background:rgba(0,0,0,0.08);color:#1b2a1e;'
      }font-weight:700;font-size:15px;`;
      btn.addEventListener('click', () => {
        this.hideModal();
        b.cb();
      });
      this.modalBody.appendChild(btn);
    }
    this.modalEl.classList.remove('hidden');
  }

  /** Returns the modal body for custom, non-closing content. */
  beginModal(title: string): HTMLElement {
    this.modalEl.querySelector('#modal-title')!.textContent = title;
    this.modalBody.innerHTML = '';
    this.modalEl.classList.remove('hidden');
    return this.modalBody;
  }
}
