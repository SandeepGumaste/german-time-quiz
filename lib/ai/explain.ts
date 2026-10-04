import { NOUNS } from "@/lib/nouns";
import { SENTENCES } from "@/lib/sentences";
import { verbFact } from "@/lib/verbs";
import { germanFor, type RoundType } from "@/lib/german-numbers";
import { describeOrder, orderFromClient } from "@/lib/shop";
import { generateTimeJson } from "@/lib/utils";
import type { Message } from "./providers";

export type ExplainRequest =
  | { game: "artikel"; noun: string; picked: string }
  | { game: "verben"; hint: string; answer: string; before: string; after: string }
  | { game: "satzbau"; id: string }
  | { game: "zahlen"; type: RoundType; digits: string }
  | { game: "laden"; items: { de: string; qty: number }[] }
  | { game: "time"; hhmm: string };

export type ExplainPrompt = { key: string; messages: Message[] };

const SYSTEM =
  "You are a friendly German tutor for English speakers at A1/A2 level. Write in English (German words only as examples), in at most 3 short sentences of plain text " +
  "(no markdown, no lists). Give a useful rule or memory trick if one exists; if there is no rule, say so and suggest memorizing it. " +
  "The correct answer is provided to you and is always right; never contradict it.";

const prompt = (key: string, content: string): ExplainPrompt => ({
  key,
  messages: [{ role: "system", content: SYSTEM }, { role: "user", content }],
});

// Free text from the client is limited to short plain sentences before it reaches a prompt.
const SAFE_TEXT = /^[\p{L}\s.,'’-]{0,80}$/u;
const isText = (v: unknown): v is string => typeof v === "string" && SAFE_TEXT.test(v);

function artikel(r: Record<string, unknown>): ExplainPrompt | null {
  if (typeof r.noun !== "string" || typeof r.picked !== "string" || !["der", "die", "das"].includes(r.picked)) return null;
  const noun = NOUNS.find((n) => n.de === r.noun);
  if (!noun || noun.article === r.picked) return null;
  return prompt(
    `artikel:${noun.de}:${r.picked}`,
    `The noun "${noun.de}" (${noun.en}) takes the article "${noun.article}". The learner answered "${r.picked}". Explain why "${noun.article}" is correct.`
  );
}

function verben(r: Record<string, unknown>): ExplainPrompt | null {
  const { hint, answer, before, after } = r;
  if (!isText(hint) || !isText(answer) || !isText(before) || !isText(after) || !answer) return null;
  const fact = verbFact(hint, answer);
  if (!fact) return null;
  const sentence = `${before} ___${after}`;
  return prompt(
    `verben:${hint}:${answer}:${sentence}`,
    `Fill the gap: "${sentence}" with the verb "${fact.inf}" in ${fact.tense}. The correct form is "${answer}". Explain why this form fits this subject and tense.`
  );
}

// The sentence and its rule come from our own list; the model only explains the word order.
function satzbau(r: Record<string, unknown>): ExplainPrompt | null {
  const s = typeof r.id === "string" ? SENTENCES.find((x) => x.id === r.id) : undefined;
  if (!s) return null;
  return prompt(
    `satzbau:${s.id}`,
    `The learner had to build this German sentence (${s.en}): ${s.display.join(" OR ")}. Rule for this level: ${s.rule} Explain the word order of the correct sentence.`
  );
}

const NUMBER_TYPES: RoundType[] = ["small", "tens", "large", "price", "date", "year"];

function zahlen(r: Record<string, unknown>): ExplainPrompt | null {
  if (typeof r.digits !== "string" || !NUMBER_TYPES.includes(r.type as RoundType)) return null;
  const german = germanFor(r.type as RoundType, r.digits);
  if (!german) return null;
  return prompt(
    `zahlen:${r.type}:${r.digits}`,
    `The learner had to match ${r.digits} (${r.type === "price" ? "a price in euros" : r.type === "date" ? "a date, day.month." : r.type === "year" ? "a year" : "a number"}) with its German words: "${german}". Explain how this is built and what makes it easy to get wrong.`
  );
}

function laden(r: Record<string, unknown>): ExplainPrompt | null {
  const lines = orderFromClient(r.items);
  if (!lines) return null;
  const { display, notes } = describeOrder(lines);
  return prompt(
    `laden:${lines.map((l) => `${l.item.de}x${l.qty}`).join(",")}`,
    `The learner had to order in a German shop. The correct polite sentence is: "${display}" Article and plural notes: ${notes.join("; ")}. ` +
      "Explain why the articles (einen/eine/ein after \"ich möchte\") and plurals look like this."
  );
}

let timeIndex: Map<string, string[]> | undefined;

function time(r: Record<string, unknown>): ExplainPrompt | null {
  timeIndex ??= new Map(generateTimeJson().map((t) => [t.hhmm, t.german]));
  const forms = typeof r.hhmm === "string" ? timeIndex.get(r.hhmm) : undefined;
  if (!forms || typeof r.hhmm !== "string") return null;
  return prompt(
    `time:${r.hhmm}`,
    `The learner had to say ${r.hhmm} in German. Accepted ways: ${forms.join(" / ")}. ` +
      "Explain how the formal (digital, 24-hour) and informal (viertel, halb, nach, vor) ways are built, and the trick that halb means half before the next hour."
  );
}

export function buildExplainPrompt(raw: unknown): ExplainPrompt | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.game === "artikel") return artikel(r);
  if (r.game === "verben") return verben(r);
  if (r.game === "satzbau") return satzbau(r);
  if (r.game === "zahlen") return zahlen(r);
  if (r.game === "laden") return laden(r);
  if (r.game === "time") return time(r);
  return null;
}

export function cleanExplanation(text: string): string {
  return text.replace(/[*_`#]/g, "").trim().slice(0, 500);
}
