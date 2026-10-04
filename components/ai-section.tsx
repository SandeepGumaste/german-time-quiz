"use client";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";

const btn = "flex items-center gap-2 border-[3px] border-ink px-4 py-2 font-mono text-sm font-bold uppercase tracking-wide arcade-shadow transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none";

const GAMES: [string, string, string][] = [
  ["German Time", "/time", "How a time is said, formal and informal."],
  ["Der / Die / Das", "/artikel", "Why that article is right, with a rule or memory trick."],
  ["Zahlen & Preise", "/zahlen", "How a number, price, date or year is built."],
  ["Verb Runner", "/verben", "Why a verb form fits, from the misses on your Game over screen."],
  ["Satzbau", "/satzbau", "Why the words go in that order."],
  ["Der Laden", "/laden", "Why the articles and plurals look the way they do."],
];

export function AiSection({ dailyLimit }: { dailyLimit: number }) {
  const { data: session, status } = useSession();
  const signedIn = !!session?.user;
  return (
    <section className="relative border-[3px] border-ink bg-sidebar arcade-shadow">
      <div className="flex items-center justify-between border-b-[3px] border-ink bg-primary px-4 py-1 font-mono text-xs font-bold text-primary-foreground">
        <span className="flex items-center gap-2"><span className="arcade-blink">✨</span> AI TUTOR • BETA</span>
        <span className="border border-ink bg-ink px-2 py-0.5 text-[10px] text-background">SIGN-IN REQUIRED</span>
      </div>
      <div className="grid grid-cols-1 gap-6 p-4 lg:grid-cols-12 lg:p-6">
        <div className="flex flex-col gap-3 lg:col-span-7">
          <h2 className="text-2xl font-bold">Stuck? Ask &ldquo;Why?&rdquo;</h2>
          <p className="text-muted-foreground">
            Get a wrong answer and a short <b>✨ Why?</b> button appears. It asks an AI tutor to explain the rule behind the right answer in a few plain
            sentences, so you learn the pattern and not just the word. The games themselves, the scoring and the correct answers never depend on AI.
          </p>
          <ul className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
            {GAMES.map(([name, href, what]) => (
              <li key={href} className="border-2 border-ink bg-card px-3 py-2">
                <Link href={href} className="font-mono font-bold uppercase underline">{name}</Link>
                <span className="text-muted-foreground"> · {what}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col justify-between gap-4 border-[3px] border-ink bg-card p-4 arcade-shadow-sm lg:col-span-5">
          <div className="flex flex-col gap-2 text-sm">
            <div className="font-mono text-xs font-bold uppercase text-primary">Good to know</div>
            <p><b>Sign in with Google to use it.</b> Everyone can play every game without an account, but the AI tutor is for signed-in players.</p>
            <p>
              You get <b>{dailyLimit} free AI explanations per day</b>. Explanations other players already asked for are saved, so they don&apos;t count against your {dailyLimit}.
            </p>
            <p className="text-muted-foreground">
              Only the quiz item (a word, verb form or sentence) and your answer are sent to the AI, never your name or email.{" "}
              <Link href="/privacy" className="underline">Privacy details</Link>
            </p>
          </div>
          {signedIn ? (
            <div className="border-2 border-ink bg-success-soft px-3 py-2 font-mono text-xs font-bold text-success">✓ You&apos;re signed in. Look for ✨ Why? after a miss.</div>
          ) : (
            <button type="button" disabled={status === "loading"} onClick={() => signIn("google")} className={`${btn} cursor-pointer justify-center bg-primary text-primary-foreground`}>
              Sign in with Google
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
