import type { Persona } from '../game/dialogue';

export class DialogueBox {
  private el: HTMLElement;
  private nameEl: HTMLElement;
  private textEl: HTMLElement;
  private timer = 0;

  constructor(container: HTMLElement) {
    this.el = document.createElement('div');
    this.el.id = 'dialogue';
    this.el.className = 'hidden';
    this.el.innerHTML = `
      <div class="d-name" id="d-name"></div>
      <div class="d-text" id="d-text"></div>`;
    container.appendChild(this.el);
    this.nameEl = this.el.querySelector('#d-name')!;
    this.textEl = this.el.querySelector('#d-text')!;
    this.el.addEventListener('click', () => this.dismiss());
  }

  say(p: Persona, text: string): void {
    this.nameEl.textContent = `${p.name} \u00b7 ${p.role}`;
    this.textEl.textContent = text;
    this.el.classList.remove('hidden');
    clearTimeout(this.timer);
    this.timer = window.setTimeout(() => this.dismiss(), 5200);
  }

  dismiss(): void {
    this.el.classList.add('hidden');
  }
}
