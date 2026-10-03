import type { RoundInput } from "./types";

// Atomic update for the per-user, per-game `userStats` document.
export function statsUpdate(r: RoundInput, now: Date) {
  return {
    $inc: { rounds: 1, totalCorrect: r.correct, totalAnswers: r.total, totalXp: r.xp },
    $max: {
      bestScore: r.correct,
      bestStreak: r.bestStreak,
      maxLevel: r.level,
      ...(r.mode === "timed" ? { bestTimedScore: r.correct } : {}),
    },
    $set: { lastPlayedAt: now },
  };
}
