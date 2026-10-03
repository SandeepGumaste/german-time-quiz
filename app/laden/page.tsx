"use client";
import React, { useCallback, useEffect, useState } from "react";
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
import { TileBuilder } from "@/components/tile-builder";
import { accuracy, xpForCorrect } from "@/lib/artikel-game";
import { compareToVariants } from "@/lib/sentences";
import {
  CORRECT_PER_SHOP_LEVEL,
  MAX_SHOP_LEVEL,
  SHOP_LEVEL_NAMES,
  SHOP_LEVEL_TIPS,
  buildOrder,
  formatPrice,
  shopLevelFor,
  type Order,
} from "@/lib/shop";
import { cn } from "@/lib/utils";

type Screen = "menu" | "playing" | "results";
type Stats = { correct: number; total: number; streak: number; best: number; xp: number };
type Result = { correct: boolean; mismatches: number[] };

const EMPTY_STATS: Stats = { correct: 0, total: 0, streak: 0, best: 0, xp: 0 };

export default function GermanShop() {
  const [screen, setScreen] = useState<Screen>("menu");
  const [order, setOrder] = useState<Order | null>(null);
  const [placed, setPlaced] = useState<number[]>([]);
  const [result, setResult] = useState<Result | null>(null);
  const [stats, setStats] = useState<Stats>(EMPTY_STATS);
  const [roundMisses, setRoundMisses] = useState<Miss[]>([]);
  const [announced, setAnnounced] = useState(0);
  const [open, setOpen] = useState(false);

  const level = shopLevelFor(stats.correct);

  const buildRound = useCallback(
    () => ({
      game: "laden" as const,
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

  const load = (lvl: number) => {
    setOrder(buildOrder(lvl));
    setPlaced([]);
    setResult(null);
  };

  const start = () => {
    setStats(EMPTY_STATS);
    setRoundMisses([]);
    setAnnounced(0);
    load(1);
    setScreen("playing");
  };

  const check = useCallback(() => {
    if (!order || result || placed.length === 0) return;
    const words = placed.map((id) => order.tiles.find((t) => t.id === id)!.text);
    const r = compareToVariants(words, order.variants);
    setResult(r);
    setAnnounced(level);
    if (!r.correct) setRoundMisses((m) => [...m, ...order.lines.map(({ item }) => ({ key: item.de, label: `${item.gender} ${item.de}` }))]);
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
  }, [order, result, placed, level]);

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
          <DialogTitle>How to play German Shop</DialogTitle>
          <DialogDescription asChild>
            <div>
              <ul className="list-disc pl-5 space-y-2 text-left">
                <li>Look at your shopping list and order everything in German, politely: <b>Ich möchte … , bitte.</b></li>
                <li><b>Tap</b> words to build the sentence (tap again to remove one), or <b>drag</b> them on desktop. Some tiles are wrong on purpose.</li>
                <li>Think about the article (<b>einen / eine / ein</b>) and the plural form. For several items, the order of items doesn&apos;t matter.</li>
                <li>Press <b>Order</b> (or Enter). If you get it right, the shopkeeper tells you the price in German.</li>
                <li>You level up every {CORRECT_PER_SHOP_LEVEL} correct orders, from one item to three.</li>
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
        <h1 className="text-2xl font-bold">Der Laden 🛒</h1>
        <p className="text-muted-foreground text-center max-w-sm">
          Step into a German shop and order what is on your list, in a polite, correct sentence.
        </p>
        <Button className="w-56" onClick={start}>Enter the shop</Button>
        {infoDialog}
      </div>
    );
  }

  if (screen === "results") {
    return (
      <div className="flex flex-col items-center gap-6 mt-16 relative px-4">
        {back}
        <h1 className="text-2xl font-bold">Auf Wiedersehen!</h1>
        <StatsRow items={statItems} />
        <RoundSaved saved={saved} />
        <div className="text-muted-foreground">Reached level {level}: {SHOP_LEVEL_NAMES[level]}</div>
        <div className="flex flex-col items-center gap-3">
          <Button className="w-56" onClick={start}>Shop again</Button>
          <Button className="w-56" variant="outline" onClick={() => setScreen("menu")}>Menu</Button>
        </div>
        {infoDialog}
      </div>
    );
  }

  const price = order ? formatPrice(order.totalCents) : null;

  return (
    <div className="flex flex-col items-center gap-5 mt-16 relative px-4 pb-24">
      {back}
      <h1 className="text-2xl font-bold">Der Laden 🛒</h1>
      <StatsRow items={statItems} />
      <div className="text-sm text-muted-foreground">Level {level}/{MAX_SHOP_LEVEL}: {SHOP_LEVEL_NAMES[level]}</div>
      {announced !== level && (
        <div className="max-w-md text-center text-sm bg-card border-2 border-ink rounded px-3 py-2">
          <b>Tip:</b> {SHOP_LEVEL_TIPS[level]}
        </div>
      )}

      {order && (
        <>
          <div className="w-full max-w-xl rounded bg-secondary/40 border-[3px] border-ink px-4 py-3">
            <div className="text-xs text-secondary-foreground font-semibold">Verkäufer</div>
            <div className="text-lg">Guten Tag! Was möchten Sie?</div>
          </div>

          <div className="w-full max-w-xl border-[3px] border-ink bg-card shadow-arcade-sm rounded px-4 py-3">
            <div className="text-xs text-muted-foreground font-semibold mb-1">Your shopping list</div>
            <ul className="flex flex-wrap gap-x-6 gap-y-1">
              {order.lines.map(({ item, qty }) => (
                <li key={item.de} className="text-lg">
                  <span className="mr-1">{item.emoji}</span>
                  {qty} {qty === 1 ? item.en : item.enPl}
                </li>
              ))}
            </ul>
          </div>

          <TileBuilder tiles={order.tiles} placed={placed} onChange={setPlaced} status={result} />

          {result && price && (
            <div
              className={cn(
                "w-full max-w-xl rounded p-4 border-2",
                result.correct ? "border-ink bg-success-soft animate-in zoom-in-95 fade-in duration-300" : "border-ink bg-danger-soft"
              )}
            >
              <div className="text-xs font-semibold text-muted-foreground">Verkäufer</div>
              {result.correct ? (
                <>
                  <div className="text-lg font-semibold text-success">Gerne! Das macht {price.digits}.</div>
                  <div className="text-muted-foreground">{price.german}</div>
                </>
              ) : (
                <>
                  <div className="text-lg font-semibold text-primary">Wie bitte? Try:</div>
                  <div className="text-xl font-bold">{order.display}</div>
                </>
              )}
              <ul className="mt-2 text-sm text-muted-foreground space-y-0.5">
                {order.notes.map((n) => (
                  <li key={n}>💡 {n}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-3">
            {!result && (
              <>
                <Button variant="outline" disabled={placed.length === 0} onClick={() => setPlaced([])}>Clear</Button>
                <Button className="w-40" disabled={placed.length === 0} onClick={check}>Order</Button>
              </>
            )}
            {result && <Button className="w-40" onClick={next}>Next customer</Button>}
          </div>
        </>
      )}
      <Button variant="ghost" size="sm" onClick={() => setScreen("results")}>Leave shop</Button>
      {infoDialog}
    </div>
  );
}
