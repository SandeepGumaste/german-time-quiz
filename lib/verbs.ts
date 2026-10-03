import { shuffle } from "./artikel-game";

export type VerbQuestion = {
  id: number;
  level: number;
  before: string; // text before the blank
  after: string; // text after the blank
  hint: string; // infinitive and tense, shown under the sentence
  answer: string;
  choices: string[]; // three gates
};

export const VERB_LEVEL_NAMES = ["", "sein & haben", "Regular verbs", "Irregular verbs", "Past: war & hatte", "Perfekt"];
export const MAX_VERB_LEVEL = 5;
export const CORRECT_PER_VERB_LEVEL = 6;
export const verbLevelFor = (correct: number) =>
  Math.min(MAX_VERB_LEVEL, 1 + Math.floor(correct / CORRECT_PER_VERB_LEVEL));

// Seconds the runner needs to reach the gates; shorter on higher levels.
export const runSeconds = (level: number) => [0, 10, 9, 8, 8, 7][level];

type Forms = [string, string, string, string, string, string]; // ich du er wir ihr sie(pl)

// Subjects for each person. Plural/3rd-person subjects avoid a bare "sie" so the sentence is never ambiguous.
const SUBJECTS: string[][] = [["ich"], ["du"], ["er", "Maria", "mein Vater"], ["wir"], ["ihr"], ["die Kinder", "meine Eltern"]];

const reg = (inf: string, e = ""): Forms => {
  const stem = inf.slice(0, -2);
  return [`${stem}e`, `${stem}${e}st`, `${stem}${e}t`, inf, `${stem}${e}t`, inf];
};

type Verb = { inf: string; forms: Forms; rests: string[] };

const SEIN_HABEN: Verb[] = [
  { inf: "sein", forms: ["bin", "bist", "ist", "sind", "seid", "sind"], rests: ["müde.", "aus Berlin.", "heute zu Hause."] },
  { inf: "haben", forms: ["habe", "hast", "hat", "haben", "habt", "haben"], rests: ["einen Hund.", "heute Zeit.", "Hunger."] },
];

const REGULAR: Verb[] = [
  { inf: "trinken", forms: reg("trinken"), rests: ["jeden Morgen Kaffee.", "gern Tee."] },
  { inf: "lernen", forms: reg("lernen"), rests: ["Deutsch.", "jeden Tag Vokabeln."] },
  { inf: "wohnen", forms: reg("wohnen"), rests: ["in Berlin.", "in einer Wohnung."] },
  { inf: "arbeiten", forms: reg("arbeiten", "e"), rests: ["heute zu Hause.", "viel."] },
  { inf: "spielen", forms: reg("spielen"), rests: ["gern Fußball.", "im Park."] },
  { inf: "kaufen", forms: reg("kaufen"), rests: ["Brot.", "Obst auf dem Markt."] },
  { inf: "machen", forms: reg("machen"), rests: ["Hausaufgaben.", "heute Abend Sport."] },
  { inf: "kochen", forms: reg("kochen"), rests: ["heute Abend Pasta.", "gern."] },
  { inf: "hören", forms: reg("hören"), rests: ["gern Musik.", "Radio."] },
];

const IRREGULAR: Verb[] = [
  { inf: "fahren", forms: ["fahre", "fährst", "fährt", "fahren", "fahrt", "fahren"], rests: ["heute nach Berlin.", "mit dem Bus."] },
  { inf: "essen", forms: ["esse", "isst", "isst", "essen", "esst", "essen"], rests: ["gern Pizza.", "jeden Tag Obst."] },
  { inf: "sehen", forms: ["sehe", "siehst", "sieht", "sehen", "seht", "sehen"], rests: ["einen Film.", "einen Krimi."] },
  { inf: "sprechen", forms: ["spreche", "sprichst", "spricht", "sprechen", "sprecht", "sprechen"], rests: ["gut Deutsch."] },
  { inf: "lesen", forms: ["lese", "liest", "liest", "lesen", "lest", "lesen"], rests: ["ein Buch.", "jeden Tag die Zeitung."] },
  { inf: "schlafen", forms: ["schlafe", "schläfst", "schläft", "schlafen", "schlaft", "schlafen"], rests: ["lange.", "bis acht Uhr."] },
  { inf: "nehmen", forms: ["nehme", "nimmst", "nimmt", "nehmen", "nehmt", "nehmen"], rests: ["den Bus.", "einen Kaffee."] },
  { inf: "laufen", forms: ["laufe", "läufst", "läuft", "laufen", "lauft", "laufen"], rests: ["jeden Tag im Park."] },
  { inf: "können", forms: ["kann", "kannst", "kann", "können", "könnt", "können"], rests: ["gut schwimmen.", "Deutsch sprechen."] },
  { inf: "müssen", forms: ["muss", "musst", "muss", "müssen", "müsst", "müssen"], rests: ["heute arbeiten.", "früh aufstehen."] },
  { inf: "wollen", forms: ["will", "willst", "will", "wollen", "wollt", "wollen"], rests: ["nach Hause gehen.", "Kaffee trinken."] },
];

