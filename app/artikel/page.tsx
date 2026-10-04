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
import { ExplainButton } from "@/components/explain-button";
import { RoundSaved } from "@/components/round-saved";
import { useRoundReporter } from "@/lib/use-round-reporter";
import type { Miss } from "@/lib/tracking/types";
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
  const [roundMisses, setRoundMisses] = useState<Miss[]>([]);
  const deckRef = useRef<Noun[]>([]);

  // The timed round ends on its own when the clock runs out.
  const timeUp = screen === "playing" && mode === "timed" && timeLeft <= 0;
  const view: Screen = timeUp ? "results" : screen;

  const buildRound = useCallback(
    () => ({
      game: "artikel" as const,
      mode: mode === "timed" ? ("timed" as const) : ("practice" as const),
      correct: stats.correct,
      total: stats.total,
      xp: stats.xp,
      bestStreak: stats.best,
      level: 1,
      misses: roundMisses,
    }),
    [mode, stats, roundMisses]
  );
  const saved = useRoundReporter(view === "results" ? "finished" : view === "playing" ? "playing" : "idle", buildRound);

  const drawRandom = (last?: Noun) => {
    const { noun, deck } = nextFromDeck(deckRef.current, NOUNS, last);
    deckRef.current = deck;
    return noun;
  };

  const start = (m: Mode) => {
    setMode(m);
    setStats(EMPTY_STATS);
    setRoundMisses([]);
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
        setRoundMisses((m) => [...m, { key: current.de, label: `${current.article} ${current.de}` }]);
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
    if (view !== "playing" || !feedback?.correct) return;
    const t = setTimeout(next, AUTO_ADVANCE_MS);
    return () => clearTimeout(t);
  }, [feedback, view, next]);

  // Timed mode countdown.
  const timed = view === "playing" && mode === "timed";
  useEffect(() => {
    if (!timed) return;
    const t = setInterval(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [timed]);
  // Keyboard: 1/2/3 to answer, Enter/Space to continue after a miss.
  useEffect(() => {
    if (view !== "playing") return;
    const onKey = (e: KeyboardEvent) => {
      if (open) return;
      if (e.key >= "1" && e.key <= "3") answer(ARTICLES[Number(e.key) - 1]);
      else if ((e.key === "Enter" || e.key === " ") && feedback && !feedback.correct && !(e.target as HTMLElement).closest("button, [role=dialog]")) {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [view, open, feedback, answer, next]);

  const combo = comboLevel(stats.streak);

  const infoDialog = (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label="How to play"
          className="fixed bottom-6 right-6 z-50 bg-primary border-[3px] border-ink rounded shadow-arcade p-3 hover:bg-primary/90 active:translate-x-1 active:translate-y-1 active:shadow-none"
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
                <li>Correct answers move on by themselves. After a miss, the right answer stays on view until you press <b>Next</b> (or Enter).</li>
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
    <Link href="/" className="absolute -top-10 left-4 text-sm underline text-muted-foreground">
      ← All games
    </Link>
  );

  if (view === "menu") {
    return (
      <div className="flex flex-col items-center gap-6 mt-16 relative px-4">
        {back}
        <h1 className="text-2xl font-bold">Der / Die / Das</h1>
        <p className="text-muted-foreground text-center max-w-sm">
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

  if (view === "results") {
    const cleared = mode === "mistakes" && mistakes.length === 0;
    return (
      <div className="flex flex-col items-center gap-6 mt-16 relative px-4">
        {back}
        <h1 className="text-2xl font-bold">{mode === "timed" ? "Time's up!" : cleared ? "All mistakes cleared!" : "Round over"}</h1>
        <StatsRow items={statItems(stats)} />
        <RoundSaved saved={saved} />
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
          <span className={cn("flex items-center gap-1 font-mono text-lg", timeLeft <= 10 && "text-primary")}>
            <Timer size={18} /> {Math.max(timeLeft, 0)}s
          </span>
        )}
        {mode === "mistakes" && <span className="text-sm text-muted-foreground">Mistakes left: {queue.length}</span>}
        {combo !== "none" && (
          <span
            className={cn(
              "flex items-center gap-1 rounded border-2 border-ink px-3 py-1 font-mono font-bold text-white",
              combo === "strong"
                ? "bg-primary text-lg animate-pulse shadow-arcade"
                : "bg-secondary text-secondary-foreground text-sm"
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
                    "w-24 sm:w-28 py-5 rounded border-2 text-2xl font-bold uppercase transition",
                    !feedback && "bg-card hover:bg-accent border-ink shadow-arcade-sm",
                    isAnswer && "bg-success border-ink text-white",
                    isWrongPick && "bg-primary border-ink text-white",
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
                <div className={cn("text-lg font-semibold", feedback.correct ? "text-success" : "text-primary")}>
                  {feedback.correct ? "Richtig!" : "Not quite. The correct article is:"}
                </div>
                <div className="text-3xl font-bold mt-1">
                  {current.article} {current.de}
                </div>
                <div className="text-muted-foreground">{current.en}</div>
              </>
            )}
          </div>
          <Button className="w-40" disabled={!feedback || feedback.correct} onClick={next}>
            Next
          </Button>
          {feedback && !feedback.correct && (
            <ExplainButton key={current.de} request={{ game: "artikel", noun: current.de, picked: feedback.picked }} />
          )}
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
