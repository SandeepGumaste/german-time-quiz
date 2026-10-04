import Link from "next/link";
import { SITE } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-8 border-t-[3px] border-ink bg-sidebar">
      <div className="mx-auto flex w-full max-w-[1120px] flex-wrap items-center justify-between gap-3 px-4 py-4 font-mono text-xs uppercase lg:px-8">
        <span>© {new Date().getFullYear()} {SITE.name} · Free, non-commercial</span>
        <nav className="flex gap-4 font-bold">
          <Link href="/privacy" className="hover:underline">Privacy</Link>
          <Link href="/terms" className="hover:underline">Terms</Link>
          <a href={`mailto:${SITE.contactEmail}`} className="hover:underline">Contact</a>
        </nav>
      </div>
    </footer>
  );
}
