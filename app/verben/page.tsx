"use client";
import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Flame, Heart, Info } from "lucide-react";
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
import { ExplainButton } from "@/components/explain-button";
import { RoundSaved } from "@/components/round-saved";
import { useRoundReporter } from "@/lib/use-round-reporter";
import type { Miss } from "@/lib/tracking/types";
import { accuracy, comboLevel, xpForCorrect } from "@/lib/artikel-game";
import {
  CORRECT_PER_VERB_LEVEL,
  MAX_VERB_LEVEL,
  VERB_LEVEL_NAMES,
  nextVerbQuestion,
  runSeconds,
  verbLevelFor,
  type VerbQuestion,
} from "@/lib/verbs";
import { cn } from "@/lib/utils";

type Screen = "menu" | "playing" | "results";
type Stats = { correct: number; total: number; streak: number; best: number; xp: number };

const EMPTY_STATS: Stats = { correct: 0, total: 0, streak: 0, best: 0, xp: 0 };
const START_LIVES = 3;
const TIMEOUT = "__timeout__";

export default function VerbRunner() {
  const [screen, setScreen] = useState<Screen>("menu");
  const [question, setQuestion] = useState<VerbQuestion | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats>(EMPTY_STATS);
  const [lives, setLives] = useState(START_LIVES);
  const [open, setOpen] = useState(false);
  const [roundMisses, setRoundMisses] = useState<Miss[]>([]);
  const [missed, setMissed] = useState<VerbQuestion[]>([]);

  const level = verbLevelFor(stats.correct);
  const correct = picked !== null && picked === question?.answer;

  const buildRound = useCallback(
    () => ({
      game: "verben" as const,
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

  const start = () => {
    setStats(EMPTY_STATS);
    setRoundMisses([]);
    setMissed([]);
    setLives(START_LIVES);
    setPicked(null);
    setQuestion(nextVerbQuestion(1));
    setScreen("playing");
  };

  const resolve = useCallback(
    (choice: string) => {
      if (!question || picked !== null) return;
      const ok = choice === question.answer;
      setPicked(choice);
      if (!ok) {
        setLives((l) => l - 1);
        setRoundMisses((m) => [...m, { key: question.hint, label: question.hint }]);
        setMissed((m) => [...m, question]);
      }
      setStats((s) => {
        const streak = ok ? s.streak + 1 : 0;
        return {
          correct: s.correct + (ok ? 1 : 0),
          total: s.total + 1,
          streak,
          best: Math.max(s.best, streak),
          xp: s.xp + (ok ? xpForCorrect(streak) : 0),
        };
      });
    },
    [question, picked]
  );

  // The runner reaching the gates counts as a miss.
  useEffect(() => {
    if (screen !== "playing" || !question || picked !== null) return;
    const t = setTimeout(() => resolve(TIMEOUT), runSeconds(question.level) * 1000);
    return () => clearTimeout(t);
  }, [screen, question, picked, resolve]);

  // Move on shortly after an answer; a wrong one lingers so the correct form can be read.
  useEffect(() => {
    if (screen !== "playing" || picked === null) return;
    const t = setTimeout(
      () => {
        if (lives <= 0) {
          setScreen("results");
        } else {
          setPicked(null);
          setQuestion(nextVerbQuestion(level));
        }
      },
      correct ? 600 : 1800
    );
    return () => clearTimeout(t);
  }, [picked, screen, correct, lives, level]);

  useEffect(() => {
    if (screen !== "playing") return;
    const onKey = (e: KeyboardEvent) => {
      if (open || !question || e.key < "1" || e.key > "3") return;
      resolve(question.choices[Number(e.key) - 1]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [screen, open, question, resolve]);

  const combo = comboLevel(stats.streak);
  const statItems: [string, string | number][] = [
    ["Score", stats.correct],
    ["Streak", stats.streak],
    ["Best", stats.best],
    ["Accuracy", `${accuracy(stats.correct, stats.total)}%`],
    ["XP", stats.xp],
  ];

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
          <DialogTitle>How to play Verb Runner</DialogTitle>
          <DialogDescription asChild>
            <div>
              <ul className="list-disc pl-5 space-y-2 text-left">
                <li>Pick the verb form that fills the gap, before the runner reaches the gates. Keys <b>1 / 2 / 3</b> work too.</li>
                <li>A wrong gate, or running out of time, costs a life. You have {START_LIVES}.</li>
                <li>You level up every {CORRECT_PER_VERB_LEVEL} correct answers: sein &amp; haben, regular verbs, irregular verbs, past tense, then Perfekt. The runner gets faster as you go.</li>
                <li>Each correct answer gives 10 XP, plus bonus XP from a streak of 3.</li>
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

  if (screen === "menu") {
    return (
      <div className="flex flex-col items-center gap-6 mt-16 relative px-4">
        {back}
        <h1 className="text-2xl font-bold">Verb Runner</h1>
        <p className="text-muted-foreground text-center max-w-sm">
          Pick the right verb form before the runner reaches the gates. Three lives, and it gets faster.
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
        <h1 className="text-2xl font-bold">Game over</h1>
        <StatsRow items={statItems} />
        <RoundSaved saved={saved} />
        <div className="text-muted-foreground">Reached level {level}: {VERB_LEVEL_NAMES[level]}</div>
        {missed.length > 0 && (
          <section className="w-full max-w-xl">
            <h2 className="font-semibold mb-2">Your misses</h2>
            <ul className="space-y-3 text-sm">
              {missed.slice(-5).map((q) => (
                <li key={q.id} className="border-t pt-2 flex flex-col items-start gap-2">
                  <span>{q.before} <b>{q.answer}</b>{q.after} <span className="text-muted-foreground">({q.hint})</span></span>
                  <ExplainButton request={{ game: "verben", hint: q.hint, answer: q.answer, before: q.before, after: q.after }} />
                </li>
              ))}
            </ul>
          </section>
        )}
        <div className="flex flex-col items-center gap-3">
          <Button className="w-56" onClick={start}>Play again</Button>
          <Button className="w-56" variant="outline" onClick={() => setScreen("menu")}>Menu</Button>
        </div>
        {infoDialog}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5 mt-16 relative px-4">
      {back}
      <h1 className="text-2xl font-bold">Verb Runner</h1>
      <StatsRow items={statItems} />
      <div className="flex items-center gap-4 h-8">
        <span className="text-sm text-muted-foreground">Level {level}/{MAX_VERB_LEVEL}: {VERB_LEVEL_NAMES[level]}</span>
        <span className="flex gap-1" aria-label={`${lives} lives left`}>
          {Array.from({ length: START_LIVES }, (_, i) => (
            <Heart key={i} size={20} className={i < lives ? "text-primary fill-primary" : "text-muted-foreground"} />
          ))}
        </span>
        {combo !== "none" && (
          <span
            className={cn(
              "flex items-center gap-1 rounded border-2 border-ink px-3 py-1 font-mono font-bold text-white",
              combo === "strong" ? "bg-primary animate-pulse shadow-arcade" : "bg-secondary text-secondary-foreground text-sm"
            )}
          >
            <Flame size={combo === "strong" ? 20 : 16} /> x{stats.streak}
          </span>
        )}
      </div>

      {question && (
        <>
          <div className="text-2xl sm:text-3xl font-bold text-center max-w-xl">
            {question.before}{" "}
            <span className={cn("inline-block min-w-24 border-b-4 px-1", picked === null ? "border-ink text-transparent" : correct ? "border-success text-success" : "border-primary text-primary")}>
              {picked === null ? "___" : question.answer}
            </span>
            {question.after}
          </div>
          <div className="text-sm text-muted-foreground">({question.hint})</div>

          {/* Track: the runner crosses it, and the finish line is the gates. */}
          <div className="relative w-full max-w-xl h-12 border-b-4 border-ink">
            <span
              key={question.id}
              className="absolute bottom-0 text-3xl"
              style={{
                animation: `runner-run ${runSeconds(question.level)}s linear forwards`,
                animationPlayState: picked === null ? "running" : "paused",
              }}
            >
              {picked !== null && !correct ? "😵" : "🏃"}
            </span>
            <span className="absolute right-0 bottom-0 text-3xl">🚧</span>
          </div>

          <div className="grid grid-cols-3 gap-3 w-full max-w-xl">
            {question.choices.map((c, i) => {
              const isAnswer = picked !== null && c === question.answer;
              const isWrongPick = picked !== null && c === picked && c !== question.answer;
              return (
                <button
                  key={c}
                  type="button"
                  disabled={picked !== null}
                  onClick={() => resolve(c)}
                  className={cn(
                    "py-5 px-2 rounded border-2 text-lg sm:text-xl font-bold transition break-words",
                    picked === null && "bg-card hover:bg-accent border-ink shadow-arcade-sm",
                    isAnswer && "bg-success border-ink text-white",
                    isWrongPick && "bg-primary border-ink text-white",
                    picked !== null && !isAnswer && !isWrongPick && "opacity-40"
                  )}
                >
                  <span className="block text-xs font-normal opacity-60">{i + 1}</span>
                  {c}
                </button>
              );
            })}
          </div>
          <div className="h-6 text-center font-semibold">
            {picked === TIMEOUT && <span className="text-primary">Too slow!</span>}
            {correct && <span className="text-success">Richtig!</span>}
          </div>
        </>
      )}
      <Button variant="ghost" size="sm" onClick={() => setScreen("results")}>End game</Button>
      {infoDialog}
    </div>
  );
}
