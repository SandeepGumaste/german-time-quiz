import type { Streak } from "./types";

// YYYY-MM-DD for `date` in the given IANA timezone; an unknown timezone falls back to UTC.
export function dayInTz(date: Date, tz: string): string {
  try {
    return new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(date);
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

const dayNumber = (day: string) => Math.floor(Date.UTC(+day.slice(0, 4), +day.slice(5, 7) - 1, +day.slice(8, 10)) / 86_400_000);

export function nextStreak(prev: Streak | undefined, now: Date, tz: string): Streak {
  const today = dayInTz(now, tz);
  if (!prev) return { current: 1, best: 1, lastDay: today };
  const gap = dayNumber(today) - dayNumber(prev.lastDay);
  const current = gap === 1 ? prev.current + 1 : gap === 0 ? prev.current : 1;
  return { current, best: Math.max(prev.best, current), lastDay: gap < 0 ? prev.lastDay : today };
}
