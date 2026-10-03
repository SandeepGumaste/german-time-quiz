import Link from "next/link";
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

      <section className="relative border-[3px] border-ink bg-sidebar arcade-shadow">
        <div className="flex items-center justify-between border-b-[3px] border-ink bg-primary px-4 py-1 font-mono text-xs font-bold text-primary-foreground">
          <span className="flex items-center gap-2"><span className="arcade-blink">★</span> FEATURED GAME • 01</span>
          <span className="border border-ink bg-ink px-2 py-0.5 text-[10px] text-background">UHRZEIT MEISTER</span>
        </div>
        <div className="grid grid-cols-1 items-center gap-6 p-4 lg:grid-cols-12 lg:p-6">
          <div className="flex flex-col items-center gap-3 border-[3px] border-ink bg-card p-4 text-center arcade-shadow-sm lg:col-span-5">
            <div className="flex w-full items-center justify-between border-b border-ink/20 pb-1 font-mono text-[10px] font-bold text-muted-foreground">
              <span>ANALOG READOUT</span>
              <span className="border border-ink bg-success px-1 text-white">🎤 VOICE READY</span>
            </div>
            <div className="relative my-1 flex size-36 items-center justify-center border-[3px] border-ink bg-muted font-mono text-[10px] font-bold">
              <span className="absolute top-1">12</span><span className="absolute bottom-1">6</span>
              <span className="absolute left-1.5">9</span><span className="absolute right-1.5">3</span>
              <div className="absolute h-9 w-2 origin-bottom -translate-y-[16px] -rotate-45 border border-ink bg-primary" />
              <div className="absolute h-14 w-2 origin-top translate-y-[2px] bg-ink" />
              <div className="z-10 size-4 border-2 border-ink bg-secondary" />
            </div>
            <div className="flex w-full flex-col items-center gap-1 border-2 border-ink bg-accent p-2">
              <div className="font-mono text-lg font-bold tracking-wide text-primary">14:30 » HALB DREI «</div>
              <div className="flex h-4 items-center gap-1">
                {[["h-2", "bg-primary"], ["h-4", "bg-primary"], ["h-3", "bg-secondary"], ["h-4", "bg-success"], ["h-2", "bg-primary"], ["h-3", "bg-secondary"], ["h-4", "bg-primary"]].map(([h, c], i) => (
                  <span key={i} className={`w-1.5 ${h} ${c}`} />
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3 lg:col-span-7">
            <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] font-bold">
              <span className="border border-ink bg-success px-2 py-0.5 text-white">[A1-A2]</span>
              <span className="border border-ink bg-accent px-2 py-0.5">[SPEAKING]</span>
              <span className="border border-ink bg-secondary px-2 py-0.5 text-secondary-foreground">[COMBO]</span>
            </div>
            <h2 className="text-2xl font-bold">German Time (Die Uhrzeit)</h2>
            <p className="text-muted-foreground">Say the time in German by voice. Uses your browser&apos;s speech recognition, so pick a Chromium-based browser for the best results.</p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link href="/time" className={`${btn} bg-primary text-primary-foreground`}>🎤 ▶ Play German Time</Link>
              <span className="font-mono text-[10px] text-muted-foreground">Mic permission is requested when you start</span>
            </div>
          </div>
        </div>
      </section>

      <GameVault />
    </main>
  );
}
