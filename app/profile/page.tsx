import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DeleteAccount } from "@/components/delete-account";
import { ProfileSettings } from "@/components/profile-settings";
import { getDb } from "@/lib/mongodb";
import { GAME_HREFS, GAME_NAMES } from "@/lib/tracking/games";
import { getProfile } from "@/lib/tracking/profile";

export const metadata = { title: "Your profile" };

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");
  const profile = await getProfile(await getDb(), session.user.id);
  if (!profile) redirect("/");

  const totalXp = profile.stats.reduce((n, s) => n + s.totalXp, 0);
  const totalRounds = profile.stats.reduce((n, s) => n + s.rounds, 0);

  return (
    <div className="flex flex-col items-center gap-6 mt-8 px-4 pb-16">
      <h1 className="text-2xl font-bold">{profile.displayName}</h1>

      <div className="flex gap-6 text-center">
        <div><div className="text-2xl font-bold">🔥 {profile.streak?.current ?? 0}</div><div className="text-xs text-muted-foreground">Day streak</div></div>
        <div><div className="text-2xl font-bold">{profile.streak?.best ?? 0}</div><div className="text-xs text-muted-foreground">Best streak</div></div>
        <div><div className="text-2xl font-bold">{totalXp}</div><div className="text-xs text-muted-foreground">Total XP</div></div>
        <div><div className="text-2xl font-bold">{totalRounds}</div><div className="text-xs text-muted-foreground">Rounds</div></div>
      </div>

      <section className="w-full max-w-2xl">
        <h2 className="font-semibold mb-2">Your games</h2>
        {profile.stats.length === 0 ? (
          <p className="text-muted-foreground text-sm">No rounds saved yet. <Link href="/" className="underline">Play a game</Link> and it will show up here.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-muted-foreground">
                <tr><th className="py-1 pr-3">Game</th><th className="pr-3">Rounds</th><th className="pr-3">Best</th><th className="pr-3">Accuracy</th><th className="pr-3">XP</th><th>Level</th></tr>
              </thead>
              <tbody>
                {profile.stats.map((s) => (
                  <tr key={s.game} className="border-t">
                    <td className="py-1 pr-3"><Link href={GAME_HREFS[s.game]} className="underline">{GAME_NAMES[s.game]}</Link></td>
                    <td className="pr-3">{s.rounds}</td>
                    <td className="pr-3">{s.bestScore}</td>
                    <td className="pr-3">{s.totalAnswers ? Math.round((s.totalCorrect / s.totalAnswers) * 100) : 0}%</td>
                    <td className="pr-3">{s.totalXp}</td>
                    <td>{s.maxLevel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {profile.weakSpots.length > 0 && (
        <section className="w-full max-w-2xl">
          <h2 className="font-semibold mb-2">Your weak spots</h2>
          <ul className="text-sm space-y-1">
            {profile.weakSpots.map((w) => (
              <li key={`${w.game}-${w.label}`} className="flex justify-between border-t py-1">
                <span>{w.label} <span className="text-muted-foreground">· {GAME_NAMES[w.game]}</span></span>
                <span className="text-primary">{w.misses} {w.misses === 1 ? "miss" : "misses"}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {profile.recent.length > 0 && (
        <section className="w-full max-w-2xl">
          <h2 className="font-semibold mb-2">Recent rounds</h2>
          <ul className="text-sm space-y-1">
            {profile.recent.map((r, i) => (
              <li key={i} className="flex justify-between border-t py-1">
                <span>{GAME_NAMES[r.game]}{r.mode === "timed" ? " (timed)" : ""}</span>
                <span>{r.correct}/{r.total} · {r.playedAt.slice(0, 10)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="w-full max-w-2xl">
        <h2 className="font-semibold mb-2">Settings</h2>
        <ProfileSettings displayName={profile.displayName} leaderboard={profile.leaderboard} />
      </section>

      <section className="w-full max-w-2xl">
        <h2 className="font-semibold mb-2">Delete account</h2>
        <DeleteAccount />
      </section>
    </div>
  );
}
