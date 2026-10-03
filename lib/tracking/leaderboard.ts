import type { Db } from "mongodb";
import type { GameId } from "./types";

// Timed games rank on their timed rounds so everyone gets the same 60 seconds; the rest rank on best round score.
export function boardField(game: GameId): "bestTimedScore" | "bestScore" | null {
  if (game === "time") return null;
  return game === "artikel" || game === "zahlen" ? "bestTimedScore" : "bestScore";
}

export const BOARD_GAMES = ["artikel", "zahlen", "satzbau", "verben", "laden"] as const satisfies readonly GameId[];

export type BoardRow = { displayName: string; score: number };

// Only players who opted in appear, and only their display name and score leave the server.
export async function getLeaderboard(db: Db, game: GameId, limit = 20): Promise<BoardRow[]> {
  const field = boardField(game);
  if (!field) return [];
  const rows = await db
    .collection("userStats")
    .aggregate<{ displayName: string; score: number }>([
      { $match: { game, [field]: { $gt: 0 } } },
      { $sort: { [field]: -1 } },
      { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "user" } },
      { $unwind: "$user" },
      { $match: { "user.leaderboard": true } },
      { $limit: limit },
      { $project: { _id: 0, displayName: "$user.displayName", score: `$${field}` } },
    ])
    .toArray();
  return rows;
}
