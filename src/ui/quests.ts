import type { FarmState } from '../game/types';
import { currentQuest, questProgress } from '../game/systems/quests';
import { QUESTS } from '../game/data/quests';
import { icon } from './icons';

export class QuestPanel {
  private chip: HTMLElement;
  private modal: HTMLElement;
  private body: HTMLElement;
  private state: FarmState | null = null;

  constructor(container: HTMLElement) {
    this.chip = document.createElement('button');
    this.chip.id = 'quest-chip';
    container.appendChild(this.chip);
    this.chip.addEventListener('click', () => this.open());

    this.modal = document.createElement('div');
    this.modal.id = 'quest-modal';
    this.modal.className = 'hidden';
    this.modal.innerHTML = `
      <div class="qm-card">
        <div class="qm-head"><span id="qm-title"></span><button id="qm-close"></button></div>
        <div class="qm-body" id="qm-body"></div>
      </div>`;
    container.appendChild(this.modal);
    this.modal.querySelector('#qm-close')!.innerHTML = icon('close', 16);
    this.modal.querySelector('#qm-close')!.addEventListener('click', () => this.close());
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.close();
    });
    this.body = this.modal.querySelector('#qm-body')!;
  }

  update(s: FarmState): void {
    this.state = s;
    const q = currentQuest(s.quests);
    if (!q) {
      this.chip.innerHTML = `${icon('quest')}<span>All quests done \u2014 kol hakavod!</span>`;
      return;
    }
    const prog = questProgress(s.quests, q);
    const done = q.tasks.reduce((n, t, i) => n + Math.min(prog[i] ?? 0, t.total), 0);
    const total = q.tasks.reduce((n, t) => n + t.total, 0);
    this.chip.innerHTML = `${icon('quest')}<span>${q.name} \u00b7 ${done}/${total}</span>`;
  }

  private open(): void {
    const s = this.state;
    if (!s) return;
    const q = currentQuest(s.quests);
    this.modal.querySelector('#qm-title')!.textContent = q ? `${q.chapter} \u2014 ${q.name}` : 'Quests';
    this.body.innerHTML = '';

    // active quest
    if (q) {
      const prog = questProgress(s.quests, q);
      const card = document.createElement('div');
      card.className = 'qm-active';
      card.innerHTML = `<p class="qm-desc">${q.description}</p>`;
      q.tasks.forEach((t, i) => {
        const cur = Math.min(prog[i] ?? 0, t.total);
        card.insertAdjacentHTML(
          'beforeend',
          `<div class="qm-task"><span>${t.label}</span><span class="qm-count">${cur}/${t.total}</span></div>`,
        );
      });
      card.insertAdjacentHTML(
        'beforeend',
        `<div class="qm-reward">Reward: ${q.coins ? `${q.coins}\u20aa ` : ''}${q.xp ? `+${q.xp} XP` : ''}${q.sela ? ` +${q.sela} Sela` : ''}</div>`,
      );
      this.body.appendChild(card);
    }

    // completed chapters count
    const done = s.quests.completed.length;
    this.body.insertAdjacentHTML(
      'beforeend',
      `<div class="qm-done">Completed: ${done} of ${QUESTS.length} quests</div>`,
    );

    this.modal.classList.remove('hidden');
  }

  private close(): void {
    this.modal.classList.add('hidden');
  }
}
