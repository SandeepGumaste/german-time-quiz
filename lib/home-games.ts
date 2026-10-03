export type GameCategory = "speaking" | "grammar" | "numbers" | "syntax" | "everyday";

export type HomeGame = {
  href: string;
  stage: string;
  kicker: string;
  title: string;
  level: string;
  blurb: string;
  category: GameCategory;
  tags: string[];
  grip: string;
};

export const GAMES: HomeGame[] = [
  { href: "/time", stage: "01", kicker: "Deutsch Uhrzeit", title: "German Time", level: "A1-A2", category: "speaking", grip: "bg-primary text-primary-foreground",
    blurb: "Say the time in German, by voice. Rapid-fire clock reading challenge.", tags: ["SPEAKING", "VOICE REC"] },
  { href: "/artikel", stage: "02", kicker: "Artikel Arcade", title: "Der / Die / Das", level: "A1-B1", category: "grammar", grip: "bg-secondary text-secondary-foreground",
    blurb: "Pick the right article. Streaks, combos and a timed mode to lock in noun genders.", tags: ["GRAMMAR", "FAST-PACED", "TIMED"] },
  { href: "/zahlen", stage: "03", kicker: "Zahlen & Preise", title: "Numbers & Prices", level: "A1-A2", category: "numbers", grip: "bg-success text-white",
    blurb: "Numbers, prices, dates and years. Gets harder as you go.", tags: ["NUMBERS", "ADAPTIVE", "CURRENCY"] },
  { href: "/satzbau", stage: "04", kicker: "Satzbau Puzzle", title: "Sentence Builder", level: "A1-B1", category: "syntax", grip: "bg-ink text-background",
    blurb: "Arrange word tiles into correct German sentences.", tags: ["SYNTAX", "PUZZLE"] },
  { href: "/verben", stage: "05", kicker: "Verb Runner", title: "Verb Runner", level: "A1-B1", category: "grammar", grip: "bg-primary text-primary-foreground",
    blurb: "Pick the right verb form before the runner reaches the gates.", tags: ["VERBS", "ACTION", "CONJUGATE"] },
  { href: "/laden", stage: "06", kicker: "Der Laden", title: "German Shop", level: "A1-A2", category: "everyday", grip: "bg-secondary text-secondary-foreground",
    blurb: "Order groceries politely: articles, plurals, numbers and prices.", tags: ["EVERYDAY", "ROLEPLAY", "MARKET"] },
];

export const FILTERS: { id: "all" | GameCategory; label: string }[] = [
  { id: "all", label: "ALL" },
  { id: "speaking", label: "🎤 SPEAKING" },
  { id: "grammar", label: "⚡ GRAMMAR" },
  { id: "numbers", label: "🔢 NUMBERS & PRICES" },
  { id: "syntax", label: "🧩 SYNTAX" },
  { id: "everyday", label: "🛒 EVERYDAY DIALOGUE" },
];
