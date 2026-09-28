import type { Request } from "express";
import type { LogRowAdd } from "@lib/db-trading/sql/log/types";
import { getCurrentIpAddress } from "@lib/common/nextjs/getCurrentIpAddress";
import { sendToMyselfSMS } from "@lib/common/twillio/sendToMyselfSMS";

type SqlLogAdd = (row: LogRowAdd) => Promise<unknown>;

export const logRequestEvent = async (args: { req: Request; row: LogRowAdd; sqlLogAdd: SqlLogAdd; sendSms?: boolean }) => {
  try {
    const { req, row, sqlLogAdd, sendSms = false } = args;
    const addr = await getCurrentIpAddress({
      getHeader: (name: string) => req.get(name) ?? undefined,
      ip: req.ip,
    });

    await sqlLogAdd({
      ...row,
      stack: {
        ...row.stack,
        ...addr,
      },
    });

    if (sendSms) {
      await sendToMyselfSMS(row.message);
    }
  } catch (error) {
    // Logging is best-effort and should never break request handling.
    console.error("logRequestEvent failed:", error);
  }
};
