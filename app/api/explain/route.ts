import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/auth";
import { getDb } from "@/lib/mongodb";
import { buildExplainPrompt, cleanExplanation } from "@/lib/ai/explain";
import { maxCallsPerDay } from "@/lib/ai/limits";
import { NoProviderError, complete } from "@/lib/ai/providers";

const DAY_MS = 24 * 60 * 60 * 1000;

// `next dev` skips the daily limit and the cache, so every click shows the current prompt and model.
const isDev = process.env.NODE_ENV === "development";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const prompt = buildExplainPrompt(body);
  if (!prompt) return NextResponse.json({ error: "Invalid request" }, { status: 422 });

  const db = await getDb();
  const cached = isDev ? null : await db.collection("explanations").findOne({ key: prompt.key });

  // `peek` only reports whether a saved explanation exists, so the button can show it as free before it is clicked.
  if (body.peek === true) return NextResponse.json({ cached: Boolean(cached) });

  const session = await auth();
  if (!session?.user?.id || !ObjectId.isValid(session.user.id)) {
    return NextResponse.json({ error: "Sign in to get explanations" }, { status: 401 });
  }
  if (cached) return NextResponse.json({ text: cached.text as string, cached: true });

  // Only fresh model calls count against the limit, since free provider quotas are shared by all players.
  if (!isDev) {
    const userId = new ObjectId(session.user.id);
    const calls = db.collection("aiUsage");
    await Promise.all([
      calls.createIndex({ expireAt: 1 }, { expireAfterSeconds: 0 }),
      calls.createIndex({ userId: 1, at: -1 }),
    ]);
    const now = new Date();
    const used = await calls.countDocuments({ userId, at: { $gte: new Date(now.getTime() - DAY_MS) } });
    if (used >= maxCallsPerDay()) {
      return NextResponse.json({ error: `Daily limit of ${maxCallsPerDay()} AI explanations reached. Come back tomorrow!` }, { status: 429 });
    }
    await calls.insertOne({ userId, at: now, expireAt: new Date(now.getTime() + DAY_MS) });
  }

  try {
    const { text, provider } = await complete(prompt.messages);
    const clean = cleanExplanation(text);
    await db.collection("explanations").updateOne(
      { key: prompt.key },
      // In dev the fresh text replaces whatever was saved, so the cache never goes stale.
      { [isDev ? "$set" : "$setOnInsert"]: { key: prompt.key, text: clean, provider, createdAt: new Date() } },
      { upsert: true }
    );
    return NextResponse.json({ text: clean, cached: false });
  } catch (e) {
    console.error("explain failed", e);
    const status = e instanceof NoProviderError ? 503 : 502;
    return NextResponse.json({ error: "Explanations are unavailable right now." }, { status });
  }
}
