"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
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
import { NOUNS, type Article, type Noun } from "@/lib/nouns";
import {
  TIMED_SECONDS,
  accuracy,
  comboLevel,
  nextFromDeck,
  xpForCorrect,
} from "@/lib/artikel-game";
import { StatsRow } from "@/components/stats-row";
import { cn } from "@/lib/utils";

type Mode = "practice" | "timed" | "mistakes";
type Screen = "menu" | "playing" | "results";
type Feedback = { picked: Article; correct: boolean };
type Stats = { correct: number; total: number; streak: number; best: number; xp: number };

const ARTICLES: Article[] = ["der", "die", "das"];
const EMPTY_STATS: Stats = { correct: 0, total: 0, streak: 0, best: 0, xp: 0 };
const AUTO_ADVANCE_MS = 1100;

export default function ArtikelGame() {
  const [screen, setScreen] = useState<Screen>("menu");
  const [mode, setMode] = useState<Mode>("practice");
  const [current, setCurrent] = useState<Noun | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [stats, setStats] = useState<Stats>(EMPTY_STATS);
  const [mistakes, setMistakes] = useState<Noun[]>([]);
  const [queue, setQueue] = useState<Noun[]>([]);
  const [timeLeft, setTimeLeft] = useState(TIMED_SECONDS);
  const [open, setOpen] = useState(false);
  const deckRef = useRef<Noun[]>([]);

  const drawRandom = (last?: Noun) => {
    const { noun, deck } = nextFromDeck(deckRef.current, NOUNS, last);
    deckRef.current = deck;
    return noun;
  };

  const start = (m: Mode) => {
    setMode(m);
    setStats(EMPTY_STATS);
    setFeedback(null);
    setTimeLeft(TIMED_SECONDS);
    if (m === "mistakes") {
      setQueue(mistakes);
      setCurrent(mistakes[0]);
    } else {
      deckRef.current = [];
      setCurrent(drawRandom());
    }
    setScreen("playing");
  };

  const answer = useCallback(
    (picked: Article) => {
      if (!current || feedback) return;
      const correct = picked === current.article;
      setFeedback({ picked, correct });
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
      if (correct) {
        setMistakes((m) => m.filter((n) => n !== current));
        setQueue((q) => q.filter((n) => n !== current));
      } else {
        setMistakes((m) => (m.includes(current) ? m : [...m, current]));
        // Missed words go to the back of the practice queue so they come around again.
        setQueue((q) => (mode === "mistakes" ? [...q.filter((n) => n !== current), current] : q));
      }
    },
    [current, feedback, mode]
  );

  const next = useCallback(() => {
    setFeedback(null);
    if (mode === "mistakes") {
      if (queue.length === 0) setScreen("results");
      else setCurrent(queue[0]);
    } else {
      setCurrent(drawRandom(current ?? undefined));
    }
  }, [mode, queue, current]);

  // Correct answers continue on their own; wrong ones wait so the correction can be read.
  useEffect(() => {
    if (screen !== "playing" || !feedback?.correct) return;
    const t = setTimeout(next, AUTO_ADVANCE_MS);
    return () => clearTimeout(t);
  }, [feedback, screen, next]);

  // Timed mode countdown.
  const timed = screen === "playing" && mode === "timed";
  useEffect(() => {
    if (!timed) return;
    const t = setInterval(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [timed]);
  useEffect(() => {
    if (timed && timeLeft <= 0) setScreen("results");
  }, [timed, timeLeft]);

  // Keyboard: 1/2/3 to answer, Enter/Space to continue after a miss.
  useEffect(() => {
    if (screen !== "playing") return;
    const onKey = (e: KeyboardEvent) => {
      if (open) return;
      if (e.key >= "1" && e.key <= "3") answer(ARTICLES[Number(e.key) - 1]);
      else if ((e.key === "Enter" || e.key === " ") && feedback && !feedback.correct) {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [screen, open, feedback, answer, next]);

  const combo = comboLevel(stats.streak);

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
          <DialogTitle>How to play Der / Die / Das</DialogTitle>
          <DialogDescription asChild>
            <div>
              <ul className="list-disc pl-5 space-y-2 text-left">
                <li>Pick the right article for the noun: <b>der</b>, <b>die</b> or <b>das</b>. Keys <b>1 / 2 / 3</b> work too.</li>
                <li>Correct answers move on by themselves. After a miss, the right answer stays on screen until you press <b>Next</b> (or Enter).</li>
                <li>Each correct answer gives 10 XP. From a streak of 3 you also get bonus XP.</li>
                <li><b>Timed</b> mode gives you {TIMED_SECONDS} seconds.</li>
                <li>Missed words are saved for the session. Use <b>Practice mistakes</b> to replay them; a word leaves the list once you get it right.</li>
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

  if (screen === "menu") {
    return (
      <div className="flex flex-col items-center gap-6 mt-16 relative px-4">
        {back}
        <h1 className="text-2xl font-bold">Der / Die / Das</h1>
        <p className="text-gray-600 text-center max-w-sm">
          Pick the right article for each German noun. Build streaks, earn XP.
        </p>
        <Button className="w-56" onClick={() => start("practice")}>Practice (no timer)</Button>
        <Button className="w-56" variant="secondary" onClick={() => start("timed")}>
          <Timer size={18} /> Timed ({TIMED_SECONDS}s)
        </Button>
        {infoDialog}
      </div>
    );
  }

  if (screen === "results") {
    const cleared = mode === "mistakes" && mistakes.length === 0;
    return (
      <div className="flex flex-col items-center gap-6 mt-16 relative px-4">
        {back}
        <h1 className="text-2xl font-bold">{mode === "timed" ? "Time's up!" : cleared ? "All mistakes cleared!" : "Round over"}</h1>
        <StatsRow items={statItems(stats)} />
        <div className="flex flex-col items-center gap-3">
          {mistakes.length > 0 && (
            <Button className="w-56" onClick={() => start("mistakes")}>
              Practice mistakes ({mistakes.length})
            </Button>
          )}
          <Button className="w-56" variant="secondary" onClick={() => start(mode === "mistakes" ? "practice" : mode)}>
            Play again
          </Button>
          <Button className="w-56" variant="outline" onClick={() => setScreen("menu")}>Menu</Button>
        </div>
        {infoDialog}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 mt-16 relative px-4">
      {back}
      <h1 className="text-2xl font-bold">Der / Die / Das</h1>
      <StatsRow items={statItems(stats)} />
      <div className="flex items-center gap-4 h-8">
        {mode === "timed" && (
          <span className={cn("flex items-center gap-1 font-mono text-lg", timeLeft <= 10 && "text-red-600")}>
            <Timer size={18} /> {Math.max(timeLeft, 0)}s
          </span>
        )}
        {mode === "mistakes" && <span className="text-sm text-gray-600">Mistakes left: {queue.length}</span>}
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

      {current && (
        <>
          <div className="text-5xl font-bold h-16">{current.de}</div>
          <div className="flex gap-3">
            {ARTICLES.map((a, i) => {
              const isAnswer = feedback && a === current.article;
              const isWrongPick = feedback && !feedback.correct && a === feedback.picked;
              return (
                <button
                  key={a}
                  type="button"
                  disabled={!!feedback}
                  onClick={() => answer(a)}
                  className={cn(
                    "w-24 sm:w-28 py-5 rounded-xl border-2 text-2xl font-bold uppercase transition",
                    !feedback && "bg-white hover:bg-gray-100 border-gray-300",
                    isAnswer && "bg-green-600 border-green-700 text-white",
                    isWrongPick && "bg-red-600 border-red-700 text-white",
                    feedback && !isAnswer && !isWrongPick && "opacity-40"
                  )}
                >
                  {a}
                  <span className="block text-xs font-normal opacity-60">{i + 1}</span>
                </button>
              );
            })}
          </div>
          <div className="h-28 text-center">
            {feedback && (
              <>
                <div className={cn("text-lg font-semibold", feedback.correct ? "text-green-600" : "text-red-600")}>
                  {feedback.correct ? "Richtig!" : "Not quite. The correct article is:"}
                </div>
                <div className="text-3xl font-bold mt-1">
                  {current.article} {current.de}
                </div>
                <div className="text-gray-600">{current.en}</div>
              </>
            )}
          </div>
          <Button className="w-40" disabled={!feedback || feedback.correct} onClick={next}>
            Next
          </Button>
        </>
      )}
      <Button variant="ghost" size="sm" onClick={() => setScreen("results")}>End round</Button>
      {infoDialog}
    </div>
  );
}

const statItems = (stats: Stats): [string, string | number][] => [
  ["Score", stats.correct],
  ["Streak", stats.streak],
  ["Best", stats.best],
  ["Accuracy", `${accuracy(stats.correct, stats.total)}%`],
  ["XP", stats.xp],
];
