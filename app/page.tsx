import { maxCallsPerDay } from "@/lib/ai/limits";
import { AiSection } from "@/components/ai-section";
import { GameVault } from "@/components/game-vault";
import { RandomGameButton } from "@/components/random-game-button";

const btn = "flex items-center gap-2 border-[3px] border-ink px-4 py-2 font-mono text-sm font-bold uppercase tracking-wide arcade-shadow transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-[1120px] flex-col gap-8 px-4 pb-16 pt-4 lg:px-8">
      <section className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
        <div className="flex flex-col justify-between border-[3px] border-ink bg-card p-5 arcade-shadow lg:col-span-7 lg:p-6">
          <div className="flex flex-col gap-4">
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
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a href="#cartridges" className={`${btn} bg-primary text-primary-foreground`}>▶ Start playing now</a>
              <RandomGameButton className={`${btn} cursor-pointer bg-secondary text-secondary-foreground`}>🎲 Surprise me</RandomGameButton>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 border-t-2 border-ink pt-3 font-mono text-[11px] font-bold">
            <span className="flex items-center gap-1"><span className="size-1.5 bg-success" /> 6 PLAYABLE GAMES</span>
            <span>•</span>
            <span>VOICE RECOGNITION</span>
            <span>•</span>
            <span className="border border-ink bg-success-soft px-1 text-success">100% FREE</span>
          </div>
        </div>

        <div className="flex flex-col justify-between border-[3px] border-ink bg-accent p-4 arcade-shadow lg:col-span-5">
          <div className="flex items-center justify-between border-[3px] border-ink bg-ink p-2 arcade-shadow-sm">
            <div className="flex gap-1.5">
              <span className="size-2.5 border border-background bg-primary" />
              <span className="size-2.5 border border-background bg-secondary" />
            </div>
            <span className="font-mono text-sm font-bold uppercase tracking-widest text-background">German Games</span>
            <span className="font-mono text-[10px] font-bold tracking-widest text-secondary">256-KB ROM</span>
          </div>
          <div className="relative my-3 flex min-h-[260px] flex-col justify-between overflow-hidden border-[3px] border-ink bg-ink p-3 text-background">
            <div className="pointer-events-none absolute -right-8 -top-8 size-32 rotate-45 bg-background/5" />
            <div className="flex items-center justify-between border-b border-background/20 pb-1 font-mono text-[10px] font-bold">
              <span className="text-success-soft">GAME 01 READY</span>
              <span className="arcade-blink text-secondary">● INSERT COIN</span>
            </div>
            <div className="flex flex-col items-center gap-2 py-3 text-center">
              <div className="border border-primary bg-primary/20 px-3 py-1 font-mono text-lg font-bold tracking-wider text-[#ffb3ad]">» DER • DIE • DAS «</div>
              <div className="font-mono text-xs font-bold uppercase tracking-widest text-[#e2d8d1]">Press start // Hallo Welt</div>
              <div className="mt-1 grid w-full max-w-[280px] grid-cols-2 gap-1.5 font-mono text-[10px] font-bold">
                <div className="truncate border border-background/30 p-1 text-secondary">[€12,50 PREIS]</div>
                <div className="truncate border border-background/30 p-1 text-success-soft">[14:30 HALB DREI]</div>
                <div className="truncate border border-background/30 p-1 text-[#ffb3ad]">[ICH HÄTTE GERNE]</div>
                <div className="truncate border border-background/30 p-1">[VERB RUNNER]</div>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-background/20 pt-1 font-mono text-[10px] font-bold text-[#e2d8d1]">
              <span>FPS: 60</span><span>AUDIO: OK</span><span className="text-success-soft">MIC: ONLINE</span>
            </div>
          </div>
          <div className="flex items-center justify-between border-[3px] border-ink bg-muted p-2">
            <div className="flex items-center gap-2">
              <div className="relative flex size-10 items-center justify-center border-2 border-ink bg-[#e2d8d1]">
                <div className="size-3.5 bg-ink" />
                <div className="absolute -top-2 size-4 border-2 border-ink bg-primary" />
              </div>
              <span className="font-mono text-[10px] font-bold uppercase">Joystick</span>
            </div>
            <div className="flex items-center gap-2">
              {[["A", "bg-primary"], ["B", "bg-secondary"], ["C", "bg-success"]].map(([l, c]) => (
                <div key={l} className="flex flex-col items-center">
                  <span className={`size-7 border-2 border-ink arcade-shadow-sm ${c}`} />
                  <span className="mt-0.5 font-mono text-[10px] font-bold text-muted-foreground">{l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <AiSection dailyLimit={maxCallsPerDay()} />

      <GameVault />
    </main>
  );
}
