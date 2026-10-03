import Link from "next/link";
import { getDb } from "@/lib/mongodb";
import { BOARD_GAMES, boardField, getLeaderboard } from "@/lib/tracking/leaderboard";
import { GAME_NAMES } from "@/lib/tracking/games";
import { GAMES, type GameId } from "@/lib/tracking/types";
import { cn } from "@/lib/utils";

export const metadata = { title: "Leaderboard" };

export default async function LeaderboardPage({ searchParams }: { searchParams: Promise<{ game?: string }> }) {
  const { game: g } = await searchParams;
  const game: GameId = GAMES.includes(g as GameId) && g !== "time" ? (g as GameId) : "artikel";
  const rows = await getLeaderboard(await getDb(), game);

  return (
    <div className="flex flex-col items-center gap-5 mt-8 px-4 pb-16">
      <h1 className="text-2xl font-bold">Leaderboard</h1>
      <nav className="flex flex-wrap justify-center gap-2">
        {BOARD_GAMES.map((id) => (
          <Link
            key={id}
            href={`/leaderboard?game=${id}`}
            className={cn("rounded-full border-2 px-3 py-1 text-sm", id === game ? "bg-black text-white border-black" : "hover:bg-gray-100")}
          >
            {GAME_NAMES[id]}
          </Link>
        ))}
      </nav>
      <p className="text-sm text-gray-600 text-center max-w-sm">
        {boardField(game) === "bestTimedScore" ? "Best score in a 60-second timed round." : "Best score in a single round."} Only players who opted in are shown.
      </p>
      {rows.length === 0 ? (
        <p className="text-gray-600">No scores yet. Be the first!</p>
      ) : (
        <ol className="w-full max-w-sm">
          {rows.map((r, i) => (
            <li key={`${r.displayName}-${i}`} className="flex justify-between border-t py-2">
              <span><span className="inline-block w-8 text-gray-500">{i + 1}.</span>{r.displayName}</span>
              <span className="font-bold">{r.score}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
