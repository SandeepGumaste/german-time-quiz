import { z } from "zod";
import { GAMES, type RoundInput } from "./types";

const int = z.number().int().min(0).max(100_000);

const schema = z.object({
  game: z.enum(GAMES),
  mode: z.enum(["practice", "timed"]),
  correct: int,
  total: int,
  xp: int,
  bestStreak: int,
  level: int.max(100),
  durationSec: z.number().min(0).max(3600),
  tz: z.string().max(64),
  misses: z.array(z.object({ key: z.string().min(1).max(80), label: z.string().max(160) })).max(200),
});

export type ValidateResult = { ok: true; round: RoundInput } | { ok: false; error: string };

// Scores come from the browser, so reject anything a real round could not produce.
export function validateRound(input: unknown): ValidateResult {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid round" };
  const r = parsed.data;
  if (r.correct > r.total) return { ok: false, error: "correct exceeds total" };
  if (r.bestStreak > r.correct) return { ok: false, error: "streak exceeds correct" };
  if (r.xp > r.correct * 20) return { ok: false, error: "xp too high" };
  if (r.total > r.durationSec * 2 + 5) return { ok: false, error: "answered too fast" };
  if (r.mode === "timed" && r.durationSec > 65) return { ok: false, error: "timed round too long" };
  if (r.misses.length > (r.total - r.correct + 1) * 3) return { ok: false, error: "too many misses" };
  return { ok: true, round: r };
}
