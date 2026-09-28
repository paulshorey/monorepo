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
const files = (await fs.readdir(migrationsDir)).filter((name) => name.endsWith(".sql")).sort();

const client = new Client({ connectionString });
await client.connect();

function sanitizeExecutableSql(sql) {
  return sql
    .split(/\r?\n/)
    .filter((line) => !line.startsWith("\\"))
    .filter((line) => line.trim() !== "CREATE SCHEMA public;")
    .filter((line) => line.trim() !== "COMMENT ON SCHEMA public IS 'standard public schema';")
    .join("\n");
}

function shouldUseTransaction(sql) {
  return !sql.split(/\r?\n/).some((line) => line.trim() === "-- cursor:no-transaction");
}

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
  const executableSql = sanitizeExecutableSql(sql);
  const checksum = crypto.createHash("sha256").update(sql).digest("hex");
  const useTransaction = shouldUseTransaction(sql);

  const existing = await client.query("SELECT checksum FROM public.schema_migrations_cursor WHERE filename = $1", [file]);

  if (existing.rowCount > 0) {
    const current = existing.rows[0].checksum;
    if (current !== checksum) {
      throw new Error(`Checksum mismatch for applied migration ${file}`);
    }
    console.log(`skip ${file}`);
    continue;
  }

  console.log(`apply ${file}`);
  if (useTransaction) {
    await client.query("BEGIN");
    try {
      if (executableSql.trim()) {
        await client.query(executableSql);
      }
      await client.query("INSERT INTO public.schema_migrations_cursor(filename, checksum) VALUES ($1, $2)", [file, checksum]);
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
    continue;
  }

  if (executableSql.trim()) {
    await client.query(executableSql);
  }
  await client.query("INSERT INTO public.schema_migrations_cursor(filename, checksum) VALUES ($1, $2)", [file, checksum]);
}

await client.end();
console.log("Migrations complete");
