import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/auth";
import { getDb } from "@/lib/mongodb";
import { validateSettings } from "@/lib/tracking/profile";

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id || !ObjectId.isValid(session.user.id)) {
    return NextResponse.json({ error: "Sign in first" }, { status: 401 });
  }
  const valid = validateSettings(await req.json().catch(() => null));
  if (!valid.ok) return NextResponse.json({ error: valid.error }, { status: 422 });

  await (await getDb()).collection("users").updateOne({ _id: new ObjectId(session.user.id) }, { $set: valid.settings });
  return NextResponse.json({ ok: true });
}
