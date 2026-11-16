import type { FarmState, QuestDef, QuestState, QuestAction } from '../types';
import { QUESTS } from '../data/quests';
import { addCoins, addXp, addSela } from './economy';

export function initQuestState(): QuestState {
  return { completed: [], progress: {} };
}

/** First uncompleted quest in the linear campaign (or null if all done). */
export function currentQuest(qs: QuestState): QuestDef | null {
  for (const q of QUESTS) {
    if (!qs.completed.includes(q.id)) return q;
  }
  return null;
}

export function questProgress(qs: QuestState, q: QuestDef): number[] {
  return qs.progress[q.id] ?? q.tasks.map(() => 0);
}

/** Record one action against the active quest's matching tasks. Returns true if any advanced. */
export function recordTask(qs: QuestState, action: QuestAction, target?: string): boolean {
  const q = currentQuest(qs);
  if (!q) return false;
  let prog = qs.progress[q.id];
  if (!prog) prog = qs.progress[q.id] = q.tasks.map(() => 0);
  let changed = false;
  q.tasks.forEach((task, i) => {
    if (task.action !== action) return;
    if (task.target && task.target !== target) return;
    if (prog[i] < task.total) {
      prog[i]++;
      changed = true;
    }
  });
  return changed;
}

export function isComplete(q: QuestDef, qs: QuestState): boolean {
  const prog = qs.progress[q.id];
  if (!prog) return false;
  return q.tasks.every((task, i) => prog[i] >= task.total);
}

export function completeQuest(s: FarmState, q: QuestDef): void {
  s.quests.completed.push(q.id);
  if (q.coins) addCoins(s, q.coins);
  if (q.xp) addXp(s, q.xp);
  if (q.sela) addSela(s, q.sela);
}
