import type { Renderer } from '../render/renderer';
import { screenToTile } from '../render/iso';

export interface InputCallbacks {
  onTapTile: (col: number, row: number) => void;
  onDrag: (dx: number, dy: number) => void;
  onPinch: (factor: number) => void;
}

interface Pt {
  x: number;
  y: number;
}

const TAP_SLOP = 14; // px

export class Input {
  private pointers = new Map<number, Pt>();
  private tapPointer = -1;
  private tapStart: Pt = { x: 0, y: 0 };
  private tapMoved = false;
  private pinchDist = 0;

  constructor(
    private canvas: HTMLCanvasElement,
    private renderer: Renderer,
    private cb: InputCallbacks,
  ) {
    canvas.addEventListener('pointerdown', (e) => this.onDown(e));
    canvas.addEventListener('pointermove', (e) => this.onMove(e));
    canvas.addEventListener('pointerup', (e) => this.onUp(e));
    canvas.addEventListener('pointercancel', (e) => this.onUp(e));
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  private onDown(e: PointerEvent): void {
    this.canvas.setPointerCapture(e.pointerId);
    this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (this.pointers.size === 1) {
      this.tapPointer = e.pointerId;
      this.tapStart = { x: e.clientX, y: e.clientY };
      this.tapMoved = false;
    } else if (this.pointers.size === 2) {
      const [a, b] = [...this.pointers.values()];
      this.pinchDist = Math.hypot(a.x - b.x, a.y - b.y);
    }
  }

  private onMove(e: PointerEvent): void {
    if (!this.pointers.has(e.pointerId)) return;
    this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (this.pointers.size === 1 && e.pointerId === this.tapPointer) {
      const dx = e.clientX - this.tapStart.x;
      const dy = e.clientY - this.tapStart.y;
      if (!this.tapMoved && Math.hypot(dx, dy) > TAP_SLOP) this.tapMoved = true;
      if (this.tapMoved) {
        this.cb.onDrag(e.movementX, e.movementY);
        this.tapStart = { x: e.clientX, y: e.clientY };
      }
    } else if (this.pointers.size === 2) {
      const [a, b] = [...this.pointers.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (this.pinchDist > 0 && d > 0) this.cb.onPinch(d / this.pinchDist);
      this.pinchDist = d;
    }
  }

  private onUp(e: PointerEvent): void {
    const wasTap =
      this.pointers.size === 1 && e.pointerId === this.tapPointer && !this.tapMoved;
    this.pointers.delete(e.pointerId);
    if (wasTap) {
      const w = this.renderer.screenToWorld(e.clientX, e.clientY);
      const t = screenToTile(w.x, w.y);
      this.cb.onTapTile(t.col, t.row);
    }
    if (this.pointers.size < 2) this.pinchDist = 0;
  }
}
