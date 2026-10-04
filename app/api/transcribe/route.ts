import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/auth";
import { getDb } from "@/lib/mongodb";

const MAX_BYTES = 1_000_000; // about 20 seconds of compressed speech; answers are a few words
const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_CALLS_PER_DAY = 60;
const ALLOWED_TYPES = ["audio/webm", "audio/ogg", "audio/mp4", "audio/mpeg", "audio/wav", "audio/x-wav"];

// `next dev` skips the daily limit so voice can be tested freely.
const isDev = process.env.NODE_ENV === "development";

const maxCallsPerDay = () => {
  const n = Number.parseInt(process.env.DEEPGRAM_CALLS_PER_DAY ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_CALLS_PER_DAY;
};

// Lets the page know up front whether server voice recognition is set up, so it never records for nothing.
export async function GET() {
  return NextResponse.json({ enabled: Boolean(process.env.DEEPGRAM_API_KEY) });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || !ObjectId.isValid(session.user.id)) {
    return NextResponse.json({ error: "Sign in to use voice recognition" }, { status: 401 });
  }
  const apiKey = process.env.DEEPGRAM_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Voice recognition is not set up" }, { status: 503 });

  const type = (req.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
  if (!ALLOWED_TYPES.includes(type)) return NextResponse.json({ error: "Unsupported audio type" }, { status: 415 });
  const audio = await req.arrayBuffer();
  if (audio.byteLength === 0 || audio.byteLength > MAX_BYTES) {
    return NextResponse.json({ error: "Recording is empty or too long" }, { status: 413 });
  }

  if (!isDev) {
    const userId = new ObjectId(session.user.id);
    const calls = (await getDb()).collection("sttUsage");
    await Promise.all([
      calls.createIndex({ expireAt: 1 }, { expireAfterSeconds: 0 }),
      calls.createIndex({ userId: 1, at: -1 }),
    ]);
    const now = new Date();
    const used = await calls.countDocuments({ userId, at: { $gte: new Date(now.getTime() - DAY_MS) } });
    if (used >= maxCallsPerDay()) {
      return NextResponse.json({ error: `Daily limit of ${maxCallsPerDay()} voice answers reached. Come back tomorrow!` }, { status: 429 });
    }
    await calls.insertOne({ userId, at: now, expireAt: new Date(now.getTime() + DAY_MS) });
  }

  try {
    // Words only (no smart formatting), so "halb drei" is not turned into digits.
    const res = await fetch("https://api.deepgram.com/v1/listen?model=nova-3&language=de&punctuate=false&smart_format=false", {
      method: "POST",
      headers: { Authorization: `Token ${apiKey}`, "Content-Type": type },
      body: audio,
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`Deepgram responded ${res.status}`);
    const data = (await res.json()) as { results?: { channels?: { alternatives?: { transcript?: string }[] }[] } };
    const transcript = (data.results?.channels?.[0]?.alternatives?.[0]?.transcript ?? "").replace(/[.,!?]/g, "").trim();
    return NextResponse.json({ transcript });
  } catch (e) {
    console.error("transcribe failed", e);
    return NextResponse.json({ error: "Voice recognition is unavailable right now." }, { status: 502 });
  }
}
