import type { GameId } from "./types";

export const GAME_NAMES: Record<GameId, string> = {
  time: "German Time",
  artikel: "Der / Die / Das",
  zahlen: "Numbers & Prices",
  satzbau: "Sentence Builder",
  verben: "Verb Runner",
  laden: "German Shop",
};

export const GAME_HREFS: Record<GameId, string> = {
  time: "/time",
  artikel: "/artikel",
  zahlen: "/zahlen",
  satzbau: "/satzbau",
  verben: "/verben",
  laden: "/laden",
};
