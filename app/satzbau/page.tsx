"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { StatsRow } from "@/components/stats-row";
import { RoundSaved } from "@/components/round-saved";
import { useRoundReporter } from "@/lib/use-round-reporter";
import type { Miss } from "@/lib/tracking/types";
import { TileBuilder, type Tile } from "@/components/tile-builder";
import { accuracy, xpForCorrect } from "@/lib/artikel-game";
import {
  CORRECT_PER_SENTENCE_LEVEL,
  LEVEL_NAMES,
  LEVEL_RULES,
  MAX_SENTENCE_LEVEL,
  buildTiles,
  checkSentence,
  pickSentence,
  sentenceLevelFor,
  type Sentence,
} from "@/lib/sentences";
import { cn } from "@/lib/utils";

type Screen = "menu" | "playing" | "results";
type Stats = { correct: number; total: number; streak: number; best: number; xp: number };
type Result = { correct: boolean; variant: number; mismatches: number[] };

const EMPTY_STATS: Stats = { correct: 0, total: 0, streak: 0, best: 0, xp: 0 };

export default function SatzbauGame() {
  const [screen, setScreen] = useState<Screen>("menu");
  const [sentence, setSentence] = useState<Sentence | null>(null);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [placed, setPlaced] = useState<number[]>([]); // tile ids, in sentence order
  const [result, setResult] = useState<Result | null>(null);
  const [stats, setStats] = useState<Stats>(EMPTY_STATS);
  const [roundMisses, setRoundMisses] = useState<Miss[]>([]);
  const [announced, setAnnounced] = useState(0); // last level whose rule was shown
  const [open, setOpen] = useState(false);
  const seen = useRef(new Set<string>());

  const level = sentenceLevelFor(stats.correct);

  const buildRound = useCallback(
    () => ({
      game: "satzbau" as const,
      mode: "practice" as const,
      correct: stats.correct,
      total: stats.total,
      xp: stats.xp,
      bestStreak: stats.best,
      level,
      misses: roundMisses,
    }),
    [stats, level, roundMisses]
  );
  const saved = useRoundReporter(screen === "results" ? "finished" : screen === "playing" ? "playing" : "idle", buildRound);
  const complete = tiles.length > 0 && placed.length === tiles.length;

  const load = (lvl: number) => {
    const s = pickSentence(lvl, seen.current);
    seen.current.add(s.id);
    setSentence(s);
    setTiles(buildTiles(s));
    setPlaced([]);
    setResult(null);
  };

  const start = () => {
    seen.current.clear();
    setStats(EMPTY_STATS);
    setRoundMisses([]);
    setAnnounced(0);
    load(1);
    setScreen("playing");
  };

  const check = useCallback(() => {
    if (!sentence || result || !complete) return;
    const r = checkSentence(placed.map((id) => tiles.find((t) => t.id === id)!.text), sentence);
    setResult(r);
    setAnnounced(level);
    if (!r.correct) setRoundMisses((m) => [...m, { key: sentence.id, label: sentence.display[0] }]);
    setStats((s) => {
      const streak = r.correct ? s.streak + 1 : 0;
      return {
        correct: s.correct + (r.correct ? 1 : 0),
        total: s.total + 1,
        streak,
        best: Math.max(s.best, streak),
        xp: s.xp + (r.correct ? xpForCorrect(streak) : 0),
      };
    });
  }, [sentence, result, complete, placed, tiles, level]);

  // After the stats update, `level` reflects the new correct count.
  const next = useCallback(() => load(level), [level]);

  useEffect(() => {
    if (screen !== "playing") return;
    const onKey = (e: KeyboardEvent) => {
      if (open || e.key !== "Enter" || (e.target as HTMLElement).tagName === "BUTTON") return;
      e.preventDefault();
      if (result) next();
      else check();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [screen, open, result, check, next]);

  const infoDialog = (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label="How to play"
          className="fixed bottom-6 right-6 z-50 bg-red-600 border-none rounded-full shadow-lg p-3 hover:bg-red-700"
        >
          <Info size={28} className="text-white" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>How to play Sentence Builder</DialogTitle>
          <DialogDescription asChild>
            <div>
              <ul className="list-disc pl-5 space-y-2 text-left">
                <li><b>Tap</b> a word to add it to your sentence, and tap it again to take it back. On desktop you can also <b>drag</b> words in, reorder them, or drag them out.</li>
                <li>When every word is placed, press <b>Check</b> (or Enter).</li>
                <li>Some sentences have more than one correct order, and any of them counts.</li>
                <li>You level up every {CORRECT_PER_SENTENCE_LEVEL} correct sentences, from simple sentences to subordinate clauses.</li>
                <li>Commas and capital letters are added for you.</li>
              </ul>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );

  const back = (
    <Link href="/" className="absolute -top-10 left-4 text-sm underline text-gray-600">
      ← All games
    </Link>
  );

  const statItems: [string, string | number][] = [
    ["Score", stats.correct],
    ["Streak", stats.streak],
    ["Best", stats.best],
    ["Accuracy", `${accuracy(stats.correct, stats.total)}%`],
    ["XP", stats.xp],
  ];

  if (screen === "menu") {
    return (
      <div className="flex flex-col items-center gap-6 mt-16 relative px-4">
        {back}
        <h1 className="text-2xl font-bold">Satzbau</h1>
        <p className="text-gray-600 text-center max-w-sm">
          Put the words in the right order to build German sentences. Start simple, and learn the word-order rules as you go.
        </p>
        <Button className="w-56" onClick={start}>Start</Button>
        {infoDialog}
      </div>
    );
  }

  if (screen === "results") {
    return (
      <div className="flex flex-col items-center gap-6 mt-16 relative px-4">
        {back}
        <h1 className="text-2xl font-bold">Round over</h1>
        <StatsRow items={statItems} />
        <RoundSaved saved={saved} />
        <div className="text-gray-600">Reached level {level}: {LEVEL_NAMES[level]}</div>
        <div className="flex flex-col items-center gap-3">
          <Button className="w-56" onClick={start}>Play again</Button>
          <Button className="w-56" variant="outline" onClick={() => setScreen("menu")}>Menu</Button>
        </div>
        {infoDialog}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5 mt-16 relative px-4 pb-24">
      {back}
      <h1 className="text-2xl font-bold">Satzbau</h1>
      <StatsRow items={statItems} />
      <div className="text-sm text-gray-600">
        Level {level}/{MAX_SENTENCE_LEVEL}: {LEVEL_NAMES[level]}
      </div>
      {announced !== level && (
        <div className="max-w-md text-center text-sm bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
          <b>New:</b> {LEVEL_RULES[level]}
        </div>
      )}

      {sentence && (
        <>
          <div className="text-gray-600 text-center">{sentence.en}</div>

          <TileBuilder tiles={tiles} placed={placed} onChange={setPlaced} status={result} />

          {/* Feedback */}
          {result && (
            <div
              className={cn(
                "w-full max-w-xl text-center rounded-xl p-4 border-2",
                result.correct
                  ? "border-green-600 bg-green-50 animate-in zoom-in-95 fade-in duration-300"
                  : "border-red-400 bg-red-50"
              )}
            >
              {result.correct ? (
                <div className="text-xl font-bold text-green-700">Richtig! ✓</div>
              ) : (
                <>
                  <div className="font-semibold text-red-700">Not quite. The correct sentence is:</div>
                  {sentence.display.map((d) => (
                    <div key={d} className="text-xl font-bold mt-1">{d}</div>
                  ))}
                </>
              )}
              {result.correct && <div className="text-lg font-semibold mt-1">{sentence.display[result.variant]}</div>}
              {(!result.correct || sentence.level > 1) && (
                <div className="text-sm text-gray-700 mt-2">💡 {sentence.rule}</div>
              )}
            </div>
          )}

          <div className="flex gap-3">
            {!result && (
              <>
                <Button variant="outline" disabled={placed.length === 0} onClick={() => setPlaced([])}>
                  Clear
                </Button>
                <Button className="w-40" disabled={!complete} onClick={check}>Check</Button>
              </>
            )}
            {result && <Button className="w-40" onClick={next}>Next</Button>}
          </div>
        </>
      )}
      <Button variant="ghost" size="sm" onClick={() => setScreen("results")}>End round</Button>
      {infoDialog}
    </div>
  );
}
