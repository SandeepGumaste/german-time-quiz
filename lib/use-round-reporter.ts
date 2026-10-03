"use client";
import { useEffect, useRef, useState } from "react";
import { reportRound, type ReportResult } from "@/lib/report-round";
import type { RoundInput } from "@/lib/tracking/types";

type Phase = "idle" | "playing" | "finished";

// Reports one round to the server when `phase` becomes "finished". Duration is measured from when it became "playing".
// Returns the server's reply (streak, new bests) for the results screen; null for guests or on failure.
export function useRoundReporter(phase: Phase, build: () => Omit<RoundInput, "tz" | "durationSec">): ReportResult {
  const startedAt = useRef<number | null>(null);
  const sent = useRef(false);
  const [saved, setSaved] = useState<ReportResult>(null);

  useEffect(() => {
    if (phase === "playing") {
      if (startedAt.current === null) startedAt.current = Date.now();
      sent.current = false;
      return;
    }
    if (phase !== "finished" || sent.current || startedAt.current === null) return;
    sent.current = true;
    const durationSec = Math.min(3600, (Date.now() - startedAt.current) / 1000);
    startedAt.current = null;
    const round = build();
    if (round.total > 0) reportRound({ ...round, durationSec }).then(setSaved);
  }, [phase, build]);

  // A new round starts from a clean slate (state adjusted during render, as React recommends).
  const [prevPhase, setPrevPhase] = useState(phase);
  if (phase !== prevPhase) {
    setPrevPhase(phase);
    if (phase === "playing") setSaved(null);
  }

  return saved;
}
