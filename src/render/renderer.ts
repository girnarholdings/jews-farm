import { TILE_W, TILE_H, tileCenter, type ScreenPos } from './iso';
import type { FarmState, CropDef, Plot, PlacedObject } from '../game/types';
import { CROPS } from '../game/data/crops';
import { ITEMS } from '../game/data/items';
import { cropStage, objectState } from '../game/systems/growth';
import { drawFarmer } from './farmer';
import { CROP_COLORS, TREE_FRUIT, ANIMAL_COLORS, BUILDING_COLORS, SHEEP_COLORS } from './palette';

const DECOR_COLORS: Record<string, string> = {
  israeli_flag: '#4a7ad0',
  hanukkiah: '#d4a017',
  well: '#9aa0a6',
  bench: '#8a6a4a',
};

function fmtTime(seconds: number): string {
  const m = Math.ceil(seconds / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  return rm === 0 ? `${h}h` : `${h}h ${rm}m`;
}

interface Effect {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  text?: string;
}

export class Renderer {
  readonly canvas: HTMLCanvasElement;
  readonly ctx: CanvasRenderingContext2D;
  camera = { x: 0, y: 0, zoom: 1 };
  private dpr = 1;
  private effects: Effect[] = [];
  private lastState: FarmState | null = null;

  constructor(container: HTMLElement) {
    this.canvas = document.createElement('canvas');
    this.canvas.style.cssText =
      'position:absolute;inset:0;width:100%;height:100%;touch-action:none;';
    container.appendChild(this.canvas);
    const ctx = this.canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('Canvas 2D unavailable');
    this.ctx = ctx;
    this.resize();
    window.addEventListener('resize', () => {
      this.resize();
      if (this.lastState) this.fit(this.lastState);
    });
  }

  resize(): void {
    const rect = this.canvas.getBoundingClientRect();
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(rect.width * this.dpr));
    const h = Math.max(1, Math.round(rect.height * this.dpr));
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
  }

  get viewWidth(): number {
    return this.canvas.width / this.dpr;
  }

  get viewHeight(): number {
    return this.canvas.height / this.dpr;
  }

  screenToWorld(sx: number, sy: number): ScreenPos {
    return {
      x: (sx - this.camera.x) / this.camera.zoom,
      y: (sy - this.camera.y) / this.camera.zoom,
    };
  }

  fit(state: FarmState): void {
    const hw = TILE_W / 2;
    const hh = TILE_H / 2;
    const minX = -state.rows * hw;
    const maxX = state.cols * hw;
    const minY = -hh;
    const maxY = (state.cols + state.rows - 1) * hh;
    const fit = Math.min(this.viewWidth / (maxX - minX), this.viewHeight / (maxY - minY)) * 0.94;
    this.camera.zoom = Math.max(0.4, Math.min(1.2, fit));
    this.camera.x = this.viewWidth / 2 - ((minX + maxX) / 2) * this.camera.zoom;
    this.camera.y = this.viewHeight / 2 - ((minY + maxY) / 2) * this.camera.zoom;
  }

  render(state: FarmState, now: number): void {
    this.lastState = state;
    const { ctx } = this;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.fillStyle = '#6b9b3a';
    ctx.fillRect(0, 0, this.viewWidth, this.viewHeight);

    ctx.save();
    ctx.translate(this.camera.x, this.camera.y);
    ctx.scale(this.camera.zoom, this.camera.zoom);

    for (let row = 0; row < state.rows; row++) {
      for (let col = 0; col < state.cols; col++) this.drawGrass(col, row);
    }
    for (let row = 0; row < state.rows; row++) {
      for (let col = 0; col < state.cols; col++) {
        const plot = state.plots[col + row * state.cols];
        if (plot) this.drawPlot(col, row, plot, now);
      }
    }
    for (const obj of state.objects) this.drawObject(obj, now);

    const fy = tileCenter(Math.floor(state.cols / 2), state.rows - 2);
    drawFarmer(ctx, fy.x, fy.y);

    this.updateEffects(16);
    this.drawEffects();

    ctx.restore();
  }

  private beginDiamond(col: number, row: number): void {
    const c = tileCenter(col, row);
    this.ctx.beginPath();
    this.ctx.moveTo(c.x, c.y - TILE_H / 2);
    this.ctx.lineTo(c.x + TILE_W / 2, c.y);
    this.ctx.lineTo(c.x, c.y + TILE_H / 2);
    this.ctx.lineTo(c.x - TILE_W / 2, c.y);
    this.ctx.closePath();
  }

  private drawGrass(col: number, row: number): void {
    const c = tileCenter(col, row);
    const even = (col + row) % 2 === 0;
    const g = this.ctx.createLinearGradient(c.x, c.y - TILE_H / 2, c.x, c.y + TILE_H / 2);
    g.addColorStop(0, even ? '#8cbf54' : '#82b64a');
    g.addColorStop(1, even ? '#76a540' : '#6d9c39');
    this.beginDiamond(col, row);
    this.ctx.fillStyle = g;
    this.ctx.fill();
    this.ctx.strokeStyle = 'rgba(20,40,14,0.16)';
    this.ctx.lineWidth = 1;
    this.ctx.stroke();
  }

  private drawPlot(col: number, row: number, plot: Plot, now: number): void {
    const c = tileCenter(col, row);
    const g = this.ctx.createLinearGradient(c.x, c.y - TILE_H / 2, c.x, c.y + TILE_H / 2);
    g.addColorStop(0, '#a06a48');
    g.addColorStop(1, '#7c4e30');
    this.beginDiamond(col, row);
    this.ctx.fillStyle = g;
    this.ctx.fill();
    this.ctx.strokeStyle = 'rgba(40,22,8,0.25)';
    this.ctx.stroke();
    this.ctx.strokeStyle = 'rgba(60,36,16,0.28)';
    this.ctx.lineWidth = 1;
    for (let i = -1; i <= 1; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(c.x - TILE_W / 2 + 10, c.y + i * 6);
      this.ctx.lineTo(c.x + TILE_W / 2 - 10, c.y + i * 6);
      this.ctx.stroke();
    }
    if (plot.state === 'planted' && plot.cropId && plot.plantedAt != null) {
      const crop = CROPS[plot.cropId];
      if (crop) this.drawCrop(col, row, crop, plot.plantedAt, now, plot.watered);
    }
  }

  private drawTimer(x: number, y: number, text: string, color: string): void {
    const ctx = this.ctx;
    ctx.font = '10px system-ui, sans-serif';
    const w = ctx.measureText(text).width + 10;
    ctx.fillStyle = 'rgba(20,36,22,0.8)';
    ctx.fillRect(x - w / 2, y - 40, w, 14);
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y - 33);
  }

  private drawProgressBar(x: number, y: number, progress: number): void {
    const ctx = this.ctx;
    const w = 36;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(x - w / 2, y, w, 4);
    ctx.fillStyle = '#4caf50';
    ctx.fillRect(x - w / 2, y, w * Math.min(1, progress), 4);
  }

  burst(x: number, y: number, color: string): void {
    for (let i = 0; i < 10; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 1 + Math.random() * 2.5;
      this.effects.push({
        x,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 1,
        life: 500 + Math.random() * 300,
        maxLife: 800,
        color,
        size: 2 + Math.random() * 2,
      });
    }
  }

  floatText(x: number, y: number, text: string, color: string): void {
    this.effects.push({ x, y, vx: 0, vy: -0.6, life: 900, maxLife: 900, color, size: 0, text });
  }

  burstAt(col: number, row: number, color: string): void {
    const c = tileCenter(col, row);
    this.burst(c.x, c.y - 12, color);
  }

  floatTextAt(col: number, row: number, text: string, color: string): void {
    const c = tileCenter(col, row);
    this.floatText(c.x, c.y - 24, text, color);
  }

  private updateEffects(dt: number): void {
    for (const e of this.effects) {
      e.life -= dt;
      e.x += e.vx;
      e.y += e.vy;
      e.vy += 0.08;
    }
    this.effects = this.effects.filter((e) => e.life > 0);
  }

  private drawEffects(): void {
    for (const e of this.effects) {
      const a = Math.max(0, e.life / e.maxLife);
      this.ctx.globalAlpha = a;
      if (e.text) {
        this.ctx.fillStyle = e.color;
        this.ctx.font = 'bold 13px system-ui, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(e.text, e.x, e.y);
      } else {
        this.ctx.fillStyle = e.color;
        this.ctx.beginPath();
        this.ctx.arc(e.x, e.y, e.size * a, 0, Math.PI * 2);
        this.ctx.fill();
      }
      this.ctx.globalAlpha = 1;
    }
  }

  private drawCrop(
    col: number,
    row: number,
    crop: CropDef,
    plantedAt: number,
    now: number,
    watered = false,
  ): void {
    const c = tileCenter(col, row);
    const stage = cropStage(crop, plantedAt, now, watered);
    if (stage.withered) {
      this.ctx.fillStyle = '#7a7a5a';
      this.ctx.beginPath();
      this.ctx.arc(c.x, c.y - TILE_H / 2 + 8, 7, 0, Math.PI * 2);
      this.ctx.fill();
      this.drawTimer(c.x, c.y, 'Withered', '#f0a0a0');
      return;
    }
    const h = stage.grown ? 20 : 6 + stage.progress * 12;
    const sway = Math.sin(now / 380 + col * 7 + row * 5) * 2;
    this.ctx.fillStyle = '#3f7a2a';
    this.ctx.fillRect(c.x - 1.5, c.y - h, 3, h);
    const leafR = stage.grown ? 10 : 3 + stage.progress * 6;
    const lg = this.ctx.createLinearGradient(c.x + sway, c.y - h - leafR, c.x + sway, c.y - h + leafR);
    lg.addColorStop(0, stage.grown ? '#5cb338' : '#66c14a');
    lg.addColorStop(1, stage.grown ? '#3d8a24' : '#4a9e2c');
    this.ctx.fillStyle = lg;
    this.ctx.beginPath();
    this.ctx.arc(c.x + sway, c.y - h, leafR, 0, Math.PI * 2);
    this.ctx.fill();
    if (stage.grown) {
      const produce = CROP_COLORS[crop.id] ?? '#e74c3c';
      this.ctx.fillStyle = produce;
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2;
        this.ctx.beginPath();
        this.ctx.arc(c.x + sway + Math.cos(a) * 5, c.y - h + Math.sin(a) * 3, 3, 0, Math.PI * 2);
        this.ctx.fill();
      }
      const pulse = 0.25 + (Math.sin(now / 260) + 1) * 0.1;
      this.ctx.fillStyle = `rgba(255,220,80,${pulse})`;
      this.ctx.beginPath();
      this.ctx.arc(c.x, c.y - h, leafR + 3 + Math.sin(now / 260) * 2, 0, Math.PI * 2);
      this.ctx.fill();
      this.drawTimer(c.x, c.y, 'Ready!', '#ffe27a');
    } else {
      const scale = watered ? 0.5 : 1;
      const remaining = crop.growSeconds * scale - (now - plantedAt) / 1000;
      this.drawTimer(c.x, c.y, fmtTime(remaining), '#fff');
      this.drawProgressBar(c.x, c.y - 20, stage.progress);
    }
  }

  private drawObject(obj: PlacedObject, now: number): void {
    const item = ITEMS[obj.itemId];
    if (!item) return;
    const c = tileCenter(obj.col, obj.row);

    if (item.kind === 'tree') {
      const grown = objectState(item, obj.plantedAt, now) === 'grown';
      this.ctx.fillStyle = '#7a5230';
      this.ctx.fillRect(c.x - 2.5, c.y - 16, 5, 18);
      const r = grown ? 15 : 9;
      const cg = this.ctx.createRadialGradient(c.x - 2, c.y - 30, 2, c.x, c.y - 22, r + 4);
      cg.addColorStop(0, grown ? '#55b03a' : '#5ab844');
      cg.addColorStop(1, grown ? '#2c7424' : '#3a8a2e');
      this.ctx.fillStyle = cg;
      this.ctx.beginPath();
      this.ctx.arc(c.x - 6, c.y - 22, r * 0.7, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.beginPath();
      this.ctx.arc(c.x + 6, c.y - 24, r * 0.8, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.beginPath();
      this.ctx.arc(c.x, c.y - 28, r, 0, Math.PI * 2);
      this.ctx.fill();
      if (grown) {
        const fruit = TREE_FRUIT[item.id] ?? '#e74c3c';
        this.ctx.fillStyle = fruit;
        for (const [fx, fy] of [[-8, -22], [4, -26], [0, -30], [8, -20], [-3, -18]]) {
          this.ctx.beginPath();
          this.ctx.arc(c.x + fx, c.y + fy, 2.5, 0, Math.PI * 2);
          this.ctx.fill();
        }
      }
    } else if (item.kind === 'animal') {
      const grown = objectState(item, obj.plantedAt, now) === 'grown';
      const body = obj.variant
        ? (SHEEP_COLORS[obj.variant] ?? ANIMAL_COLORS[item.id] ?? '#e8dcc8')
        : (ANIMAL_COLORS[item.id] ?? '#e8dcc8');
      this.ctx.fillStyle = body;
      this.ctx.fillRect(c.x - 6, c.y - 2, 3, 8);
      this.ctx.fillRect(c.x - 1, c.y - 2, 3, 8);
      this.ctx.fillRect(c.x + 4, c.y - 2, 3, 8);
      this.ctx.beginPath();
      this.ctx.ellipse(c.x, c.y - 6, 10, 6, 0, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.beginPath();
      this.ctx.arc(c.x + 10, c.y - 12, 4.5, 0, Math.PI * 2);
      this.ctx.fill();
      if (obj.pattern && obj.pattern !== 'plain') this.drawSheepPattern(c.x, c.y - 6, obj.pattern);
      if (grown) {
        this.ctx.fillStyle = 'rgba(255,220,80,0.4)';
        this.ctx.beginPath();
        this.ctx.arc(c.x, c.y - 8, 13, 0, Math.PI * 2);
        this.ctx.fill();
      }
    } else if (item.kind === 'building') {
      const wall = BUILDING_COLORS[item.id] ?? '#b08d5a';
      this.ctx.fillStyle = wall;
      this.ctx.fillRect(c.x - 14, c.y - 22, 28, 22);
      this.ctx.fillStyle = '#8a5a3b';
      this.ctx.beginPath();
      this.ctx.moveTo(c.x - 17, c.y - 22);
      this.ctx.lineTo(c.x, c.y - 34);
      this.ctx.lineTo(c.x + 17, c.y - 22);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.fillStyle = '#5a3a1a';
      this.ctx.fillRect(c.x - 3, c.y - 10, 6, 10);
      if (obj.breeding) {
        this.ctx.fillStyle = '#e77';
        this.ctx.beginPath();
        this.ctx.arc(c.x + 12, c.y - 30, 4, 0, Math.PI * 2);
        this.ctx.fill();
      }
    } else {
      this.beginDiamond(obj.col, obj.row);
      this.ctx.fillStyle = DECOR_COLORS[obj.itemId] ?? '#b08d5a';
      this.ctx.fill();
      this.ctx.strokeStyle = 'rgba(0,0,0,0.2)';
      this.ctx.stroke();
    }
  }

  private drawSheepPattern(x: number, y: number, pattern: string): void {
    this.ctx.fillStyle = 'rgba(0,0,0,0.28)';
    if (pattern === 'dots') {
      for (const [dx, dy] of [[-4, -1], [0, 2], [4, -2], [1, -3], [-2, 3]]) {
        this.ctx.beginPath();
        this.ctx.arc(x + dx, y + dy, 1.4, 0, Math.PI * 2);
        this.ctx.fill();
      }
    } else if (pattern === 'stripes') {
      this.ctx.fillRect(x - 5, y - 3, 2, 6);
      this.ctx.fillRect(x - 1, y - 3, 2, 6);
      this.ctx.fillRect(x + 3, y - 3, 2, 6);
    } else if (pattern === 'stars') {
      for (const [dx, dy] of [[-4, -2], [2, 0], [5, -2], [-1, 2]]) {
        this.ctx.fillRect(x + dx, y + dy, 2, 2);
      }
    } else if (pattern === 'patches') {
      this.ctx.fillStyle = 'rgba(255,255,255,0.4)';
      this.ctx.beginPath();
      this.ctx.arc(x - 4, y - 1, 2.5, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.beginPath();
      this.ctx.arc(x + 3, y + 1, 2, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }
}
