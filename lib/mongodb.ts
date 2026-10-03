import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI is not set. Add it to .env.local (see .env.example).");

// Cache the client on globalThis so dev hot reloads and serverless invocations reuse one connection.
const globalForMongo = globalThis as unknown as { _mongoClient?: Promise<MongoClient> };
const clientPromise = (globalForMongo._mongoClient ??= new MongoClient(uri).connect());

export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  return client.db(process.env.MONGODB_DB ?? "german-games");
}
