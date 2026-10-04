"use client";
import Link from "next/link";
import { SessionProvider, signIn, signOut, useSession } from "next-auth/react";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";

function AuthMenu() {
  const { data: session, status } = useSession();
  if (status === "loading") return <div className="h-8" />;
  if (!session?.user) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <Link href="/leaderboard" className="font-mono text-xs font-bold uppercase hover:underline">Leaderboard</Link>
        <Button size="sm" variant="outline" onClick={() => signIn("google")}>
          Sign in
        </Button>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-3 text-sm">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {session.user.image && <img src={session.user.image} alt="" className="h-7 w-7 rounded border-2 border-ink" />}
      <Link href="/leaderboard" className="font-mono text-xs font-bold uppercase hover:underline">Leaderboard</Link>
      <Link href="/profile" className="font-mono text-xs font-bold uppercase hover:underline">Profile</Link>
      <button type="button" className="font-mono text-xs font-bold uppercase text-muted-foreground hover:underline" onClick={() => signOut()}>
        Sign out
      </button>
    </div>
  );
}

// Session lives in a signed cookie; loading it client-side keeps every page statically rendered.
export function AuthHeader({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <header className="sticky top-0 z-40 border-b-[3px] border-ink bg-sidebar">
        <div className="mx-auto flex min-h-14 w-full max-w-[1120px] items-center justify-between gap-3 px-4 lg:px-8">
          <Link href="/" className="flex items-center gap-2 font-mono font-bold uppercase tracking-tight">
            <span className="border-2 border-ink bg-primary px-1.5 text-primary-foreground arcade-shadow-sm">16B</span>
            <span className="hidden sm:inline">German Games</span>
          </Link>
          <AuthMenu />
        </div>
      </header>
      {children}
      <SiteFooter />
    </SessionProvider>
  );
}
