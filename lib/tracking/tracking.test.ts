import { describe, expect, it } from "vitest";
import { validateRound } from "./validate";
import { dayInTz, nextStreak } from "./streak";
import { statsUpdate } from "./stats";

const base = {
  game: "artikel",
  mode: "timed",
  correct: 20,
  total: 25,
  xp: 260,
  bestStreak: 9,
  level: 1,
  durationSec: 60,
  tz: "Asia/Kolkata",
  misses: [{ key: "Tisch", label: "der Tisch" }],
};

describe("validateRound", () => {
  it("accepts a plausible round", () => {
    expect(validateRound(base).ok).toBe(true);
  });
  it("rejects unknown games and malformed bodies", () => {
    expect(validateRound({ ...base, game: "chess" }).ok).toBe(false);
    expect(validateRound({ ...base, correct: "20" }).ok).toBe(false);
    expect(validateRound(null).ok).toBe(false);
  });
  it("rejects impossible numbers", () => {
    expect(validateRound({ ...base, correct: 30 }).ok).toBe(false); // correct > total
    expect(validateRound({ ...base, bestStreak: 21 }).ok).toBe(false); // streak > correct
    expect(validateRound({ ...base, xp: 20 * 20 + 1 }).ok).toBe(false); // too much XP
    expect(validateRound({ ...base, total: 500 }).ok).toBe(false); // too fast for 60s
    expect(validateRound({ ...base, durationSec: 120 }).ok).toBe(false); // timed round > 65s
  });
  it("rejects too many misses", () => {
    const misses = Array.from({ length: 30 }, (_, i) => ({ key: `k${i}`, label: "x" }));
    expect(validateRound({ ...base, misses }).ok).toBe(false);
  });
});

describe("streak", () => {
  const now = new Date("2026-10-03T10:00:00Z");
  it("formats the day in the player's timezone", () => {
    expect(dayInTz(new Date("2026-10-03T20:00:00Z"), "Asia/Kolkata")).toBe("2026-10-04");
    expect(dayInTz(new Date("2026-10-03T20:00:00Z"), "Not/AZone")).toBe("2026-10-03");
  });
  it("starts at 1", () => {
    expect(nextStreak(undefined, now, "UTC")).toEqual({ current: 1, best: 1, lastDay: "2026-10-03" });
  });
  it("continues on consecutive days, keeps the same day, resets after a gap", () => {
    expect(nextStreak({ current: 2, best: 5, lastDay: "2026-10-02" }, now, "UTC")).toEqual({ current: 3, best: 5, lastDay: "2026-10-03" });
    expect(nextStreak({ current: 2, best: 5, lastDay: "2026-10-03" }, now, "UTC").current).toBe(2);
    expect(nextStreak({ current: 7, best: 7, lastDay: "2026-09-30" }, now, "UTC")).toEqual({ current: 1, best: 7, lastDay: "2026-10-03" });
  });
  it("handles month boundaries", () => {
    const first = new Date("2026-11-01T10:00:00Z");
    expect(nextStreak({ current: 1, best: 1, lastDay: "2026-10-31" }, first, "UTC").current).toBe(2);
  });
});

describe("statsUpdate", () => {
  const round = validateRound(base);
  if (!round.ok) throw new Error("fixture invalid");
  const now = new Date("2026-10-03T10:00:00Z");
  it("increments totals and tracks bests", () => {
    const u = statsUpdate(round.round, now);
    expect(u.$inc).toMatchObject({ rounds: 1, totalCorrect: 20, totalAnswers: 25, totalXp: 260 });
    expect(u.$max).toMatchObject({ bestScore: 20, bestStreak: 9, maxLevel: 1, bestTimedScore: 20 });
    expect(u.$set).toEqual({ lastPlayedAt: now });
  });
  it("does not set a timed best for practice rounds", () => {
    const practice = validateRound({ ...base, mode: "practice", durationSec: 200 });
    if (!practice.ok) throw new Error("fixture invalid");
    expect(statsUpdate(practice.round, now).$max).not.toHaveProperty("bestTimedScore");
  });
});
