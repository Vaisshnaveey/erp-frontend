import 'dotenv/config';
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// HARDCODED DATABASE URL for hackathon demo
const DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres:12345@localhost:5432/edustack";

export const pool = new Pool({
  connectionString: DATABASE_URL,
});

export const db = drizzle(pool);
export default db;