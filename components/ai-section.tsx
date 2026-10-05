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
    <section className="flex h-full flex-col border-[3px] border-ink bg-sidebar arcade-shadow">
      <div className="flex items-center justify-between border-b-[3px] border-ink bg-primary px-4 py-1 font-mono text-xs font-bold text-primary-foreground">
        <span className="flex items-center gap-2"><span className="arcade-blink">✨</span> AI TUTOR • BETA</span>
        <span className="border border-ink bg-ink px-2 py-0.5 text-[10px] text-background">SIGN-IN REQUIRED</span>
      </div>
      <div className="flex flex-1 flex-col justify-between gap-3 p-4">
        <div className="flex flex-col gap-3">
          <h2 className="text-2xl font-bold">Stuck? Ask &ldquo;Why?&rdquo;</h2>
          <p className="text-sm text-muted-foreground">
            A wrong answer shows a <b>✨ Why?</b> button. An AI tutor explains the rule behind the right answer in a few plain sentences. Games and
            scoring never depend on AI.
          </p>
          <ul className="flex flex-wrap gap-1.5">
            {GAMES.map(([name, href, what]) => (
              <li key={href}>
                <Link href={href} title={what} className="block border-2 border-ink bg-card px-2 py-0.5 font-mono text-[11px] font-bold uppercase hover:bg-accent">
                  {name}
                </Link>
              </li>
            ))}
          </ul>
          <div className="border-2 border-dashed border-ink bg-card px-3 py-1.5 text-sm">
            <div className="font-mono text-[10px] font-bold tracking-wider text-muted-foreground">EXAMPLE · TISCH, YOU PICKED <span className="text-primary">DIE ✗</span></div>
            <p className="text-muted-foreground">✨ &ldquo;Tisch is masculine: <i>der</i> Tisch. No reliable rule, so learn the article with the word.&rdquo;</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 border-[3px] border-ink bg-card p-3 arcade-shadow-sm">
          <div className="flex flex-col gap-1 text-sm">
            <p><b>Sign in with Google to use it.</b> Games stay playable without an account.</p>
            <p><b>{dailyLimit} free explanations per day.</b> Ones other players already asked for are free and don&apos;t count.</p>
            <p className="text-xs text-muted-foreground">
              Only the quiz item and your answer are sent to the AI, never your name or email.{" "}
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
