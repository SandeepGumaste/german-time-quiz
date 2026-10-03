import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { getDb } from "@/lib/mongodb";
import { ensureIndexes } from "@/lib/tracking/save-round";

declare module "next-auth" {
  interface Session {
    user: { id: string } & import("next-auth").DefaultSession["user"];
  }
}

// Reads AUTH_SECRET, AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET from the environment.
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  session: { strategy: "jwt" },
  callbacks: {
    // On sign-in, find or create the player's record and keep its id in the token.
    async jwt({ token, account, profile }) {
      if (account && profile?.sub) {
        const db = await getDb();
        await ensureIndexes(db);
        const first = (profile.name ?? "").split(" ")[0] || "Player";
        const user = await db.collection("users").findOneAndUpdate(
          { googleId: profile.sub },
          {
            $set: { name: profile.name ?? null, email: profile.email ?? null, image: profile.picture ?? null },
            $setOnInsert: { googleId: profile.sub, displayName: first, leaderboard: false, createdAt: new Date() },
          },
          { upsert: true, returnDocument: "after" }
        );
        token.userId = user?._id.toString();
      }
      return token;
    },
    session({ session, token }) {
      if (token.userId) session.user.id = token.userId as string;
      return session;
    },
  },
});
