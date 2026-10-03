import type { Noun } from "./nouns";

export const TIMED_SECONDS = 60;
export const XP_PER_CORRECT = 10;
export const COMBO_MIN = 3;
export const COMBO_STRONG = 5;

export function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// XP for a correct answer; `streak` is the streak including this answer.
export function xpForCorrect(streak: number): number {
  const bonus = streak >= COMBO_MIN ? Math.min(streak, 10) : 0;
  return XP_PER_CORRECT + bonus;
}

export function accuracy(correct: number, total: number): number {
  return total === 0 ? 0 : Math.round((correct / total) * 100);
}

export type ComboLevel = "none" | "combo" | "strong";

export function comboLevel(streak: number): ComboLevel {
  if (streak >= COMBO_STRONG) return "strong";
  if (streak >= COMBO_MIN) return "combo";
  return "none";
}

// A shuffled deck that never repeats a word until every word has been shown,
// and never starts a fresh deck with the word that just ended the previous one.
export function nextFromDeck(deck: Noun[], pool: Noun[], last?: Noun): { noun: Noun; deck: Noun[] } {
  let d = deck;
  if (d.length === 0) {
    d = shuffle(pool);
    if (pool.length > 1 && last && d[d.length - 1] === last) {
      [d[0], d[d.length - 1]] = [d[d.length - 1], d[0]];
    }
  }
  const noun = d[d.length - 1];
  return { noun, deck: d.slice(0, -1) };
}
