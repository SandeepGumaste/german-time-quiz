import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { MongoClient, ObjectId, type Db } from "mongodb";
import { saveRound } from "./save-round";
import { validateRound } from "./validate";

const uri = process.env.MONGODB_URI ?? "mongodb://localhost:27017";
let client: MongoClient;
let db: Db;
const userId = new ObjectId();

const round = (over: object = {}) => {
  const v = validateRound({
    game: "artikel", mode: "timed", correct: 12, total: 15, xp: 150, bestStreak: 6, level: 1,
    durationSec: 60, tz: "UTC", misses: [{ key: "Tisch", label: "der Tisch" }], ...over,
  });
  if (!v.ok) throw new Error(v.error);
  return v.round;
};

beforeAll(async () => {
  client = await new MongoClient(uri).connect();
  db = client.db("german-games-test");
});
afterAll(async () => {
  await db.dropDatabase();
  await client.close();
});
beforeEach(async () => {
  await Promise.all(["users", "rounds", "userStats", "weakSpots"].map((c) => db.collection(c).deleteMany({})));
  await db.collection("users").insertOne({ _id: userId, name: "Test" });
});

describe("saveRound", () => {
  const now = new Date("2026-10-03T10:00:00Z");

  it("stores the round, stats, weak spots and streak", async () => {
    const res = await saveRound(db, userId.toString(), round(), now);
    expect(res.ok).toBe(true);
    expect(await db.collection("rounds").countDocuments({ userId })).toBe(1);
    const stats = await db.collection("userStats").findOne({ userId, game: "artikel" });
    expect(stats).toMatchObject({ rounds: 1, totalCorrect: 12, bestScore: 12, bestTimedScore: 12 });
    expect(await db.collection("weakSpots").findOne({ userId, game: "artikel", key: "Tisch" })).toMatchObject({ misses: 1 });
    expect((await db.collection("users").findOne({ _id: userId }))?.streak).toMatchObject({ current: 1, lastDay: "2026-10-03" });
  });

  it("accumulates across rounds and reports new bests", async () => {
    await saveRound(db, userId.toString(), round(), now);
    const second = await saveRound(db, userId.toString(), round({ correct: 14, bestStreak: 7, xp: 180 }), now);
    expect(second.ok && second.newBests).toContain("bestScore");
    const stats = await db.collection("userStats").findOne({ userId, game: "artikel" });
    expect(stats).toMatchObject({ rounds: 2, totalCorrect: 26, bestScore: 14 });
    expect(await db.collection("weakSpots").findOne({ userId, key: "Tisch" })).toMatchObject({ misses: 2 });
    expect((await db.collection("users").findOne({ _id: userId }))?.streak.current).toBe(1); // same day
  });

  it("rate limits to 30 rounds per hour", async () => {
    for (let i = 0; i < 30; i++) await saveRound(db, userId.toString(), round(), now);
    expect(await saveRound(db, userId.toString(), round(), now)).toEqual({ ok: false, status: 429, error: "Too many rounds, slow down" });
  });

  it("rejects an unknown user", async () => {
    expect(await saveRound(db, new ObjectId().toString(), round(), now)).toMatchObject({ ok: false, status: 404 });
  });
});
