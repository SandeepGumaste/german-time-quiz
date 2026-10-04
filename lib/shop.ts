import { shuffle } from "./artikel-game";
import { toGerman } from "./german-numbers";
import type { Tile } from "@/components/tile-builder";

type Gender = "der" | "die" | "das";

export type ShopItem = {
  de: string;
  gender: Gender;
  plural: string | null; // null: only sold singly
  en: string;
  enPl: string;
  emoji: string;
  cents: number;
};

const ITEMS: ShopItem[] = [
  { de: "Apfel", gender: "der", plural: "Äpfel", en: "apple", enPl: "apples", emoji: "🍎", cents: 50 },
  { de: "Banane", gender: "die", plural: "Bananen", en: "banana", enPl: "bananas", emoji: "🍌", cents: 40 },
  { de: "Orange", gender: "die", plural: "Orangen", en: "orange", enPl: "oranges", emoji: "🍊", cents: 60 },
  { de: "Tomate", gender: "die", plural: "Tomaten", en: "tomato", enPl: "tomatoes", emoji: "🍅", cents: 30 },
  { de: "Kartoffel", gender: "die", plural: "Kartoffeln", en: "potato", enPl: "potatoes", emoji: "🥔", cents: 25 },
  { de: "Zitrone", gender: "die", plural: "Zitronen", en: "lemon", enPl: "lemons", emoji: "🍋", cents: 45 },
  { de: "Ei", gender: "das", plural: "Eier", en: "egg", enPl: "eggs", emoji: "🥚", cents: 35 },
  { de: "Brot", gender: "das", plural: "Brote", en: "bread", enPl: "loaves of bread", emoji: "🍞", cents: 220 },
  { de: "Brötchen", gender: "das", plural: "Brötchen", en: "bread roll", enPl: "bread rolls", emoji: "🥖", cents: 40 },
  { de: "Wurst", gender: "die", plural: "Würste", en: "sausage", enPl: "sausages", emoji: "🌭", cents: 150 },
  { de: "Kuchen", gender: "der", plural: "Kuchen", en: "cake", enPl: "cakes", emoji: "🍰", cents: 280 },
  { de: "Pizza", gender: "die", plural: "Pizzen", en: "pizza", enPl: "pizzas", emoji: "🍕", cents: 450 },
  { de: "Zeitung", gender: "die", plural: "Zeitungen", en: "newspaper", enPl: "newspapers", emoji: "📰", cents: 180 },
  { de: "Milch", gender: "die", plural: null, en: "milk", enPl: "milk", emoji: "🥛", cents: 110 },
  { de: "Käse", gender: "der", plural: null, en: "cheese", enPl: "cheese", emoji: "🧀", cents: 240 },
  { de: "Wasser", gender: "das", plural: null, en: "water", enPl: "water", emoji: "💧", cents: 90 },
  { de: "Eis", gender: "das", plural: null, en: "ice cream", enPl: "ice cream", emoji: "🍦", cents: 150 },
  { de: "Schokolade", gender: "die", plural: null, en: "chocolate", enPl: "chocolate", emoji: "🍫", cents: 130 },
  { de: "Saft", gender: "der", plural: "Säfte", en: "juice", enPl: "juices", emoji: "🧃", cents: 175 },
];

export const SHOP_LEVEL_NAMES = ["", "One item", "Several of one item", "Two items", "Three items"];
export const SHOP_LEVEL_TIPS = [
  "",
  "After \"ich möchte\", der-words change to \"einen\": einen Apfel, eine Milch, ein Brot.",
  "For more than one, use a number and the plural: zwei Äpfel, drei Bananen.",
  "Join two items with \"und\", and end politely with \"bitte\".",
  "With three items the comma replaces the first \"und\": einen Apfel, eine Milch und ein Brot.",
];
export const MAX_SHOP_LEVEL = 4;
export const CORRECT_PER_SHOP_LEVEL = 3;
export const shopLevelFor = (correct: number) =>
  Math.min(MAX_SHOP_LEVEL, 1 + Math.floor(correct / CORRECT_PER_SHOP_LEVEL));

export type OrderLine = { item: ShopItem; qty: number };

export type Order = {
  lines: OrderLine[];
  tiles: Tile[];
  variants: string[][]; // accepted word orders (item order is free)
  display: string; // the sentence, properly written
  notes: string[]; // article/plural reminders for each item
  totalCents: number;
};

