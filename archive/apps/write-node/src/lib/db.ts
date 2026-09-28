import { getDb } from "@lib/db-timescale";

export const pool = getDb();

// Log which database URL is being used (without password)
const dbUrl = process.env.TIMESCALE_DB_URL || "";
const safeDbUrl = dbUrl.replace(/:[^:@]+@/, ":***@");
console.log(`Database URL: ${safeDbUrl}`);
