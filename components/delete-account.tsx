"use client";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function DeleteAccount() {
  const [status, setStatus] = useState<"idle" | "deleting" | "error">("idle");

  const remove = async () => {
    if (!window.confirm("Delete your account and all your stats? This cannot be undone.")) return;
    setStatus("deleting");
    try {
      const res = await fetch("/api/account", { method: "DELETE" });
      if (!res.ok) throw new Error();
      await signOut({ callbackUrl: "/" });
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="border-[3px] border-ink bg-card shadow-arcade rounded p-4 flex flex-col gap-2 text-sm">
      <p>Delete your account and every round, stat and streak stored about you. This is immediate and permanent.</p>
      <div className="flex items-center gap-3">
        <Button size="sm" variant="outline" onClick={remove} disabled={status === "deleting"}>Delete my account</Button>
        {status === "error" && <span className="text-primary">Could not delete. Try again.</span>}
      </div>
    </div>
  );
}
