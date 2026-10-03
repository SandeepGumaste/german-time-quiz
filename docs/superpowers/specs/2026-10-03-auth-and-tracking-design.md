# Sign-in and score tracking: design

Date: 2026-10-03
Status: approved in conversation, pending written-spec review

## Goal

Let players sign in with Google, and save results from all six games in MongoDB so each player gets
personal stats, a daily streak, weak-spot tracking, and an opt-in leaderboard. Games stay instantly
playable without signing in.

## Decisions (from the user)

- OAuth provider: Google only.
- Guest play: allowed. Sign-in is optional. Guest rounds are not saved or attached later.
- Features: personal history and stats, global leaderboard, weak-spot tracking, daily streak.

## Stack

- Next.js 16 (App Router) on Vercel, as today.
- Auth.js v5 (`next-auth`) with the Google provider, JWT cookie sessions, no database adapter.
- Official `mongodb` driver. MongoDB Atlas (free tier). The client is cached on `globalThis` so
  serverless invocations reuse the connection.
- Tests: add Vitest for server-side logic only (validation, streak, stats updates).

## Auth

- `auth.ts` at the repo root exports `auth`, `handlers`, `signIn`, `signOut`. Route: `app/api/auth/[...nextauth]/route.ts`.
- On sign-in (the `signIn`/`jwt` callback), upsert a `users` document keyed by Google's stable `sub`.
  The session carries `userId` (the Mongo `_id` as a string). Name, email and avatar from Google are
  stored for the player's own profile only.
- UI: a small header component on every page: "Sign in" button, or avatar menu (Profile, Sign out).
- Results screens show a one-line "Sign in to save your progress" note to guests.

## Data model

### `users`
`_id`, `googleId` (unique), `name`, `email`, `image`, `displayName` (editable, defaults to first name),
`leaderboard` (bool, default false), `tz` (IANA timezone, updated from each round),
`streak` { `current`, `best`, `lastDay` (YYYY-MM-DD in the player's tz) }, `createdAt`.

### `rounds` (activity log, one document per finished round)
`userId`, `game`, `mode`, `score` (correct answers), `correct`, `total`, `xp`, `bestStreak`,
`level`, `durationSec`, `playedAt`.
Index: `{ userId: 1, playedAt: -1 }`.

### `userStats` (one per user and game; read by profile and leaderboard)
`userId`, `game`, `rounds`, `totalCorrect`, `totalAnswers`, `totalXp`, `bestScore`, `bestStreak`,
`bestTimedScore`, `maxLevel`, `lastPlayedAt`. Updated with `$inc` and `$max` upserts.
Indexes: `{ userId: 1, game: 1 }` unique; `{ game: 1, bestTimedScore: -1 }` and `{ game: 1, bestScore: -1 }` for leaderboards.

### `weakSpots` (one per user, game and item)
`userId`, `game`, `key`, `label`, `misses`, `attempts`, `lastMissAt`.
Index: `{ userId: 1, game: 1, key: 1 }` unique.

Game ids: `time`, `artikel`, `zahlen`, `satzbau`, `verben`, `laden`.

## Reporting rounds

`lib/report-round.ts` exposes `reportRound(round)`. It POSTs to `/api/rounds` and silently does nothing
for guests (the API returns 401) or on network failure; gameplay never waits on it.

Payload: `{ game, mode, correct, total, xp, bestStreak, level, durationSec, tz, misses: [{ key, label, attempts? }] }`.
`score` is `correct`.

Each game calls it once when a round ends:
- artikel, zahlen: practice or timed results screen; `mode` is `practice` or `timed`.
- satzbau, laden: results screen ("End round" or "Leave shop").
- verben: game over or "End game".
- time: it has no round end, so it reports every 10 answered questions and on page hide
  (`navigator.sendBeacon`). It has no leaderboard.

Miss keys (stable, so weak spots aggregate):
- artikel: the noun (`Tisch`), label `der Tisch`.
- zahlen: the round type (`price`, `date`, `year`, `small`, `tens`, `large`).
- satzbau: the sentence id, label is the sentence's rule.
- verben: infinitive plus tense (`fahren|Präsens`).
- laden: the item (`Apfel`).
- time: not tracked per item.

Only artikel, zahlen, satzbau, verben and laden send `misses`.

## `POST /api/rounds`

1. Require a session, otherwise 401.
2. Validate the body with a schema (Zod): known `game` and `mode`, integer fields, bounded lengths.
3. Plausibility checks, reject with 422 otherwise:
   - `0 <= correct <= total`, `bestStreak <= correct`, `xp <= correct * 20`.
   - `durationSec <= 3600` and `total <= durationSec * 2 + 5` (at most about two answers a second).
   - `timed` mode: `durationSec <= 65`.
   - `misses.length <= total - correct + 1`.
4. Rate limit: at most 30 rounds per user per hour (count from `rounds`), otherwise 429.
5. Writes: insert `rounds`; upsert `userStats`; upsert `weakSpots` (`$inc` misses, attempts); update the streak.
6. Returns `{ ok: true, streak, newBests: [...] }` so the results screen can say "New best!".

Streak: compute today's date in `tz`; if `lastDay` is yesterday, `current += 1`; if today, unchanged;
otherwise reset to 1. `best = max(best, current)`.

## Pages

- `/profile` (signed in): per-game stats table, recent rounds, current and best streak, weakest items
  (top misses by miss rate, minimum 3 attempts), display name field and leaderboard opt-in toggle.
- `/leaderboard`: tabs per game. artikel and zahlen rank by `bestTimedScore`; satzbau, verben and laden
  by `bestScore`. Top 20, only players with `leaderboard: true`, shown by `displayName`. Google name
  and email are never exposed. `time` has no board.
- The hub gains Sign-in header, Profile and Leaderboard links.

## Security and privacy

- Secrets only in env vars: `MONGODB_URI`, `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`,
  set in Vercel and in a local `.env.local` (`.gitignore` already excludes `.env*`).
- Scores are reported by the browser, so they are not tamper-proof. The checks above stop casual
  cheating only. Making games server-authoritative is out of scope.
- Leaderboard is opt-in. Public data is the display name, game and best score only.
- All writes happen in route handlers or server actions using the session's `userId`, never an id from the client.

## Setup the owner must do (cannot be automated)

1. Create a MongoDB Atlas cluster and database user; allow network access from Vercel (`0.0.0.0/0`
   or the Vercel integration).
2. Create a Google OAuth client (Web). Authorized redirect URIs:
   `http://localhost:3000/api/auth/callback/google` and `https://<production-domain>/api/auth/callback/google`.
   The production domain must be settled first (the `german-time-quiz.vercel.app` alias currently points at an old deployment).
3. Add the four env vars to Vercel (Production and Preview) and `.env.local`.

## Build order (each step deployable on its own)

1. Auth.js and the header sign-in button, no database.
2. MongoDB connection, `users` upsert, `/api/rounds` with validation, tests for validation, streak and stats updates.
3. Wire `reportRound` into all six games.
4. `/profile`: stats, streak, weak spots, settings.
5. `/leaderboard`.

## Out of scope

Saving guest rounds retroactively, other OAuth providers, server-authoritative scoring, AI coaching
(this data model is meant to feed it later), account deletion UI (add soon after launch; the data is
keyed by `userId`, so deletion is a few `deleteMany` calls).

## Testing

Vitest unit tests for the pure logic: round validation, streak computation, stats and weak-spot update
documents. Manual checks for sign-in, a saved round per game, profile, and leaderboard opt-in.
