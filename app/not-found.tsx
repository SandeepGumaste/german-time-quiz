import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-16 text-center">
      <h1 className="font-mono text-5xl font-bold">404</h1>
      <p>Diese Seite gibt es nicht. This page doesn&apos;t exist.</p>
      <Button asChild><Link href="/">Back to the games</Link></Button>
    </main>
  );
}
