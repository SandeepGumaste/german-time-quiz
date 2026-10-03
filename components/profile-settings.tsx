"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ProfileSettings({ displayName, leaderboard }: { displayName: string; leaderboard: boolean }) {
  const [name, setName] = useState(displayName);
  const [onBoard, setOnBoard] = useState(leaderboard);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const save = async () => {
    setStatus("saving");
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: name, leaderboard: onBoard }),
      });
      setStatus(res.ok ? "saved" : "error");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="border-[3px] border-ink bg-card shadow-arcade rounded p-4 flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm">
        Display name (2–24 characters)
        <input
          className="border-2 border-ink bg-card rounded px-3 py-2 text-base"
          value={name}
          maxLength={24}
          onChange={(e) => { setName(e.target.value); setStatus("idle"); }}
        />
      </label>
      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          className="mt-1"
          checked={onBoard}
          onChange={(e) => { setOnBoard(e.target.checked); setStatus("idle"); }}
        />
        <span>Show me on the public leaderboard. Only your display name and best scores are shown, never your Google name or email.</span>
      </label>
      <div className="flex items-center gap-3">
        <Button size="sm" onClick={save} disabled={status === "saving"}>Save</Button>
        {status === "saved" && <span className="text-sm text-success">Saved ✓</span>}
        {status === "error" && <span className="text-sm text-primary">Could not save. Check the name and try again.</span>}
      </div>
    </div>
  );
}
