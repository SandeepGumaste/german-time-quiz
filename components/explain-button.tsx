"use client";
import { useState } from "react";
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
  const [state, setState] = useState<{ status: "idle" | "loading" | "error"; text?: string; error?: string }>({ status: "idle" });

  if (state.text) {
    return <p className="max-w-sm text-center text-sm">{state.text}</p>;
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
      setState({ status: "idle", text: data.text });
    } catch (e) {
      setState({ status: "error", error: e instanceof Error ? e.message : "Could not get an explanation." });
    }
  };
  return (
    <div className="flex flex-col items-center gap-1">
      <Button variant="outline" size="sm" onClick={ask} disabled={state.status === "loading"}>
        <Sparkles size={14} /> {state.status === "loading" ? "Thinking…" : "Why?"}
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
