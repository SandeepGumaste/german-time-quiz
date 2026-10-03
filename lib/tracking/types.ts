export const GAMES = ["time", "artikel", "zahlen", "satzbau", "verben", "laden"] as const;
export type GameId = (typeof GAMES)[number];

export type Miss = { key: string; label: string };

export type RoundInput = {
  game: GameId;
  mode: "practice" | "timed";
  correct: number;
  total: number;
  xp: number;
  bestStreak: number;
  level: number;
  durationSec: number;
  tz: string;
  misses: Miss[];
};

export type Streak = { current: number; best: number; lastDay: string };
