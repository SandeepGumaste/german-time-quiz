"use client";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { FILTERS, GAMES, type GameCategory, type HomeGame } from "@/lib/home-games";
import { RandomGameButton } from "@/components/random-game-button";

const px = "border-2 border-ink bg-muted p-3 flex flex-col items-center justify-center gap-1.5 min-h-[110px]";
const chip = "border border-ink bg-card px-2 py-0.5 font-mono text-xs font-bold";

function Preview({ game }: { game: HomeGame }) {
  switch (game.href) {
    case "/time":
      return (
        <div className={px}>
          <div className="flex items-center gap-2 font-mono text-xl font-bold"><span className="text-primary">◷</span> 15:15</div>
          <div className={cn(chip, "text-primary")}>» VIERTEL NACH DREI «</div>
        </div>
      );
    case "/artikel":
      return (
        <div className={px}>
          <div className="flex w-full gap-1.5 font-mono font-bold">
            <span className="flex-1 border border-ink bg-accent py-1 text-center">DER</span>
            <span className="flex-1 border border-ink bg-primary py-1 text-center text-primary-foreground">DIE</span>
            <span className="flex-1 border border-ink bg-success py-1 text-center text-white">DAS</span>
          </div>
          <div className={cn(chip, "text-secondary-foreground")}>★ COMBO MULTIPLIER!</div>
        </div>
      );
    case "/zahlen":
      return (
        <div className={px}>
          <div className="border border-ink bg-ink px-3 py-1 font-mono text-xl font-bold tracking-widest text-secondary">€ 12,50</div>
          <div className="font-mono text-[11px] font-bold">» ZWÖLF EURO FÜNFZIG «</div>
        </div>
      );
    case "/satzbau":
      return (
        <div className={px}>
          <div className="flex items-center gap-1 font-mono text-xs font-bold">
            <span className="border border-ink bg-card px-2 py-1">Ich</span><span className="text-success">➔</span>
            <span className="border border-ink bg-secondary px-2 py-1">habe</span><span className="text-success">➔</span>
            <span className="border border-ink bg-card px-2 py-1">Hunger</span>
          </div>
          <span className="font-mono text-[11px] font-bold text-success">VERB AT POSITION 2 ✓</span>
        </div>
      );
    case "/verben":
      return (
        <div className={cn(px, "items-stretch justify-between")}>
          <div className="flex justify-between font-mono text-[11px] font-bold"><span>DU [GEHEN]...</span><span className="text-primary">GATE 03</span></div>
          <div className="flex items-center justify-between border-y border-ink/20 py-1 font-mono text-xs">
            <span className="font-bold">🏃 DASH</span>
            <span className="flex gap-1">
              <span className="border border-ink bg-success px-1.5 py-0.5 font-bold text-white">gehst ✓</span>
              <span className="border border-ink bg-accent px-1.5 py-0.5 line-through">geht</span>
            </span>
          </div>
          <span className="font-mono text-[11px] text-muted-foreground">TIMED CONJUGATION GATE</span>
        </div>
      );
    default:
      return (
        <div className={px}>
          <div className="flex gap-2 font-mono text-[11px]"><span className={chip}>🥖 2 Brötchen</span><span className={chip}>🍎 1 Kilo Äpfel</span></div>
          <div className="border border-ink bg-secondary px-2 py-0.5 font-mono text-[11px] font-bold text-secondary-foreground">» ICH HÄTTE GERNE... «</div>
        </div>
      );
  }
}

export function GameVault() {
  const [filter, setFilter] = useState<"all" | GameCategory>("all");
  const shown = GAMES.filter((g) => filter === "all" || g.category === filter);
  return (
    <section id="cartridges" className="flex flex-col gap-4">
      <div className="flex flex-col justify-between gap-3 border-b-[3px] border-ink pb-3 md:flex-row md:items-end">
        <div>
          <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-primary">{"// SELECT A GAME"}</span>
          <h2 className="text-2xl font-bold">Game Cartridge Vault</h2>
        </div>
        <RandomGameButton className="flex items-center gap-1 self-start border-2 border-ink bg-secondary px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider text-secondary-foreground arcade-shadow-sm transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 md:self-auto">
          🎲 Random game
        </RandomGameButton>
      </div>
      <div className="flex gap-2 overflow-x-auto py-1 font-mono text-xs">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={cn(
              "whitespace-nowrap border-2 border-ink px-3 py-1.5 font-bold uppercase transition-colors arcade-shadow-sm",
              filter === f.id ? "bg-primary text-primary-foreground" : "bg-accent hover:bg-secondary",
            )}
          >
            {f.label}
            {f.id === "all" && ` (${GAMES.length})`}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">
        {shown.map((g) => (
          <article key={g.href} className="flex flex-col justify-between border-[3px] border-ink bg-card arcade-shadow transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0_#1f1b17]">
            <div>
              <div className={cn("flex h-6 items-center justify-between border-b-[3px] border-ink px-3 font-mono text-[10px] font-bold", g.grip)}>
                <span>ROM #{g.stage}</span><span className="tracking-widest">GAME {g.stage}</span>
              </div>
              <div className="flex flex-col gap-3 p-4">
                <div className="flex items-center justify-between font-mono text-[10px] font-bold uppercase">
                  <span className="text-muted-foreground">{g.kicker}</span>
                  <span className="border border-ink bg-success px-1 text-white">[{g.level}]</span>
                </div>
                <h3 className="text-xl font-bold">{g.title}</h3>
                <Preview game={g} />
                <p className="text-sm text-muted-foreground">{g.blurb}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-col gap-3 border-t border-ink/10 p-4 pt-0">
              <div className="flex flex-wrap gap-1 pt-3 font-mono text-[10px]">
                {g.tags.map((t) => <span key={t} className="border border-ink bg-accent px-1">{t}</span>)}
              </div>
              <Link href={g.href} className="w-full border-2 border-ink bg-primary py-2 text-center font-mono text-sm font-bold uppercase text-primary-foreground arcade-shadow-sm transition-all hover:bg-primary/90 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none">
                ▶ Play game {g.stage}
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
