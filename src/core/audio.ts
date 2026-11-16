// Procedural sounds via Web Audio — no audio files, keeps the bundle tiny.
let ctx: AudioContext | null = null;

function ensureCtx(): AudioContext | null {
  if (!ctx) {
    try {
      ctx = new AudioContext();
    } catch {
      return null;
    }
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

function tone(freq: number, dur: number, type: OscillatorType = 'sine', vol = 0.15): void {
  const c = ensureCtx();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.value = vol;
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
  o.connect(g).connect(c.destination);
  o.start();
  o.stop(c.currentTime + dur);
}

/** Call on first user gesture (iOS requires it before audio). */
export function unlock(): void {
  ensureCtx();
}

export function playPlant(): void {
  tone(200, 0.09, 'triangle', 0.12);
  tone(300, 0.09, 'triangle', 0.1);
}

export function playHarvest(): void {
  tone(660, 0.1, 'sine', 0.14);
  tone(880, 0.12, 'sine', 0.1);
}

export function playLevelUp(): void {
  tone(523, 0.1, 'triangle', 0.14);
  tone(659, 0.1, 'triangle', 0.14);
  tone(784, 0.2, 'triangle', 0.14);
}

export function playCoin(): void {
  tone(1046, 0.07, 'square', 0.06);
}

export function playError(): void {
  tone(150, 0.16, 'sawtooth', 0.08);
}
