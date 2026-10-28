
import { MongoClient, type Db } from "mongodb";

const dbName = process.env.MONGODB_DB_NAME || "marine_clinic_care";

const globalForMongo = globalThis as typeof globalThis & {
  mongoClientPromise?: Promise<MongoClient>;
};

function getMongoClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Missing MONGODB_URI. Set it in your local environment.");
  }

  globalForMongo.mongoClientPromise ??= new MongoClient(uri).connect();
  return globalForMongo.mongoClientPromise;
}

export async function getDatabase(): Promise<Db> {
  const client = await getMongoClientPromise();
  return client.db(dbName);
}
