import { Pool } from "pg";

let pool: Pool;

export const getDb = () => {
  if (!pool) {
    const connectionString = process.env.TRADING_DB_URL;
    if (!connectionString) {
      throw new Error("TRADING_DB_URL environment variable not set");
    }

    pool = new Pool({
      connectionString,
      max: Number(process.env.PG_POOL_MAX || 10),
      idleTimeoutMillis: Number(process.env.PG_IDLE_TIMEOUT_MS || 30_000),
      connectionTimeoutMillis: Number(process.env.PG_CONNECTION_TIMEOUT_MS || 10_000),
      keepAlive: true,
      keepAliveInitialDelayMillis: Number(process.env.PG_KEEPALIVE_INITIAL_DELAY_MS || 10_000),
    });

    // Prevent idle-client pool errors from crashing the process.
    pool.on("error", (err) => {
      console.error("Postgres pool idle client error:", err);
    });
  }
  return pool;
};