const PAST: Verb[] = [
  { inf: "sein", forms: ["war", "warst", "war", "waren", "wart", "waren"], rests: ["müde.", "zu Hause.", "in Berlin."] },
  { inf: "haben", forms: ["hatte", "hattest", "hatte", "hatten", "hattet", "hatten"], rests: ["keine Zeit.", "Hunger.", "viel Arbeit."] },
];

// Perfekt: [auxiliary, infinitive, participle, words before the blank, two wrong participles]
type Perfekt = ["haben" | "sein", string, string, string, [string, string]];
const PERFEKT: Perfekt[] = [
  ["haben", "trinken", "getrunken", "Kaffee", ["getrinkt", "trinken"]],
  ["haben", "essen", "gegessen", "Pizza", ["geessen", "essen"]],
  ["haben", "sehen", "gesehen", "einen Film", ["gesieht", "sehen"]],
  ["haben", "machen", "gemacht", "Hausaufgaben", ["gemachen", "machen"]],
  ["haben", "lernen", "gelernt", "Deutsch", ["gelernen", "lernen"]],
  ["haben", "kaufen", "gekauft", "Brot", ["gekaufen", "kaufen"]],
  ["haben", "lesen", "gelesen", "ein Buch", ["gelest", "lesen"]],
  ["haben", "spielen", "gespielt", "Fußball", ["gespielen", "spielen"]],
  ["haben", "schlafen", "geschlafen", "lange", ["geschlaft", "schlafen"]],
  ["haben", "sprechen", "gesprochen", "Deutsch", ["gesprecht", "sprechen"]],
  ["sein", "gehen", "gegangen", "ins Kino", ["gegeht", "gehen"]],
  ["sein", "fahren", "gefahren", "nach Berlin", ["gefahrt", "fahren"]],
  ["sein", "kommen", "gekommen", "nach Hause", ["gekommt", "kommen"]],
  ["sein", "bleiben", "geblieben", "zu Hause", ["gebleibt", "bleiben"]],
  ["sein", "laufen", "gelaufen", "zur Schule", ["gelauft", "laufen"]],
  ["sein", "fliegen", "geflogen", "nach Wien", ["geflogt", "fliegen"]],
];

const rand = (n: number) => Math.floor(Math.random() * n);
const pick = <T,>(a: T[]): T => a[rand(a.length)];
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// Correct form plus two distinct wrong forms of the same verb.
function gates(forms: string[], answer: string): string[] {
  const wrong = shuffle(Array.from(new Set(forms)).filter((f) => f !== answer)).slice(0, 2);
  return shuffle([answer, ...wrong]);
}

let counter = 0;

function presentQuestion(level: number, verbs: Verb[]): VerbQuestion {
  const v = pick(verbs);
  const person = rand(6);
  const subject = pick(SUBJECTS[person]);
  const answer = v.forms[person];
  return {
    id: ++counter,
    level,
    before: `${cap(subject)}`,
    after: ` ${pick(v.rests)}`,
    hint: `${v.inf}, Präsens`,
    answer,
    choices: gates(v.forms, answer),
  };
}

function pastQuestion(): VerbQuestion {
  const v = pick(PAST);
  const person = rand(6);
  const answer = v.forms[person];
  return {
    id: ++counter,
    level: 4,
    before: "Gestern",
    after: ` ${pick(SUBJECTS[person])} ${pick(v.rests)}`,
    hint: `${v.inf}, Präteritum`,
    answer,
    choices: gates(v.forms, answer),
  };
}

const AUX: Record<"haben" | "sein", Forms> = {
  haben: SEIN_HABEN[1].forms,
  sein: SEIN_HABEN[0].forms,
};

function perfektQuestion(): VerbQuestion {
  const [aux, inf, part, obj, bad] = pick(PERFEKT);
  const person = rand(6);
  return {
    id: ++counter,
    level: 5,
    before: `${cap(pick(SUBJECTS[person]))} ${AUX[aux][person]} gestern ${obj}`,
    after: ".",
    hint: `${inf}, Perfekt`,
    answer: part,
    choices: shuffle([part, ...bad]),
  };
}

// Draw from the unlocked levels, favouring the newest.
export function nextVerbQuestion(level: number): VerbQuestion {
  const lvl = level > 1 && Math.random() < 0.5 ? level : 1 + rand(level);
  switch (lvl) {
    case 1: return presentQuestion(1, SEIN_HABEN);
    case 2: return presentQuestion(2, REGULAR);
    case 3: return presentQuestion(3, IRREGULAR);
    case 4: return pastQuestion();
    default: return perfektQuestion();
  }
}
