import { shuffle } from "./artikel-game";

export type Sentence = {
  id: string;
  level: number;
  variants: string[][]; // accepted word orders (no punctuation); variants[0] supplies the tiles
  display: string[]; // each accepted sentence, properly capitalized and punctuated
  en: string;
  rule: string;
};

export const LEVEL_NAMES = ["", "Simple sentences", "Questions", "Time expressions", "Modal verbs", "Subordinate clauses"];

export const LEVEL_RULES = [
  "",
  "In a German statement the conjugated verb is always the second element.",
  "W-questions start with the question word, then the verb. Yes/no questions start with the verb.",
  "When a time expression comes first, the verb stays second, so the subject moves behind it.",
  "The modal verb is the second element; the main verb goes to the end as an infinitive.",
  "After weil, dass, wenn and obwohl the conjugated verb moves to the end of the clause.",
];

export const MAX_SENTENCE_LEVEL = 5;
export const CORRECT_PER_SENTENCE_LEVEL = 4;

export const sentenceLevelFor = (correct: number) =>
  Math.min(MAX_SENTENCE_LEVEL, 1 + Math.floor(correct / CORRECT_PER_SENTENCE_LEVEL));

// [level, accepted sentences separated by " | ", English, optional specific rule]
// Nouns are capitalized; the first word is lowercase (it is capitalized when displayed).
type Raw = [number, string, string, string?];
const RAW: Raw[] = [
  [1, "ich bin Sandeep.", "I am Sandeep."],
  [1, "ich habe ein Auto.", "I have a car."],
  [1, "ich wohne in Berlin.", "I live in Berlin."],
  [1, "ich trinke Kaffee.", "I drink coffee."],
  [1, "wir lernen Deutsch.", "We are learning German."],
  [1, "er isst einen Apfel.", "He eats an apple."],
  [1, "sie spielt Fußball.", "She plays football."],
  [1, "wir kommen aus Indien.", "We come from India."],
  [1, "du hast einen Hund.", "You have a dog."],
  [1, "ich lese ein Buch.", "I am reading a book."],
  [1, "heute gehe ich zur Arbeit. | ich gehe heute zur Arbeit.", "Today I go to work.",
    "The verb is second. Starting with \"heute\" pushes \"ich\" behind the verb."],

  [2, "wo wohnst du?", "Where do you live?"],
  [2, "wie heißt du?", "What is your name?"],
  [2, "was trinkst du?", "What are you drinking?"],
  [2, "woher kommst du?", "Where do you come from?"],
  [2, "wie alt bist du?", "How old are you?"],
  [2, "was machst du heute?", "What are you doing today?"],
  [2, "wo arbeitet er?", "Where does he work?"],
  [2, "hast du einen Hund?", "Do you have a dog?", "Yes/no questions start with the verb."],
  [2, "sprichst du Deutsch?", "Do you speak German?", "Yes/no questions start with the verb."],
  [2, "trinkst du Kaffee?", "Do you drink coffee?", "Yes/no questions start with the verb."],

  [3, "morgen gehe ich zur Arbeit. | ich gehe morgen zur Arbeit.", "Tomorrow I go to work."],
  [3, "heute trinke ich Kaffee. | ich trinke heute Kaffee.", "Today I drink coffee."],
  [3, "am Montag lerne ich Deutsch. | ich lerne am Montag Deutsch.", "On Monday I learn German."],
  [3, "jetzt esse ich Brot. | ich esse jetzt Brot.", "Now I eat bread."],
  [3, "am Wochenende besuche ich meine Familie. | ich besuche am Wochenende meine Familie.", "At the weekend I visit my family."],
  [3, "heute Abend gehen wir ins Kino. | wir gehen heute Abend ins Kino.", "Tonight we go to the cinema."],
  [3, "im Sommer fahren wir nach Berlin. | wir fahren im Sommer nach Berlin.", "In summer we travel to Berlin."],
  [3, "um acht Uhr frühstücke ich. | ich frühstücke um acht Uhr.", "At eight o'clock I have breakfast."],
  [3, "jeden Tag lerne ich Deutsch. | ich lerne jeden Tag Deutsch.", "Every day I learn German."],
  [3, "heute spielen wir Fußball. | wir spielen heute Fußball.", "Today we play football."],

  [4, "ich möchte Deutsch lernen.", "I would like to learn German."],
  [4, "ich kann gut schwimmen.", "I can swim well."],
  [4, "heute musst du arbeiten. | du musst heute arbeiten.", "Today you have to work."],
  [4, "wir wollen nach Berlin fahren.", "We want to travel to Berlin."],
  [4, "er kann nicht kommen.", "He cannot come."],
  [4, "ich möchte einen Kaffee trinken.", "I would like to drink a coffee."],
  [4, "darf ich hier sitzen?", "May I sit here?", "In a yes/no question the modal verb comes first and the main verb stays at the end."],
  [4, "kannst du mir helfen?", "Can you help me?", "In a yes/no question the modal verb comes first and the main verb stays at the end."],
  [4, "morgen muss ich früh aufstehen. | ich muss morgen früh aufstehen.", "Tomorrow I have to get up early."],
  [4, "wir möchten Pizza essen.", "We would like to eat pizza."],

  [5, "ich lerne Deutsch, weil ich in Berlin wohne. | weil ich in Berlin wohne, lerne ich Deutsch.", "I learn German because I live in Berlin."],
  [5, "ich bleibe zu Hause, weil ich krank bin. | weil ich krank bin, bleibe ich zu Hause.", "I stay at home because I am sick."],
  [5, "ich weiß, dass du Deutsch lernst.", "I know that you are learning German."],
  [5, "ich glaube, dass er heute kommt.", "I think that he is coming today."],
  [5, "wenn es regnet, bleibe ich zu Hause. | ich bleibe zu Hause, wenn es regnet.", "When it rains, I stay at home.",
    "After \"wenn\" the verb goes to the end. If the wenn-clause comes first, the main clause starts with its verb."],
  [5, "ich bin müde, weil ich viel arbeite.", "I am tired because I work a lot."],
  [5, "er lernt Deutsch, weil er in Deutschland arbeiten möchte.", "He learns German because he wants to work in Germany.",
    "With a modal verb, the conjugated modal goes to the very end of the clause."],
  [5, "ich kaufe ein Auto, wenn ich Geld habe. | wenn ich Geld habe, kaufe ich ein Auto.", "I will buy a car when I have money."],
  [5, "sie sagt, dass sie Hunger hat.", "She says that she is hungry."],
  [5, "obwohl es kalt ist, gehe ich spazieren. | ich gehe spazieren, obwohl es kalt ist.", "Although it is cold, I go for a walk."],
];

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const SENTENCES: Sentence[] = RAW.map(([level, text, en, rule], i) => {
  const raws = text.split("|").map((t) => t.trim());
  return {
    id: `s${i}`,
    level,
    variants: raws.map((r) => r.replace(/[.?]$/, "").replace(/,/g, "").split(" ")),
    display: raws.map(capitalize),
    en,
    rule: rule ?? LEVEL_RULES[level],
  };
});

