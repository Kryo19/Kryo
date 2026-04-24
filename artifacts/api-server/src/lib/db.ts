import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

const { Pool } = pg;

const dbUrl = process.env.DATABASE_URL;
console.log("DATABASE_URL being used:", dbUrl?.substring(0, 50) + "...");

if (!dbUrl) {
  throw new Error("DATABASE_URL is required.");
}

const pool = new Pool({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false },
});

pool.on("error", (err) => {
  console.error("Database pool error:", err.message);
});

export const db = drizzle(pool);

