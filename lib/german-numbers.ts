import { shuffle } from "./artikel-game";

export type RoundType = "small" | "tens" | "large" | "price" | "date" | "year";

export type NumberQuestion = {
  type: RoundType;
  reverse: boolean; // false: digits shown, pick the German; true: German shown, pick the digits
  prompt: string; // what is shown big
  ask: string; // the question line
  answer: string;
  choices: string[];
  solution: string; // "47 = siebenundvierzig", shown after answering
};

// Difficulty ladder: each level adds one round type.
export const LEVEL_TYPES: RoundType[] = ["small", "tens", "large", "price", "date", "year"];
export const CORRECT_PER_LEVEL = 6;
export const MAX_LEVEL = LEVEL_TYPES.length;

export const levelFor = (correct: number) => Math.min(MAX_LEVEL, 1 + Math.floor(correct / CORRECT_PER_LEVEL));

// ---------- German words ----------

const SMALL = [
  "null", "eins", "zwei", "drei", "vier", "fünf", "sechs", "sieben", "acht", "neun", "zehn",
  "elf", "zwölf", "dreizehn", "vierzehn", "fünfzehn", "sechzehn", "siebzehn", "achtzehn", "neunzehn",
];
const TENS = ["", "", "zwanzig", "dreißig", "vierzig", "fünfzig", "sechzig", "siebzig", "achtzig", "neunzig"];

function under100(n: number): string {
  if (n < 20) return SMALL[n];
  const t = Math.floor(n / 10);
  const u = n % 10;
  return u === 0 ? TENS[t] : `${u === 1 ? "ein" : SMALL[u]}und${TENS[t]}`;
}

function under1000(n: number): string {
  const h = Math.floor(n / 100);
  const r = n % 100;
  if (h === 0) return under100(r);
  return `${h === 1 ? "ein" : SMALL[h]}hundert${r > 0 ? under100(r) : ""}`;
}

export function toGerman(n: number): string {
  if (n < 1000) return under1000(n);
  const t = Math.floor(n / 1000);
  const r = n % 1000;
  return `${t === 1 ? "ein" : under1000(t)}tausend${r > 0 ? under1000(r) : ""}`;
}

// "ein" before a unit noun (ein Euro), plain cardinal otherwise.
const cardinalBeforeNoun = (n: number) => (n === 1 ? "ein" : toGerman(n));

export const priceToGerman = (e: number, c: number) =>
  `${cardinalBeforeNoun(e)} Euro${c > 0 ? ` ${toGerman(c)}` : ""}`;

export const priceToDigits = (e: number, c: number) => `€${e},${String(c).padStart(2, "0")}`;

const ORDINAL_SPECIAL: Record<number, string> = { 1: "erste", 3: "dritte", 7: "siebte", 8: "achte" };
const MONTHS = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];

function ordinal(n: number): string {
  if (ORDINAL_SPECIAL[n]) return ORDINAL_SPECIAL[n];
  return n < 20 ? `${SMALL[n]}te` : `${under100(n)}ste`;
}

export const dateToGerman = (d: number, m: number) => `der ${ordinal(d)} ${MONTHS[m - 1]}`;
export const dateToDigits = (d: number, m: number) => `${String(d).padStart(2, "0")}.${String(m).padStart(2, "0")}.`;

export function yearToGerman(y: number): string {
  if (y >= 2000) return `zweitausend${y > 2000 ? under100(y - 2000) : ""}`;
  const h = Math.floor(y / 100);
  const r = y % 100;
  return `${under100(h)}hundert${r > 0 ? under100(r) : ""}`;
}

// ---------- Question building ----------

const rand = (lo: number, hi: number) => lo + Math.floor(Math.random() * (hi - lo + 1));
const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
const fmtInt = (n: number) => n.toLocaleString("de-DE");

