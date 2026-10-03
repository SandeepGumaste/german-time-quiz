import { ObjectId, type Db } from "mongodb";
import { nextStreak } from "./streak";
import { statsUpdate } from "./stats";
import type { RoundInput, Streak } from "./types";

export const MAX_ROUNDS_PER_HOUR = 30;

export type SaveResult =
  | { ok: true; streak: Streak; newBests: string[] }
  | { ok: false; status: number; error: string };

// Persist a validated round and update the player's stats, weak spots and streak.
export async function saveRound(db: Db, userIdStr: string, r: RoundInput, now = new Date()): Promise<SaveResult> {
  if (!ObjectId.isValid(userIdStr)) return { ok: false, status: 401, error: "Unknown user" };
  const userId = new ObjectId(userIdStr);

  const user = await db.collection("users").findOne({ _id: userId });
  if (!user) return { ok: false, status: 404, error: "Unknown user" };

  const since = new Date(now.getTime() - 3_600_000);
  if ((await db.collection("rounds").countDocuments({ userId, playedAt: { $gte: since } })) >= MAX_ROUNDS_PER_HOUR) {
    return { ok: false, status: 429, error: "Too many rounds, slow down" };
  }

  const before = await db.collection("userStats").findOne({ userId, game: r.game });
  const newBests: string[] = [];
  if (r.correct > (before?.bestScore ?? 0)) newBests.push("bestScore");
  if (r.bestStreak > (before?.bestStreak ?? 0)) newBests.push("bestStreak");
  if (r.mode === "timed" && r.correct > (before?.bestTimedScore ?? 0)) newBests.push("bestTimedScore");

  const streak = nextStreak(user.streak, now, r.tz);

  await Promise.all([
    db.collection("rounds").insertOne({
      userId, game: r.game, mode: r.mode, score: r.correct, correct: r.correct, total: r.total,
      xp: r.xp, bestStreak: r.bestStreak, level: r.level, durationSec: r.durationSec, playedAt: now,
    }),
    db.collection("userStats").updateOne({ userId, game: r.game }, statsUpdate(r, now), { upsert: true }),
    db.collection("users").updateOne({ _id: userId }, { $set: { streak, tz: r.tz } }),
    r.misses.length > 0 &&
      db.collection("weakSpots").bulkWrite(
        r.misses.map((m) => ({
          updateOne: {
            filter: { userId, game: r.game, key: m.key },
            update: { $inc: { misses: 1 }, $set: { label: m.label, lastMissAt: now } },
            upsert: true,
          },
        }))
      ),
  ]);

  return { ok: true, streak, newBests };
}

// Indexes from the design spec. Safe to call repeatedly.
export async function ensureIndexes(db: Db) {
  await Promise.all([
    db.collection("users").createIndex({ googleId: 1 }, { unique: true, sparse: true }),
    db.collection("rounds").createIndex({ userId: 1, playedAt: -1 }),
    db.collection("userStats").createIndex({ userId: 1, game: 1 }, { unique: true }),
    db.collection("userStats").createIndex({ game: 1, bestTimedScore: -1 }),
    db.collection("userStats").createIndex({ game: 1, bestScore: -1 }),
    db.collection("weakSpots").createIndex({ userId: 1, game: 1, key: 1 }, { unique: true }),
  ]);
}
