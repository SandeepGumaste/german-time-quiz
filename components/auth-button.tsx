"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { SessionProvider, signIn, signOut, useSession } from "next-auth/react";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";

const navLink = "font-mono text-xs font-bold uppercase hover:underline";
const menuItem = "block w-full px-3 py-2 text-left font-mono text-xs font-bold uppercase hover:bg-accent focus-visible:bg-accent focus-visible:outline-none";

// Profile icon with a dropdown. It opens on hover (mouse) or click/tap, and closes on Escape or an outside click.
// From md up the leaderboard link sits in the header, so the dropdown only lists it on small screens.
function ProfileMenu({ name, image }: { name?: string | null; image?: string | null }) {
  const [open, setOpen] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);
  const pointer = useRef<string>("mouse");

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => !wrapper.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const initial = (name ?? "?").trim().charAt(0).toUpperCase() || "?";
  return (
    <div
      ref={wrapper}
      className="relative"
      onPointerEnter={(e) => {
        pointer.current = e.pointerType;
        if (e.pointerType === "mouse") setOpen(true);
      }}
      onPointerLeave={(e) => e.pointerType === "mouse" && setOpen(false)}
    >
      <button
        type="button"
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        // A click on a mouse keeps the hover-opened menu open; touch and keyboard toggle it.
        onClick={() => setOpen((o) => (pointer.current === "mouse" ? true : !o))}
        onKeyDown={() => (pointer.current = "keyboard")}
        className="flex size-9 items-center justify-center overflow-hidden rounded border-2 border-ink bg-secondary font-mono text-sm font-bold text-secondary-foreground arcade-shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {image ? <img src={image} alt="" className="size-full object-cover" /> : initial}
      </button>
      {open && (
        // pt-1 (not a margin) keeps the hover area unbroken between the icon and the menu.
        <div className="absolute right-0 top-full z-50 w-44 pt-1">
          <div role="menu" className="border-[3px] border-ink bg-card shadow-arcade-sm">
            {name && <div className="truncate border-b-2 border-ink px-3 py-2 text-xs text-muted-foreground">{name}</div>}
            <Link role="menuitem" href="/leaderboard" className={`${menuItem} md:hidden`} onClick={() => setOpen(false)}>Leaderboard</Link>
            <Link role="menuitem" href="/profile" className={menuItem} onClick={() => setOpen(false)}>Profile</Link>
            <button role="menuitem" type="button" className={`${menuItem} border-t-2 border-ink text-primary`} onClick={() => signOut()}>
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AuthMenu() {
  const { data: session, status } = useSession();
  if (status === "loading") return <div className="h-9" />;
  if (!session?.user) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <Link href="/leaderboard" className={navLink}>Leaderboard</Link>
        <Button size="sm" variant="outline" onClick={() => signIn("google")}>
          Sign in
        </Button>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-4 text-sm">
      <Link href="/leaderboard" className={`${navLink} hidden md:inline`}>Leaderboard</Link>
      <ProfileMenu name={session.user.name} image={session.user.image} />
    </div>
  );
}

// Session lives in a signed cookie; loading it client-side keeps every page statically rendered.
export function AuthHeader({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <header className="sticky top-0 z-40 border-b-[3px] border-ink bg-sidebar">
        <div className="mx-auto flex min-h-14 w-full max-w-[1120px] items-center justify-between gap-3 px-4 lg:px-8">
          <Link href="/" className="flex items-center gap-2 font-mono font-bold uppercase tracking-tight">
            <span className="border-2 border-ink bg-primary px-1.5 text-primary-foreground arcade-shadow-sm">16B</span>
            <span className="hidden sm:inline">German Games</span>
          </Link>
          <AuthMenu />
        </div>
      </header>
      {children}
      <SiteFooter />
    </SessionProvider>
  );
}
