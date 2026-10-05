"use client";
import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { ExplainRequest } from "@/lib/ai/explain";

type Props = { request: ExplainRequest };

// Asks the server for a short AI explanation of a missed answer. Remount it (via `key`) for each new question.
export function ExplainButton({ request }: Props) {
  const { data: session, status: authStatus } = useSession();
  const [signInOpen, setSignInOpen] = useState(false);
  const [state, setState] = useState<{ status: "idle" | "loading" | "error"; text?: string; error?: string; free?: boolean }>({ status: "idle" });
  const [free, setFree] = useState(false); // another player already asked, so this one costs nothing

  useEffect(() => {
    let cancelled = false;
    fetch("/api/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...request, peek: true }),
    })
      .then((r) => r.json())
      .then((d) => !cancelled && setFree(d.cached === true))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // The button is remounted per question, so the request is fixed for its lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (state.text) {
    return (
      <div className="flex max-w-sm flex-col items-center gap-1 text-center">
        <p className="text-sm">{state.text}</p>
        {state.free && (
          <span className="border border-ink bg-success-soft px-1.5 font-mono text-[10px] font-bold uppercase text-success">
            Free AI explanation · not counted against your daily limit
          </span>
        )}
      </div>
    );
  }
  const ask = async () => {
    if (authStatus !== "loading" && !session?.user) {
      setSignInOpen(true);
      return;
    }
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.text) throw new Error(data.error ?? "Could not get an explanation.");
      setState({ status: "idle", text: data.text, free: data.cached === true });
    } catch (e) {
      setState({ status: "error", error: e instanceof Error ? e.message : "Could not get an explanation." });
    }
  };
  return (
    <div className="flex flex-col items-center gap-1">
      <Button variant="outline" size="sm" onClick={ask} disabled={state.status === "loading"}>
        <Sparkles size={14} /> {state.status === "loading" ? "Thinking…" : "Why?"}
        {free && state.status !== "loading" && (
          <span className="border border-ink bg-success px-1 font-mono text-[10px] font-bold uppercase text-white">Free</span>
        )}
      </Button>
      {state.status === "error" && <span className="text-sm text-primary">{state.error}</span>}
      <Dialog open={signInOpen} onOpenChange={setSignInOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Sign in to use AI features</DialogTitle>
            <DialogDescription>
              AI explanations are free for signed-in players. Sign in with Google to see why an answer is right.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSignInOpen(false)}>Not now</Button>
            <Button onClick={() => signIn("google")}>Sign in with Google</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
