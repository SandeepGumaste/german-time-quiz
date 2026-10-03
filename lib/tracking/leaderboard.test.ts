import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { MongoClient, ObjectId, type Db } from "mongodb";
import { boardField, getLeaderboard } from "./leaderboard";

let client: MongoClient;
let db: Db;

beforeAll(async () => {
  client = await new MongoClient(process.env.MONGODB_URI ?? "mongodb://localhost:27017").connect();
  db = client.db("german-games-test-board");
});
afterAll(async () => {
  await db.dropDatabase();
  await client.close();
});
beforeEach(async () => {
  await db.collection("users").deleteMany({});
  await db.collection("userStats").deleteMany({});
});

const addPlayer = async (displayName: string, leaderboard: boolean, stats: object) => {
  const _id = new ObjectId();
  await db.collection("users").insertOne({ _id, displayName, leaderboard, email: `${displayName}@x.com`, name: `Real ${displayName}` });
  await db.collection("userStats").insertOne({ userId: _id, game: "artikel", ...stats });
};

describe("getLeaderboard", () => {
  it("ranks opted-in players by timed score and never leaks other fields", async () => {
    await addPlayer("Ana", true, { bestTimedScore: 30, bestScore: 99 });
    await addPlayer("Ben", true, { bestTimedScore: 45 });
    await addPlayer("Hidden", false, { bestTimedScore: 100 });
    await addPlayer("Cy", true, { bestScore: 80 }); // no timed round yet
    const rows = await getLeaderboard(db, "artikel");
    expect(rows).toEqual([
      { displayName: "Ben", score: 45 },
      { displayName: "Ana", score: 30 },
    ]);
  });
  it("limits the list", async () => {
    for (let i = 1; i <= 5; i++) await addPlayer(`P${i}`, true, { bestTimedScore: i });
    expect(await getLeaderboard(db, "artikel", 3)).toHaveLength(3);
  });
  it("has no board for the Time quiz", () => {
    expect(boardField("time")).toBeNull();
    expect(boardField("artikel")).toBe("bestTimedScore");
    expect(boardField("satzbau")).toBe("bestScore");
  });
});
