import { z } from "zod";
import { ObjectId, type Db } from "mongodb";
import type { GameId, Streak } from "./types";

const settingsSchema = z.object({
  displayName: z.string().trim().min(2).max(24).regex(/^[^\p{C}<>]+$/u, "No control characters or angle brackets"),
  leaderboard: z.boolean(),
});

export function validateSettings(input: unknown) {
  const r = settingsSchema.safeParse(input);
  return r.success ? ({ ok: true, settings: r.data } as const) : ({ ok: false, error: "Invalid settings" } as const);
}

export type GameStats = {
  game: GameId;
  rounds: number;
  totalCorrect: number;
  totalAnswers: number;
  totalXp: number;
  bestScore: number;
  bestStreak: number;
  maxLevel: number;
};

export type Profile = {
  displayName: string;
  leaderboard: boolean;
  streak: Streak | null;
  stats: GameStats[];
  recent: { game: GameId; mode: string; correct: number; total: number; playedAt: string }[];
  weakSpots: { game: GameId; label: string; misses: number }[];
};

export async function getProfile(db: Db, userIdStr: string): Promise<Profile | null> {
  if (!ObjectId.isValid(userIdStr)) return null;
  const userId = new ObjectId(userIdStr);
  const user = await db.collection("users").findOne({ _id: userId });
  if (!user) return null;

  const [stats, recent, weak] = await Promise.all([
    db.collection("userStats").find({ userId }).toArray(),
    db.collection("rounds").find({ userId }).sort({ playedAt: -1 }).limit(10).toArray(),
    db.collection("weakSpots").find({ userId }).sort({ misses: -1, lastMissAt: -1 }).limit(10).toArray(),
  ]);

  return {
    displayName: user.displayName ?? "Player",
    leaderboard: !!user.leaderboard,
    streak: user.streak ?? null,
    stats: stats.map((s) => ({
      game: s.game, rounds: s.rounds ?? 0, totalCorrect: s.totalCorrect ?? 0, totalAnswers: s.totalAnswers ?? 0,
      totalXp: s.totalXp ?? 0, bestScore: s.bestScore ?? 0, bestStreak: s.bestStreak ?? 0, maxLevel: s.maxLevel ?? 0,
    })),
    recent: recent.map((r) => ({
      game: r.game, mode: r.mode, correct: r.correct, total: r.total, playedAt: new Date(r.playedAt).toISOString(),
    })),
    weakSpots: weak.map((w) => ({ game: w.game, label: w.label, misses: w.misses })),
  };
}
