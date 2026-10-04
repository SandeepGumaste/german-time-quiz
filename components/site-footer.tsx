import Link from "next/link";
import { SITE } from "@/lib/site";

export function SiteFooter() {
  return (
    <>
      {/* Spacer so the fixed footer never covers the end of the page. */}
      <div aria-hidden className="h-12" />
      <footer className="fixed inset-x-0 bottom-0 z-40 border-t-[3px] border-ink bg-sidebar">
        <div className="mx-auto flex h-12 w-full max-w-[1120px] items-center justify-between gap-3 px-4 font-mono text-xs uppercase lg:px-8">
          <span className="truncate">
            © {new Date().getFullYear()} {SITE.name}<span className="hidden sm:inline"> · Free, non-commercial</span>
          </span>
          <nav className="flex shrink-0 gap-4 font-bold">
            <Link href="/privacy" className="hover:underline">Privacy</Link>
            <Link href="/terms" className="hover:underline">Terms</Link>
            <a href={`mailto:${SITE.contactEmail}`} className="hover:underline">Contact</a>
          </nav>
        </div>
      </footer>
    </>
  );
}
