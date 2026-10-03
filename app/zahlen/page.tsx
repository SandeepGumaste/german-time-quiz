"use client";
import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Flame, Info, Timer } from "lucide-react";
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
import { TIMED_SECONDS, accuracy, comboLevel, xpForCorrect } from "@/lib/artikel-game";
import { CORRECT_PER_LEVEL, MAX_LEVEL, levelFor, nextQuestion, type NumberQuestion } from "@/lib/german-numbers";
import { cn } from "@/lib/utils";

type Mode = "practice" | "timed";
type Screen = "menu" | "playing" | "results";
type Stats = { correct: number; total: number; streak: number; best: number; xp: number };

const EMPTY_STATS: Stats = { correct: 0, total: 0, streak: 0, best: 0, xp: 0 };
const TYPE_LABELS: Record<NumberQuestion["type"], string> = {
  small: "Numbers 0–20",
  tens: "Numbers 21–100",
  large: "Large numbers",
  price: "Prices",
  date: "Dates",
  year: "Years",
};
const AUTO_ADVANCE_MS = 700;

export default function ZahlenGame() {
  const [screen, setScreen] = useState<Screen>("menu");
  const [mode, setMode] = useState<Mode>("practice");
  const [question, setQuestion] = useState<NumberQuestion | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats>(EMPTY_STATS);
  const [bestScore, setBestScore] = useState(0); // best round score this session
  const [timeLeft, setTimeLeft] = useState(TIMED_SECONDS);
  const [open, setOpen] = useState(false);
  const [roundMisses, setRoundMisses] = useState<Miss[]>([]);

  // The timed round ends on its own when the clock runs out.
  const timeUp = screen === "playing" && mode === "timed" && timeLeft <= 0;
  const view: Screen = timeUp ? "results" : screen;

  const level = levelFor(stats.correct);

  const buildRound = useCallback(
    () => ({
      game: "zahlen" as const,
      mode,
      correct: stats.correct,
      total: stats.total,
      xp: stats.xp,
      bestStreak: stats.best,
      level,
      misses: roundMisses,
    }),
    [mode, stats, level, roundMisses]
  );
  const saved = useRoundReporter(view === "results" ? "finished" : view === "playing" ? "playing" : "idle", buildRound);

  const start = (m: Mode) => {
    setBestScore((b) => Math.max(b, stats.correct));
    setMode(m);
    setStats(EMPTY_STATS);
    setRoundMisses([]);
    setPicked(null);
    setTimeLeft(TIMED_SECONDS);
    setQuestion(nextQuestion(1));
    setScreen("playing");
  };

  const answer = useCallback(
    (choice: string) => {
      if (!question || picked !== null) return;
      const correct = choice === question.answer;
      setPicked(choice);
      if (!correct) setRoundMisses((m) => [...m, { key: question.type, label: TYPE_LABELS[question.type] }]);
      setStats((s) => {
        const streak = correct ? s.streak + 1 : 0;
        return {
          correct: s.correct + (correct ? 1 : 0),
          total: s.total + 1,
          streak,
          best: Math.max(s.best, streak),
          xp: s.xp + (correct ? xpForCorrect(streak) : 0),
        };
      });
    },
    [question, picked]
  );

  const next = useCallback(() => {
    setPicked(null);
    setQuestion(nextQuestion(level));
  }, [level]);

  const wasCorrect = picked !== null && picked === question?.answer;

  // Correct answers continue on their own; wrong ones wait so the solution can be read.
  useEffect(() => {
    if (view !== "playing" || !wasCorrect) return;
    const t = setTimeout(next, AUTO_ADVANCE_MS);
    return () => clearTimeout(t);
  }, [wasCorrect, view, next]);

  const timed = view === "playing" && mode === "timed";
  useEffect(() => {
    if (!timed) return;
    const t = setInterval(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [timed]);
  // Keyboard: 1-4 to answer, Enter/Space to continue after a miss.
  useEffect(() => {
    if (view !== "playing") return;
    const onKey = (e: KeyboardEvent) => {
      if (open || !question) return;
      if (e.key >= "1" && e.key <= "4") {
        const c = question.choices[Number(e.key) - 1];
        if (c) answer(c);
      } else if ((e.key === "Enter" || e.key === " ") && picked !== null && !wasCorrect) {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [view, open, question, picked, wasCorrect, answer, next]);

  const combo = comboLevel(stats.streak);
  const statItems: [string, string | number][] = [
    ["Score", stats.correct],
    ["Streak", stats.streak],
    ["Accuracy", `${accuracy(stats.correct, stats.total)}%`],
    ["XP", stats.xp],
    ["Best", Math.max(bestScore, stats.correct)],
  ];

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
          <DialogTitle>How to play Numbers & Prices</DialogTitle>
          <DialogDescription asChild>
            <div>
              <ul className="list-disc pl-5 space-y-2 text-left">
                <li>Pick the German words for the number shown, or the digits for the German words. Keys <b>1–4</b> work too.</li>
                <li>You level up every {CORRECT_PER_LEVEL} correct answers: 0–20, 21–100, larger numbers, prices, dates, then years.</li>
                <li>After a miss, the right answer stays on view until you press <b>Next</b> (or Enter).</li>
                <li>Each correct answer gives 10 XP, plus bonus XP from a streak of 3. <b>Timed</b> mode gives you {TIMED_SECONDS} seconds.</li>
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

  if (view === "menu") {
    return (
      <div className="flex flex-col items-center gap-6 mt-16 relative px-4">
        {back}
        <h1 className="text-2xl font-bold">Zahlen &amp; Preise</h1>
        <p className="text-gray-600 text-center max-w-sm">
          Recognize German numbers, prices, dates and years. It gets harder as you go.
        </p>
        <Button className="w-56" onClick={() => start("practice")}>Practice (no timer)</Button>
        <Button className="w-56" variant="secondary" onClick={() => start("timed")}>
          <Timer size={18} /> Timed ({TIMED_SECONDS}s)
        </Button>
        {Math.max(bestScore, stats.correct) > 0 && <div className="text-sm text-gray-600">Best score this session: {Math.max(bestScore, stats.correct)}</div>}
        {infoDialog}
      </div>
    );
  }

  if (view === "results") {
    return (
      <div className="flex flex-col items-center gap-6 mt-16 relative px-4">
        {back}
        <h1 className="text-2xl font-bold">{mode === "timed" ? "Time's up!" : "Round over"}</h1>
        <StatsRow items={statItems} />
        <RoundSaved saved={saved} />
        <div className="text-gray-600">Reached level {level} of {MAX_LEVEL}</div>
        <div className="flex flex-col items-center gap-3">
          <Button className="w-56" onClick={() => start(mode)}>Play again</Button>
          <Button className="w-56" variant="outline" onClick={() => setScreen("menu")}>Menu</Button>
        </div>
        {infoDialog}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 mt-16 relative px-4">
      {back}
      <h1 className="text-2xl font-bold">Zahlen &amp; Preise</h1>
      <StatsRow items={statItems} />
      <div className="flex items-center gap-4 h-8">
        <span className="text-sm text-gray-600">Stufe {level}/{MAX_LEVEL}</span>
        {mode === "timed" && (
          <span className={cn("flex items-center gap-1 font-mono text-lg", timeLeft <= 10 && "text-red-600")}>
            <Timer size={18} /> {Math.max(timeLeft, 0)}s
          </span>
        )}
        {combo !== "none" && (
          <span
            className={cn(
              "flex items-center gap-1 rounded-full px-3 py-1 font-bold text-white",
              combo === "strong"
                ? "bg-orange-600 text-lg animate-pulse shadow-lg shadow-orange-400"
                : "bg-orange-400 text-sm"
            )}
          >
            <Flame size={combo === "strong" ? 22 : 16} />
            {combo === "strong" ? `ON FIRE x${stats.streak}` : `Combo x${stats.streak}`}
          </span>
        )}
      </div>

      {question && (
        <>
          <div className="text-gray-600">{question.ask}</div>
          <div className={cn("font-bold text-center break-words max-w-full", question.reverse ? "text-3xl" : "text-5xl")}>
            {question.prompt}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
            {question.choices.map((c, i) => {
              const isAnswer = picked !== null && c === question.answer;
              const isWrongPick = picked !== null && c === picked && c !== question.answer;
              return (
                <button
                  key={c}
                  type="button"
                  disabled={picked !== null}
                  onClick={() => answer(c)}
                  className={cn(
                    "py-4 px-3 rounded-xl border-2 text-lg font-semibold transition break-words",
                    picked === null && "bg-white hover:bg-gray-100 border-gray-300",
                    isAnswer && "bg-green-600 border-green-700 text-white",
                    isWrongPick && "bg-red-600 border-red-700 text-white",
                    picked !== null && !isAnswer && !isWrongPick && "opacity-40"
                  )}
                >
                  <span className="text-xs font-normal opacity-60 mr-2">{i + 1}</span>
                  {c}
                </button>
              );
            })}
          </div>
          <div className="h-12 text-center">
            {picked !== null && (
              <>
                <div className={cn("font-semibold", wasCorrect ? "text-green-600" : "text-red-600")}>
                  {wasCorrect ? "Richtig!" : "Not quite:"}
                </div>
                <div className="text-lg font-bold">{question.solution}</div>
              </>
            )}
          </div>
          <Button className="w-40" disabled={picked === null || wasCorrect} onClick={next}>
            Next
          </Button>
        </>
      )}
      <Button variant="ghost" size="sm" onClick={() => setScreen("results")}>End round</Button>
      {infoDialog}
    </div>
  );
}
