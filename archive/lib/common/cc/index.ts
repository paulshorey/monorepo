import { sqlLogAdd } from "@lib/db-trading/sql/log/add";
import { getCurrentIpAddress } from "../nextjs/getCurrentIpAddress";
import { sendToMyselfSMS } from "../twillio/sendToMyselfSMS";
import { consoleAction } from "./lib/consoleAction";

const addAddressToStack = async (stack: Record<string, any>) => {
  const addr = await getCurrentIpAddress();
  return { ...stack, ...addr };
};

const persistLog = async (name: "log" | "info" | "warn" | "error", message: string, stack: Record<string, any>, sendSms = false) => {
  await sqlLogAdd({ name, message, stack: await addAddressToStack(stack) });
  if (sendSms) {
    await sendToMyselfSMS(message);
  }
};

/**
 * A logging utility for both server-side and client-side operations.
 *
 * The `cc` object (short for "cloud console") provides a set of methods for
 * logging messages at different levels (log, info, warn, error). It wraps
 * the `consoleAction` for immediate feedback in the console and `sqlLogAdd`
 * to persist logs to the database.
 *
 * The `warn` and `error` levels are configured to trigger an SMS notification
 * in addition to database logging, providing immediate alerts for critical issues.
 */
export const cc = {
  log: async function (message: string, stack: Record<string, any> = {}) {
    try {
      consoleAction("log", message, stack);
      await persistLog("log", message, stack);
    } catch (e) {
      console.error(e);
    }
  },
  info: async function (message: string, stack: Record<string, any> = {}) {
    try {
      consoleAction("info", message, stack);
      await persistLog("info", message, stack);
    } catch (e) {
      console.error(e);
    }
  },
  warn: async function (message: string, stack: Record<string, any> = {}) {
    try {
      consoleAction("warn", message, stack);
      await persistLog("warn", message, stack, true);
    } catch (e) {
      console.error(e);
    }
  },
  error: async function (message: string, stack: Record<string, any> = {}) {
    try {
      consoleAction("error", message, stack);
      await persistLog("error", message, stack, true);
    } catch (e) {
      console.error(e);
    }
  },
};
