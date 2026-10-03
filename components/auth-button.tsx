"use client";
import Link from "next/link";
import { SessionProvider, signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

function AuthMenu() {
  const { data: session, status } = useSession();
  if (status === "loading") return <div className="h-8" />;
  if (!session?.user) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <Link href="/leaderboard" className="underline">Leaderboard</Link>
        <Button size="sm" variant="outline" onClick={() => signIn("google")}>
          Sign in
        </Button>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-3 text-sm">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {session.user.image && <img src={session.user.image} alt="" className="h-7 w-7 rounded-full" />}
      <Link href="/leaderboard" className="underline">Leaderboard</Link>
      <Link href="/profile" className="underline">Profile</Link>
      <button type="button" className="underline text-gray-600" onClick={() => signOut()}>
        Sign out
      </button>
    </div>
  );
}

// Session lives in a signed cookie; loading it client-side keeps every page statically rendered.
export function AuthHeader({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <header className="flex justify-end px-4 pt-3 min-h-11">
        <AuthMenu />
      </header>
      {children}
    </SessionProvider>
  );
}
