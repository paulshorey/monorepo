import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { Client } from "pg";

const connectionString = process.env.TRADING_DB_URL;
if (!connectionString) {
  throw new Error("TRADING_DB_URL is required");
}

const migrationsDir = path.resolve("migrations");
const files = (await fs.readdir(migrationsDir))
  .filter((name) => name.endsWith(".sql"))
  .filter((name) => name.includes("__baseline"))
  .sort();

if (files.length === 0) {
  throw new Error("No baseline migration files found");
}

const client = new Client({ connectionString });
await client.connect();

await client.query(`
  CREATE TABLE IF NOT EXISTS public.schema_migrations_cursor (
    filename text PRIMARY KEY,
    checksum text NOT NULL,
    applied_at timestamptz NOT NULL DEFAULT now()
  );
`);

for (const file of files) {
  const absolute = path.join(migrationsDir, file);
  const sql = await fs.readFile(absolute, "utf8");
  const checksum = crypto.createHash("sha256").update(sql).digest("hex");
  await client.query(
    `
      INSERT INTO public.schema_migrations_cursor(filename, checksum)
      VALUES ($1, $2)
      ON CONFLICT (filename) DO NOTHING
    `,
    [file, checksum],
  );
  console.log(`baseline mark ${file}`);
}

await client.end();
console.log("Baseline complete");
