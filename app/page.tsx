import { maxCallsPerDay } from "@/lib/ai/limits";
import { AiSection } from "@/components/ai-section";
import { GameVault } from "@/components/game-vault";
import { RandomGameButton } from "@/components/random-game-button";

const btn = "flex items-center gap-2 border-[3px] border-ink px-4 py-2 font-mono text-sm font-bold uppercase tracking-wide arcade-shadow transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none";

const STEPS: [string, string, string][] = [
  ["1", "Pick a game", "Six short games, A1 to B1."],
  ["2", "Play & earn XP", "Build streaks and level up."],
  ["3", "Sign in to track", "Stats, ranks and AI tutor."],
];

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-[1120px] flex-col gap-8 px-4 pb-16 pt-4 lg:px-8">
      <section className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
        <div className="flex flex-col justify-between border-[3px] border-ink bg-card p-5 arcade-shadow lg:col-span-7 lg:p-6">
          <div className="flex flex-1 flex-col justify-between gap-4">
            <div className="inline-flex items-center gap-2 self-start border-2 border-ink bg-accent px-3 py-1 font-mono text-xs font-bold tracking-wider">
              <span className="text-primary">★</span> 16-BIT DEUTSCH ARCADE CAB
              <span className="bg-primary px-1 text-[10px] text-primary-foreground">SYSTEM #01</span>
            </div>
            <h1 className="text-4xl font-bold leading-none lg:text-5xl">
              Play your way
              <br />
              <span className="my-1 inline-block -rotate-1 border-2 border-ink bg-primary px-2 text-primary-foreground arcade-shadow-sm">to German.</span>
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              Short, playful games for practicing German vocabulary, grammar, numbers, speaking, and everyday situations. No boring flashcards. Just pure arcade muscle memory.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <a href="#cartridges" className={`${btn} bg-primary text-primary-foreground`}>▶ Start playing now</a>
              <RandomGameButton className={`${btn} cursor-pointer bg-secondary text-secondary-foreground`}>🎲 Surprise me</RandomGameButton>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {STEPS.map(([n, title, text]) => (
                <div key={n} className="border-2 border-ink bg-accent px-2.5 py-1.5">
                  <div className="font-mono text-[10px] font-bold text-primary">STEP {n}</div>
                  <div className="font-mono text-xs font-bold uppercase">{title}</div>
                  <p className="text-xs text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 border-t-2 border-ink pt-3 font-mono text-[11px] font-bold">
            <span className="flex items-center gap-1"><span className="size-1.5 bg-success" /> 6 PLAYABLE GAMES</span>
            <span>•</span>
            <span>VOICE RECOGNITION</span>
            <span>•</span>
            <span className="border border-ink bg-success-soft px-1 text-success">100% FREE</span>
          </div>
        </div>

        <div className="lg:col-span-5">
          <AiSection dailyLimit={maxCallsPerDay()} />
        </div>
      </section>

      <GameVault />
    </main>
  );
}
