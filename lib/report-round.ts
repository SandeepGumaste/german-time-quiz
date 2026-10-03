import type { RoundInput } from "@/lib/tracking/types";

export type ReportResult = { streak: { current: number; best: number }; newBests: string[] } | null;

// Fire-and-forget: guests get a 401 and nothing is saved; failures never affect gameplay.
export async function reportRound(round: Omit<RoundInput, "tz">): Promise<ReportResult> {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const res = await fetch("/api/rounds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...round, tz }),
      keepalive: true,
    });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}
