import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDb } from "@/lib/mongodb";
import { saveRound } from "@/lib/tracking/save-round";
import { validateRound } from "@/lib/tracking/validate";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in to save rounds" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const valid = validateRound(body);
  if (!valid.ok) return NextResponse.json({ error: valid.error }, { status: 422 });

  const result = await saveRound(await getDb(), session.user.id, valid.round);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ ok: true, streak: result.streak, newBests: result.newBests });
}