// Collect up to 3 distinct wrong options from candidate generators, topping up with `fallback`.
function distractors<T>(
  correct: T,
  key: (v: T) => string,
  valid: (v: T) => boolean,
  candidates: T[],
  fallback: () => T
): T[] {
  const seen = new Set([key(correct)]);
  const out: T[] = [];
  for (const c of shuffle(candidates)) {
    if (out.length === 3) break;
    if (valid(c) && !seen.has(key(c))) {
      seen.add(key(c));
      out.push(c);
    }
  }
  for (let i = 0; out.length < 3 && i < 200; i++) {
    const c = fallback();
    if (valid(c) && !seen.has(key(c))) {
      seen.add(key(c));
      out.push(c);
    }
  }
  return out;
}

const swapDigits = (n: number) => {
  const s = String(n);
  if (s.length < 2) return n;
  const i = rand(0, s.length - 2);
  const a = s.split("");
  [a[i], a[i + 1]] = [a[i + 1], a[i]];
  return Number(a.join(""));
};

type Built<T> = { value: T; german: string; digits: string };

function assemble<T>(
  type: RoundType,
  reverse: boolean,
  askForward: string,
  askReverse: string,
  correct: Built<T>,
  wrong: Built<T>[]
): NumberQuestion {
  const show = reverse ? correct.german : correct.digits;
  const answer = reverse ? correct.digits : correct.german;
  const choices = shuffle([correct, ...wrong]).map((b) => (reverse ? b.digits : b.german));
  return {
    type,
    reverse,
    prompt: show,
    ask: reverse ? askReverse : askForward,
    answer,
    choices,
    solution: `${correct.digits} = ${correct.german}`,
  };
}

function numberQuestion(type: RoundType, reverse: boolean): NumberQuestion {
  const [lo, hi] = type === "small" ? [0, 20] : type === "tens" ? [21, 100] : [101, 9999];
  const n = rand(lo, hi);
  const cands = [swapDigits(n), n + 1, n - 1, n + 10, n - 10, n + 2, n - 2, n + 100, n - 100];
  if (n >= 13 && n <= 19) cands.push((n - 10) * 10); // dreizehn vs dreißig
  if (n >= 30 && n % 10 === 0 && n <= 90) cands.push(n / 10 + 10);
  const wrong = distractors(n, String, (v) => v >= lo && v <= hi, cands, () => rand(lo, hi));
  const build = (v: number): Built<number> => ({ value: v, german: toGerman(v), digits: fmtInt(v) });
  return assemble(type, reverse, "Wie sagt man das auf Deutsch?", "Welche Zahl ist das?", build(n), wrong.map(build));
}

type Price = { e: number; c: number };
const CENTS = [0, 5, 10, 15, 20, 25, 30, 40, 45, 50, 60, 75, 80, 90, 95, 99];

function priceQuestion(reverse: boolean): NumberQuestion {
  const p: Price = { e: rand(1, 99), c: pick(CENTS) };
  const cands: Price[] = [
    { e: p.c || 1, c: p.e }, // swap euro and cent
    { e: p.e + 1, c: p.c }, { e: p.e - 1, c: p.c }, { e: p.e + 10, c: p.c }, { e: p.e - 10, c: p.c },
    { e: swapDigits(p.e), c: p.c },
    { e: p.e, c: pick(CENTS) }, { e: p.e, c: pick(CENTS) }, { e: p.e, c: p.c + 10 }, { e: p.e, c: p.c - 10 },
  ];
  const wrong = distractors(
    p,
    (v) => `${v.e},${v.c}`,
    (v) => v.e >= 1 && v.e <= 99 && v.c >= 0 && v.c <= 99 && CENTS.includes(v.c),
    cands,
    () => ({ e: rand(1, 99), c: pick(CENTS) })
  );
  const build = (v: Price): Built<Price> => ({ value: v, german: priceToGerman(v.e, v.c), digits: priceToDigits(v.e, v.c) });
  return assemble("price", reverse, "Wie viel kostet das?", "Wie viel ist das?", build(p), wrong.map(build));
}

