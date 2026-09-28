import "dotenv/config";
import { getDb } from "@lib/db-trading";
import cors from "cors";
import express from "express";
import { formatResponse } from "./lib/http.js";
import { Router } from "express";
import { createGetTradingView } from "./api/v1/tradingview/get.js";
import { createPostTradingView } from "./api/v1/tradingview/post.js";
import { getStrengthRows, strengthAdd } from "./lib/strength.js";

export function createApp(options?: {
  getStrengthRows?: typeof getStrengthRows;
  strengthAdd?: typeof strengthAdd;
  sqlLogAdd?: typeof import("@lib/db-trading/sql/log/add").sqlLogAdd;
}) {
  const getStrengthRowsFn = options?.getStrengthRows ?? getStrengthRows;
  const strengthAddFn = options?.strengthAdd ?? strengthAdd;
  const sqlLogAddFn = options?.sqlLogAdd;
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || "256kb" }));

  app.get("/api/v1/health", (_req, res) => {
    formatResponse(res, { ok: true });
  });

  const tradingViewRouter = Router();
  tradingViewRouter.get("/", createGetTradingView({ getStrengthRows: getStrengthRowsFn }));
  tradingViewRouter.post(
    "/",
    express.text({
      // TradingView webhooks can send plain text with inconsistent content-type headers.
      type: () => true,
      limit: process.env.TRADINGVIEW_BODY_LIMIT || "64kb",
    }),
    createPostTradingView({ strengthAdd: strengthAddFn, ...(sqlLogAddFn && { sqlLogAdd: sqlLogAddFn }) }),
  );
  app.use("/api/v1/tradingview", tradingViewRouter);

  app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const err = error as { type?: string; message?: string };

    if (err?.type === "request.aborted") {
      return formatResponse(res, { ok: false, error: "Request was aborted by client" }, 400);
    }

    if (err?.type === "entity.too.large") {
      return formatResponse(res, { ok: false, error: "Request body is too large" }, 413);
    }

    if (err?.type === "entity.parse.failed") {
      return formatResponse(res, { ok: false, error: "Invalid request body" }, 400);
    }

    console.error("Unhandled express error:", err);
    return formatResponse(res, { ok: false, error: "Internal server error" }, 500);
  });

  return app;
}

// START - only when run directly, not when imported for tests
if (process.env.NODE_ENV !== "test") {
  const app = createApp();
  const port = Number(process.env.PORT) || 3000;
  const server = app.listen(port, "0.0.0.0", () => {
    console.log(`TradingView API server running on port ${port}`);
  });

  let shuttingDown = false;
  const shutdown = async (reason: string, exitCode: number) => {
    if (shuttingDown) {
      return;
    }
    shuttingDown = true;
    console.error(`Shutting down TradingView API server (${reason})`);

    const forceCloseTimer = setTimeout(() => {
      console.error("Forced shutdown timeout reached");
      process.exit(exitCode);
    }, 10_000);
    forceCloseTimer.unref();

    server.close(async () => {
      try {
        await getDb().end();
      } catch (error) {
        console.error("Error closing Postgres pool during shutdown:", error);
      } finally {
        clearTimeout(forceCloseTimer);
        process.exit(exitCode);
      }
    });
  };

  process.on("SIGTERM", () => {
    void shutdown("SIGTERM", 0);
  });
  process.on("SIGINT", () => {
    void shutdown("SIGINT", 0);
  });
  process.on("uncaughtException", (error) => {
    console.error("uncaughtException:", error);
    void shutdown("uncaughtException", 1);
  });
  process.on("unhandledRejection", (reason) => {
    console.error("unhandledRejection:", reason);
    // Keep the API alive on transient async failures (e.g. temporary DB outage).
  });
}
