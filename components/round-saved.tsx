"use client";
import { useSession } from "next-auth/react";
import type { ReportResult } from "@/lib/report-round";

// One line on a results screen: sign-in nudge for guests, streak and new bests for signed-in players.
export function RoundSaved({ saved }: { saved: ReportResult }) {
  const { status } = useSession();
  if (status === "unauthenticated") {
    return <div className="text-sm text-muted-foreground">Sign in (top right) to save your progress.</div>;
  }
  if (!saved) return null;
  return (
    <div className="text-sm text-center">
      <div className="text-success font-semibold">Saved ✓ · 🔥 {saved.streak.current}-day streak</div>
      {saved.newBests.length > 0 && <div className="text-secondary-foreground font-bold">New personal best!</div>}
    </div>
  );
}
