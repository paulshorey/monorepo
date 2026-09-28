import type { Request, Response } from "express";
import { sqlLogAdd } from "@lib/db-trading/sql/log/add";
import { formatResponse, getQueryString } from "@/src/lib/http.js";
import { logRequestEvent } from "@/src/lib/logging.js";
import type { StrengthWhere } from "@/src/types/strength.js";
import type { StrengthRowGet } from "@/src/types/strength.js";

type GetStrengthRows = (where: StrengthWhere) => Promise<StrengthRowGet[]>;

export const createGetTradingView = (deps: { getStrengthRows: GetStrengthRows }) => {
  const { getStrengthRows } = deps;
  return async (req: Request, res: Response) => {
    try {
      const ticker = getQueryString(req.query.ticker);
      const timenow_gt = getQueryString(req.query.timenow_gt);
      const timenow_lt = getQueryString(req.query.timenow_lt);
      const limitString = getQueryString(req.query.limit);

      const where: StrengthWhere = {
        limit: 1000,
      };
      if (ticker) where.ticker = ticker;
      if (timenow_gt) where.timenow_gt = timenow_gt;
      if (timenow_lt) where.timenow_lt = timenow_lt;
      if (limitString) {
        const parsedLimit = Number.parseInt(limitString, 10);
        if (!Number.isNaN(parsedLimit)) {
          where.limit = parsedLimit;
        }
      }

      if (!ticker) {
        const message = "GET /api/v1/tradingview missing required fields: ticker";
        await logRequestEvent({
          req,
          sqlLogAdd,
          sendSms: true,
          row: {
            name: "warn",
            message,
            stack: { where },
          },
        });
      }

      const rows = await getStrengthRows(where);

      return formatResponse(res, {
        ok: true,
        rows: rows || [],
      });
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error("GET /api/v1/tradingview error:", err);
      return formatResponse(
        res,
        {
          ok: false,
          error: err.message || "Failed to fetch strength data",
        },
        500,
      );
    }
  };
};
