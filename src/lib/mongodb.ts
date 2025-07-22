import { Db, MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || "rankrunner";

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    console.log("Using cached database instance.");
    return { client: cachedClient, db: cachedDb };
  }

  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined in .env.local. Please add it.");
  }

  console.log("No cached instance found. Creating new connection to MongoDB.");
  
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log("Successfully connected to MongoDB Atlas.");

    const db = client.db(MONGODB_DB);

    cachedClient = client;
    cachedDb = db;

    return { client, db };
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    // In case of a connection error, we'll return nulls and let the actions handle it.
    // This prevents the app from crashing.
    return { client: null, db: null };
  }
}
