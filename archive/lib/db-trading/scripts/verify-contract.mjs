import { execFileSync } from "node:child_process";
import process from "node:process";
import { Client } from "pg";

if (!process.env.TRADING_DB_URL) {
  throw new Error("TRADING_DB_URL is required");
}

function run(command, args) {
  execFileSync(command, args, {
    cwd: process.cwd(),
    env: process.env,
    stdio: "inherit",
  });
}

function getScalar(rows, column) {
  return rows[0]?.[column];
}

run("node", ["scripts/migrate.mjs"]);
run("bash", ["scripts/snapshot-schema.sh"]);
run("node", ["scripts/generate-types.mjs"]);

const client = new Client({ connectionString: process.env.TRADING_DB_URL });
await client.connect();

const tablesResult = await client.query(`
  SELECT table_name
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN ('log_v1', 'order_v1', 'strength_v1')
  ORDER BY table_name
`);

const existingTables = new Set(tablesResult.rows.map((row) => row.table_name));
for (const table of ["log_v1", "order_v1", "strength_v1"]) {
  if (!existingTables.has(table)) {
    throw new Error(`Missing expected table: ${table}`);
  }
}

const constraintResult = await client.query(`
  SELECT COUNT(*)::int AS count
  FROM pg_constraint
  WHERE conname = 'strength_v1_ticker_timenow_unique'
`);

if (getScalar(constraintResult.rows, "count") !== 1) {
  throw new Error("Missing expected unique constraint: strength_v1_ticker_timenow_unique");
}

await client.end();

run("git", [
  "diff",
  "--exit-code",
  "--",
  "schema/current.sql",
  "generated/typescript/db-types.ts",
  "generated/contracts/db-schema.json",
]);

console.log("Trading DB contract verification passed");
