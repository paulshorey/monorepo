import type { MarketSessionConfig } from "./market-session.js";

export const MARKET_SESSION_PROFILE_ENV_VAR = "MARKET_SESSION_PROFILE";
export const MARKET_SESSION_TIME_ZONE_ENV_VAR = "MARKET_SESSION_TIME_ZONE";
export const MARKET_SESSION_OPEN_WINDOWS_ENV_VAR = "MARKET_SESSION_OPEN_WINDOWS";

/**
 * Default session profile for CME Globex-style futures traded in Chicago time.
 *
 * This remains intentionally simple for now: recurring weekly open windows
 * without holiday overrides. Future profiles can be added here incrementally.
 */
export const DEFAULT_GLOBEX_MARKET_SESSION_CONFIG: MarketSessionConfig = {
  timeZone: "America/Chicago",
  weeklyLocalWindows: [
    { startDay: "Sun", startTime: "17:00", endDay: "Mon", endTime: "16:00" },
    { startDay: "Mon", startTime: "17:00", endDay: "Tue", endTime: "16:00" },
    { startDay: "Tue", startTime: "17:00", endDay: "Wed", endTime: "16:00" },
    { startDay: "Wed", startTime: "17:00", endDay: "Thu", endTime: "16:00" },
    { startDay: "Thu", startTime: "17:00", endDay: "Fri", endTime: "16:00" },
  ],
  label: "CME Globex",
};

/**
 * Small starter set of named session profiles.
 *
 * Keep this list intentionally compact for now and expand it as new markets or
 * research workflows need distinct trading calendars.
 */
export const SESSION_PROFILES = {
  globex: DEFAULT_GLOBEX_MARKET_SESSION_CONFIG,
  tokyo_daytime: {
    timeZone: "Asia/Tokyo",
    weeklyLocalWindows: [
      { startDay: "Mon", startTime: "09:00", endDay: "Mon", endTime: "11:30" },
      { startDay: "Mon", startTime: "12:30", endDay: "Mon", endTime: "15:00" },
      { startDay: "Tue", startTime: "09:00", endDay: "Tue", endTime: "11:30" },
      { startDay: "Tue", startTime: "12:30", endDay: "Tue", endTime: "15:00" },
      { startDay: "Wed", startTime: "09:00", endDay: "Wed", endTime: "11:30" },
      { startDay: "Wed", startTime: "12:30", endDay: "Wed", endTime: "15:00" },
      { startDay: "Thu", startTime: "09:00", endDay: "Thu", endTime: "11:30" },
      { startDay: "Thu", startTime: "12:30", endDay: "Thu", endTime: "15:00" },
      { startDay: "Fri", startTime: "09:00", endDay: "Fri", endTime: "11:30" },
      { startDay: "Fri", startTime: "12:30", endDay: "Fri", endTime: "15:00" },
    ],
    label: "Tokyo daytime",
  },
} as const satisfies Record<string, MarketSessionConfig>;

export type MarketSessionProfileName = keyof typeof SESSION_PROFILES;
export const DEFAULT_MARKET_SESSION_PROFILE: MarketSessionProfileName = "globex";
export const DEFAULT_MARKET_SESSION_CONFIG = DEFAULT_GLOBEX_MARKET_SESSION_CONFIG;

/**
 * Per-ticker profile assignments for the canonical writer.
 *
 * Unlisted tickers fall back to the process-level default profile (or env
 * override). Keep this map small and explicit; extend it only as new markets
 * are added to the write pipeline.
 */
export const SESSION_PROFILE_BY_TICKER: Partial<Record<string, MarketSessionProfileName>> = {
  ES: "globex",
  NQ: "globex",
  RTY: "globex",
  YM: "globex",
  CL: "globex",
  GC: "globex",
  SI: "globex",
  HG: "globex",
  NK: "tokyo_daytime",
};

export function getSessionProfileForTicker(ticker: string): MarketSessionProfileName | null {
  const normalizedTicker = ticker.trim().toUpperCase();
  if (!normalizedTicker) {
    return null;
  }

  return SESSION_PROFILE_BY_TICKER[normalizedTicker] ?? null;
}
