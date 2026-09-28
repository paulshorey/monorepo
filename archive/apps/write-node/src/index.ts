import "dotenv/config";
import express from "express";
import cors from "cors";
import { pool } from "./lib/db.js";
import {
  getAggregatorSnapshot,
  getStreamStats,
  getStreamStatus,
  startDatabentoStream,
  stopDatabentoStream,
} from "./stream/tbbo-stream.js";

const app = express();
const port = Number(process.env.PORT) || 8080;
let shuttingDown = false;

app.use(cors());

app.get("/api/v1/health", (_req, res) => {
  res.json(true);
});

app.get("/api/v1/stats", (_req, res) => {
  const aggregator = getAggregatorSnapshot();
  res.json({
    stream: {
      status: getStreamStatus(),
      counters: getStreamStats(),
    },
    aggregator: aggregator ?? { status: "not_started" },
  });
});

const startStreamWithRetry = async () => {
  try {
    await startDatabentoStream();
  } catch (error) {
    console.error("Failed to start Databento stream, retrying in 5s:", error);
    const retryTimer = setTimeout(() => {
      void startStreamWithRetry();
    }, 60_000); // Don't reconnect more than once per minute.
    retryTimer.unref();
  }
};

const server = app.listen(port, "::", () => {
  console.log(`🚀 Market write pipeline running on port ${port}`);
  console.log(`   Environment: ${process.env.RAILWAY_ENVIRONMENT_NAME || "local"}`);
  void startStreamWithRetry();
});

const shutdown = async (signal: string) => {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  console.log(`${signal} received, shutting down gracefully...`);

  server.close();
  await stopDatabentoStream();
  await pool.end();
  process.exit(0);
};

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("unhandledRejection", (reason) => {
  console.error("unhandledRejection:", reason);
});
