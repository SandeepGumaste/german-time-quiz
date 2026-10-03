"use client";
import { useRouter } from "next/navigation";
import { GAMES } from "@/lib/home-games";

export function RandomGameButton({ className, children }: { className?: string; children: React.ReactNode }) {
  const router = useRouter();
  return (
    <button
      type="button"
      className={className}
      onClick={() => router.push(GAMES[Math.floor(Math.random() * GAMES.length)].href)}
    >
      {children}
    </button>
  );
}