export type Tile = { id: number; text: string };

export function buildTiles(s: Sentence): Tile[] {
  const tiles = s.variants[0].map((text, id) => ({ id, text }));
  for (let i = 0; i < 20; i++) {
    const shuffled = shuffle(tiles);
    const words = shuffled.map((t) => t.text);
    if (!s.variants.some((v) => v.every((w, j) => w === words[j]))) return shuffled;
  }
  return [...tiles].reverse();
}

// Compare the player's word order to the closest accepted variant.
export function checkSentence(words: string[], s: Sentence) {
  let best = { variant: 0, mismatches: [] as number[] };
  let bestCount = Infinity;
  s.variants.forEach((v, vi) => {
    const mismatches = words.map((w, i) => (w === v[i] ? -1 : i)).filter((i) => i >= 0);
    if (mismatches.length < bestCount) {
      bestCount = mismatches.length;
      best = { variant: vi, mismatches };
    }
  });
  return { correct: bestCount === 0, ...best };
}

// Draw from unlocked levels, favouring the newest, without repeats until the pool is used up.
export function pickSentence(level: number, seen: Set<string>): Sentence {
  const unlocked = SENTENCES.filter((s) => s.level <= level);
  let pool = unlocked.filter((s) => !seen.has(s.id));
  if (pool.length === 0) {
    seen.clear();
    pool = unlocked;
  }
  const newest = pool.filter((s) => s.level === level);
  const from = level > 1 && newest.length > 0 && Math.random() < 0.6 ? newest : pool;
  return from[Math.floor(Math.random() * from.length)];
}
