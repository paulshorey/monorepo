import type { Request, Response } from "express";
import { sqlLogAdd as sqlLogAddReal } from "@lib/db-trading/sql/log/add";
import { formatResponse } from "@/src/lib/http.js";
import { logRequestEvent } from "@/src/lib/logging.js";
import { parseStrengthText } from "@/src/lib/strength.js";
import type { StrengthDataAdd } from "@/src/types/strength.js";
import { sendToMyselfSMS } from "@lib/common/twillio/sendToMyselfSMS";

type StrengthAdd = (data: StrengthDataAdd) => Promise<{ id: number }>;
type SqlLogAdd = typeof sqlLogAddReal;

export const createPostTradingView = (deps: { strengthAdd: StrengthAdd; sqlLogAdd?: SqlLogAdd }) => {
  const { strengthAdd, sqlLogAdd = sqlLogAddReal } = deps;
  return async (req: Request, res: Response) => {
    try {
      const bodyText = typeof req.body === "string" ? req.body : "";
      const strengthData = parseStrengthText(bodyText);

      if (strengthData?.strength === undefined || strengthData?.interval === undefined || strengthData?.ticker === undefined) {
        await sendToMyselfSMS(bodyText.slice(0, 500));
        // const message = "POST /api/v1/tradingview missing required fields: ticker, interval, strength";
        // await logRequestEvent({
        //   req,
        //   sqlLogAdd,
        //   sendSms: false,
        //   row: {
        //     name: "warn",
        //     message,
        //     stack: {
        //       bodyText: bodyText.slice(0, 500),
        //     },
        //   },
        // });
        return formatResponse(
          res,
          {
            ok: false,
            error: "Missing required fields: ticker, interval, strength",
          },
          400,
        );
      }

      if (strengthData.strength === null || strengthData.interval === null || strengthData.ticker === null) {
        const message = "POST /api/v1/tradingview invalid strengthData payload";
        await logRequestEvent({
          req,
          sqlLogAdd,
          sendSms: false,
          row: {
            name: "warn",
            message,
            stack: {
              bodyText: bodyText.slice(0, 500),
            },
          },
        });
        return formatResponse(
          res,
          {
            ok: false,
            error: "Invalid strengthData",
          },
          400,
        );
      }

      const result = await strengthAdd(strengthData);

      return formatResponse(res, {
        ok: true,
        message: "Strength data saved successfully",
        resultId: result?.id,
        data: strengthData,
      });
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      await logRequestEvent({
        req,
        sqlLogAdd,
        sendSms: true,
        row: {
          name: "error",
          message: err.message,
          stack: {
            stack: err.stack,
          },
        },
      });
      console.error("POST /api/v1/tradingview error:", err);
      return formatResponse(
        res,
        {
          ok: false,
          error: err.message,
        },
        400,
      );
    }
  };
};
