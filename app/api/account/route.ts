import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/auth";
import { getDb } from "@/lib/mongodb";

// Permanently removes the signed-in player and everything stored about them.
export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id || !ObjectId.isValid(session.user.id)) {
    return NextResponse.json({ error: "Sign in first" }, { status: 401 });
  }
  const userId = new ObjectId(session.user.id);
  const db = await getDb();
  await Promise.all([
    db.collection("rounds").deleteMany({ userId }),
    db.collection("userStats").deleteMany({ userId }),
    db.collection("weakSpots").deleteMany({ userId }),
  ]);
  await db.collection("users").deleteOne({ _id: userId });
  return NextResponse.json({ ok: true });
}