const ACCUSATIVE: Record<Gender, string> = { der: "einen", die: "eine", das: "ein" };

const rand = (n: number) => Math.floor(Math.random() * n);
const pick = <T,>(a: T[]): T => a[rand(a.length)];

const phraseWords = ({ item, qty }: OrderLine): string[] =>
  qty === 1 ? [ACCUSATIVE[item.gender], item.de] : [toGerman(qty), item.plural!];

function permutations<T>(a: T[]): T[][] {
  if (a.length <= 1) return [a];
  return a.flatMap((x, i) => permutations([...a.slice(0, i), ...a.slice(i + 1)]).map((p) => [x, ...p]));
}

function joinWords(phrases: string[][]): string[] {
  const out: string[] = [];
  phrases.forEach((p, i) => {
    if (i > 0 && i === phrases.length - 1) out.push("und");
    out.push(...p);
  });
  return out;
}

export function formatPrice(cents: number): { digits: string; german: string } {
  const e = Math.floor(cents / 100);
  const c = cents % 100;
  const digits = `€${e},${String(c).padStart(2, "0")}`;
  if (e === 0) return { digits, german: `${toGerman(c)} Cent` };
  const euro = `${e === 1 ? "ein" : toGerman(e)} Euro`;
  return { digits, german: c > 0 ? `${euro} ${toGerman(c)}` : euro };
}

// The correct sentence and article/plural notes for an order; shared by the game and the AI explanation route.
export function describeOrder(lines: OrderLine[]) {
  const phrases = lines.map(phraseWords);
  // Display with commas: "A, B und C"
  const texts = phrases.map((p) => p.join(" "));
  const list = texts.length === 1 ? texts[0] : `${texts.slice(0, -1).join(", ")} und ${texts[texts.length - 1]}`;
  const display = `Ich möchte ${list}, bitte.`;
  const notes = lines.map(({ item, qty }) =>
    qty === 1
      ? `${item.gender} ${item.de} → ${ACCUSATIVE[item.gender]} ${item.de}`
      : `${item.gender} ${item.de} → ${toGerman(qty)} ${item.plural} (plural: ${item.plural})`
  );
  return { phrases, display, notes };
}

// Validates an order sent by the browser (1-3 distinct shop items, plurals only where they exist).
export function orderFromClient(raw: unknown): OrderLine[] | null {
  if (!Array.isArray(raw) || raw.length < 1 || raw.length > 3) return null;
  const lines: OrderLine[] = [];
  for (const r of raw) {
    const item = ITEMS.find((i) => i.de === r?.de);
    const qty = r?.qty;
    if (!item || !Number.isInteger(qty) || qty < 1 || qty > 9 || (qty > 1 && !item.plural)) return null;
    if (lines.some((l) => l.item === item)) return null;
    lines.push({ item, qty });
  }
  return lines;
}

export function buildOrder(level: number): Order {
  const count = level <= 2 ? 1 : level === 3 ? 2 : 3;
  const items: ShopItem[] = [];
  const lines: OrderLine[] = [];
  while (lines.length < count) {
    const wantMany = level === 2 || (level > 2 && Math.random() < 0.5);
    const item = pick(ITEMS.filter((i) => !items.includes(i) && (!wantMany || i.plural)));
    items.push(item);
    const qty = wantMany ? 2 + rand(level === 4 ? 2 : 4) : 1;
    lines.push({ item, qty });
  }

  const { phrases, display, notes } = describeOrder(lines);
  const variants = permutations(phrases).map((p) => ["Ich", "möchte", ...joinWords(p), "bitte"]);

  const needed = variants[0];
  const extra: string[] = [];
  for (const { item, qty } of lines) {
    const wrong = qty === 1 ? pick(Object.values(ACCUSATIVE).filter((a) => a !== ACCUSATIVE[item.gender])) : item.de;
    if (!needed.includes(wrong) && !extra.includes(wrong)) extra.push(wrong);
  }
  const tiles = shuffle([...needed, ...extra.slice(0, 3)]).map((text, id) => ({ id, text }));

  return { lines, tiles, variants, display, notes, totalCents: lines.reduce((s, l) => s + l.item.cents * l.qty, 0) };
}
