import Link from "next/link";

const games = [
  { href: "/time", title: "German Time", blurb: "Say the time in German, by voice." },
  { href: "/artikel", title: "Der / Die / Das", blurb: "Pick the right article. Streaks, combos, timed mode." },
];

export default function Home() {
  return (
    <div className="flex flex-col items-center gap-6 mt-16 px-4">
      <h1 className="text-2xl font-bold">German Games</h1>
      <div className="flex flex-col gap-4 w-full max-w-sm">
        {games.map((g) => (
          <Link
            key={g.href}
            href={g.href}
            className="border-2 rounded-xl p-4 hover:bg-gray-100 transition"
          >
            <div className="text-lg font-semibold">{g.title}</div>
            <div className="text-sm text-gray-600">{g.blurb}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