type DateV = { d: number; m: number };

function dateQuestion(reverse: boolean): NumberQuestion {
  const v: DateV = { d: rand(1, 28), m: rand(1, 12) };
  const cands: DateV[] = [
    { d: v.d + 1, m: v.m }, { d: v.d - 1, m: v.m }, { d: v.d + 10, m: v.m }, { d: v.d - 10, m: v.m },
    { d: swapDigits(v.d), m: v.m }, { d: v.d, m: v.m + 1 }, { d: v.d, m: v.m - 1 },
    { d: v.m, m: v.d }, // day/month swapped (only valid when day <= 12)
  ];
  const wrong = distractors(
    v,
    (x) => `${x.d}.${x.m}`,
    (x) => x.d >= 1 && x.d <= 28 && x.m >= 1 && x.m <= 12,
    cands,
    () => ({ d: rand(1, 28), m: rand(1, 12) })
  );
  const build = (x: DateV): Built<DateV> => ({ value: x, german: dateToGerman(x.d, x.m), digits: dateToDigits(x.d, x.m) });
  return assemble("date", reverse, "Welches Datum ist das?", "Welches Datum ist das?", build(v), wrong.map(build));
}

function yearQuestion(reverse: boolean): NumberQuestion {
  const y = rand(1950, 2030);
  const cands = [y + 1, y - 1, y + 10, y - 10, y + 100, y - 100, swapDigits(y), swapDigits(y), swapDigits(y)];
  const wrong = distractors(y, String, (v) => v >= 1900 && v <= 2099, cands, () => rand(1950, 2030));
  const build = (v: number): Built<number> => ({ value: v, german: yearToGerman(v), digits: String(v) });
  return assemble("year", reverse, "Welches Jahr ist das?", "Welches Jahr ist das?", build(y), wrong.map(build));
}

// Pick a round type from those unlocked at `level`, favouring the newest one.
export function nextQuestion(level: number): NumberQuestion {
  const unlocked = LEVEL_TYPES.slice(0, level);
  const type = level > 1 && Math.random() < 0.5 ? unlocked[unlocked.length - 1] : pick(unlocked);
  const reverse = level > 1 && Math.random() < 0.4; // level 1 stays pure digits -> German
  switch (type) {
    case "price": return priceQuestion(reverse);
    case "date": return dateQuestion(reverse);
    case "year": return yearQuestion(reverse);
    default: return numberQuestion(type, reverse);
  }
}

// Rebuilds the German words from the digits a question showed, so the AI route can trust them.
export function germanFor(type: RoundType, digits: string): string | null {
  const int = (re: RegExp) => (re.test(digits) ? Number(digits.replace(/\./g, "")) : NaN);
  switch (type) {
    case "small": { const n = int(/^\d{1,2}$/); return n >= 0 && n <= 20 ? toGerman(n) : null; }
    case "tens": { const n = int(/^\d{2,3}$/); return n >= 21 && n <= 100 ? toGerman(n) : null; }
    case "large": { const n = int(/^\d{1,3}(\.\d{3})?$|^\d{3,4}$/); return n >= 101 && n <= 9999 ? toGerman(n) : null; }
    case "year": { const n = int(/^\d{4}$/); return n >= 1900 && n <= 2099 ? yearToGerman(n) : null; }
    case "price": {
      const m = digits.match(/^€(\d{1,2}),(\d{2})$/);
      return m && Number(m[1]) >= 1 ? priceToGerman(Number(m[1]), Number(m[2])) : null;
    }
    case "date": {
      const m = digits.match(/^(\d{2})\.(\d{2})\.$/);
      return m && Number(m[1]) >= 1 && Number(m[1]) <= 31 && Number(m[2]) >= 1 && Number(m[2]) <= 12 ? dateToGerman(Number(m[1]), Number(m[2])) : null;
    }
    default: return null;
  }
}
