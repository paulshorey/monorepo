/**
 * Time-zone aware recurring market-session helpers.
 *
 * Sessions are defined as weekly open windows in the market's local time zone.
 * This keeps gap handling aligned with the exchange session calendar instead of
 * hardcoding UTC close/reopen hours that break during daylight saving changes.
 */

import {
  DEFAULT_MARKET_SESSION_PROFILE,
  DEFAULT_GLOBEX_MARKET_SESSION_CONFIG,
  getSessionProfileForTicker,
  MARKET_SESSION_PROFILE_ENV_VAR,
  MARKET_SESSION_OPEN_WINDOWS_ENV_VAR,
  MARKET_SESSION_TIME_ZONE_ENV_VAR,
  SESSION_PROFILES,
} from "./market-session-config.js";

const MINUTES_PER_DAY = 24 * 60;
const MINUTES_PER_WEEK = 7 * MINUTES_PER_DAY;
const SEARCH_WINDOW_MS = 36 * 60 * 60 * 1000;
const SEARCH_STEP_MS = 60 * 1000;

const DAY_NAME_TO_INDEX = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
} as const;

const INDEX_TO_DAY_NAME = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

type SessionDayName = keyof typeof DAY_NAME_TO_INDEX;

interface LocalDateParts {
  year: number;
  month: number;
  day: number;
}

interface LocalDateTimeParts extends LocalDateParts {
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
}

interface ZonedDateTimeParts extends LocalDateTimeParts {
  weekday: number;
}

interface NormalizedWeeklySessionWindow {
  startDay: number;
  startMinute: number;
  endDay: number;
  endMinute: number;
  startMinuteOfWeek: number;
  endMinuteOfWeek: number;
}

export interface OpenBucketCollection {
  bucketTimes: number[];
  openBucketCount: number;
  exceeded: boolean;
}

export interface WeeklySessionWindowInput {
  startDay: number | SessionDayName | Uppercase<SessionDayName> | Capitalize<SessionDayName>;
  startTime: string;
  endDay: number | SessionDayName | Uppercase<SessionDayName> | Capitalize<SessionDayName>;
  endTime: string;
}

export interface MarketSessionConfig {
  timeZone: string;
  weeklyLocalWindows: WeeklySessionWindowInput[];
  label?: string;
}

export { DEFAULT_GLOBEX_MARKET_SESSION_CONFIG } from "./market-session-config.js";
export type MarketSessionResolver = (ticker: string) => WeeklyMarketSession;

const zonedDateTimeFormatterCache = new Map<string, Intl.DateTimeFormat>();

function getZonedDateTimeFormatter(timeZone: string): Intl.DateTimeFormat {
  const cached = zonedDateTimeFormatterCache.get(timeZone);
  if (cached) {
    return cached;
  }

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    weekday: "short",
    hourCycle: "h23",
  });
  zonedDateTimeFormatterCache.set(timeZone, formatter);
  return formatter;
}

function normalizeDay(day: WeeklySessionWindowInput["startDay"]): number {
  if (typeof day === "number") {
    if (day < 0 || day > 6 || !Number.isInteger(day)) {
      throw new Error(`Invalid session weekday index "${day}". Expected integer 0-6.`);
    }
    return day;
  }

  const normalized = day.toLowerCase().slice(0, 3) as SessionDayName;
  const value = DAY_NAME_TO_INDEX[normalized];
  if (value === undefined) {
    throw new Error(`Invalid session weekday "${day}". Expected Sun/Mon/Tue/Wed/Thu/Fri/Sat.`);
  }
  return value;
}

function parseTimeOfDay(time: string): number {
  const match = /^(\d{2}):(\d{2})$/.exec(time.trim());
  if (!match) {
    throw new Error(`Invalid session time "${time}". Expected HH:MM in 24-hour format.`);
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) {
    throw new Error(`Invalid session time "${time}". Expected HH:MM in 24-hour format.`);
  }

  return hours * 60 + minutes;
}

function formatTimeOfDay(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60)
    .toString()
    .padStart(2, "0");
  const minutes = (totalMinutes % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

function normalizeWeeklySessionWindow(window: WeeklySessionWindowInput): NormalizedWeeklySessionWindow {
  const startDay = normalizeDay(window.startDay);
  const endDay = normalizeDay(window.endDay);
  const startMinute = parseTimeOfDay(window.startTime);
  const endMinute = parseTimeOfDay(window.endTime);

  const startMinuteOfWeek = startDay * MINUTES_PER_DAY + startMinute;
  let endMinuteOfWeek = endDay * MINUTES_PER_DAY + endMinute;
  if (endMinuteOfWeek <= startMinuteOfWeek) {
    endMinuteOfWeek += MINUTES_PER_WEEK;
  }

  return {
    startDay,
    startMinute,
    endDay,
    endMinute,
    startMinuteOfWeek,
    endMinuteOfWeek,
  };
}

function getZonedDateTimeParts(date: Date, timeZone: string): ZonedDateTimeParts {
  const parts = getZonedDateTimeFormatter(timeZone).formatToParts(date);

  let year = 0;
  let month = 0;
  let day = 0;
  let hour = 0;
  let minute = 0;
  let second = 0;
  let weekday = 0;

  for (const part of parts) {
    switch (part.type) {
      case "year":
        year = Number(part.value);
        break;
      case "month":
        month = Number(part.value);
        break;
      case "day":
        day = Number(part.value);
        break;
      case "hour":
        hour = Number(part.value);
        break;
      case "minute":
        minute = Number(part.value);
        break;
      case "second":
        second = Number(part.value);
        break;
      case "weekday":
        weekday = normalizeDay(part.value as WeeklySessionWindowInput["startDay"]);
        break;
      default:
        break;
    }
  }

  return {
    year,
    month,
    day,
    hour,
    minute,
    second,
    millisecond: date.getUTCMilliseconds(),
    weekday,
  };
}

function getWeekMinute(parts: ZonedDateTimeParts): number {
  return (
    parts.weekday * MINUTES_PER_DAY +
    parts.hour * 60 +
    parts.minute +
    parts.second / 60 +
    parts.millisecond / 60000
  );
}

function addDays(localDate: LocalDateParts, dayOffset: number): LocalDateParts {
  const date = new Date(Date.UTC(localDate.year, localDate.month - 1, localDate.day));
  date.setUTCDate(date.getUTCDate() + dayOffset);
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  };
}

function getTimeZoneOffsetMs(utcMs: number, timeZone: string): number {
  const utcDate = new Date(utcMs);
  const zoned = getZonedDateTimeParts(utcDate, timeZone);
  const interpretedAsUtc = Date.UTC(
    zoned.year,
    zoned.month - 1,
    zoned.day,
    zoned.hour,
    zoned.minute,
    zoned.second,
    utcDate.getUTCMilliseconds(),
  );

  return interpretedAsUtc - utcMs;
}

function localPartsMatch(utcMs: number, localDateTime: LocalDateTimeParts, timeZone: string): boolean {
  const zoned = getZonedDateTimeParts(new Date(utcMs), timeZone);
  return (
    zoned.year === localDateTime.year &&
    zoned.month === localDateTime.month &&
    zoned.day === localDateTime.day &&
    zoned.hour === localDateTime.hour &&
    zoned.minute === localDateTime.minute &&
    zoned.second === localDateTime.second
  );
}

function resolveLocalDateTimeToUtcMs(localDateTime: LocalDateTimeParts, timeZone: string): number {
  const interpretedAsUtc = Date.UTC(
    localDateTime.year,
    localDateTime.month - 1,
    localDateTime.day,
    localDateTime.hour,
    localDateTime.minute,
    localDateTime.second,
    localDateTime.millisecond,
  );

  let candidateMs = interpretedAsUtc;
  for (let i = 0; i < 4; i++) {
    const offsetMs = getTimeZoneOffsetMs(candidateMs, timeZone);
    const adjustedMs = interpretedAsUtc - offsetMs;
    if (adjustedMs === candidateMs) {
      break;
    }
    candidateMs = adjustedMs;
  }

  if (localPartsMatch(candidateMs, localDateTime, timeZone)) {
    return candidateMs;
  }

  for (let probeMs = interpretedAsUtc - SEARCH_WINDOW_MS; probeMs <= interpretedAsUtc + SEARCH_WINDOW_MS; probeMs += SEARCH_STEP_MS) {
    if (localPartsMatch(probeMs, localDateTime, timeZone)) {
      return probeMs;
    }
  }

  throw new Error(
    `Could not resolve local session time ` +
      `${localDateTime.year}-${String(localDateTime.month).padStart(2, "0")}-${String(localDateTime.day).padStart(2, "0")} ` +
      `${String(localDateTime.hour).padStart(2, "0")}:${String(localDateTime.minute).padStart(2, "0")}` +
      ` in time zone ${timeZone}.`,
  );
}

export class WeeklyMarketSession {
  readonly timeZone: string;
  readonly label?: string;
  readonly weeklyLocalWindows: ReadonlyArray<NormalizedWeeklySessionWindow>;

  constructor(config: MarketSessionConfig) {
    if (config.weeklyLocalWindows.length === 0) {
      throw new Error("Market session requires at least one weekly local window.");
    }

    // Validate the time zone eagerly so bad config fails fast.
    getZonedDateTimeFormatter(config.timeZone);

    this.timeZone = config.timeZone;
    this.label = config.label;
    this.weeklyLocalWindows = config.weeklyLocalWindows.map(normalizeWeeklySessionWindow);
  }

  isOpenAt(input: Date | number): boolean {
    const date = typeof input === "number" ? new Date(input) : input;
    const minuteOfWeek = getWeekMinute(getZonedDateTimeParts(date, this.timeZone));
    const minuteOfWeekNextCycle = minuteOfWeek + MINUTES_PER_WEEK;

    return this.weeklyLocalWindows.some(
      (window) =>
        (minuteOfWeek >= window.startMinuteOfWeek && minuteOfWeek < window.endMinuteOfWeek) ||
        (minuteOfWeekNextCycle >= window.startMinuteOfWeek && minuteOfWeekNextCycle < window.endMinuteOfWeek),
    );
  }

  getNextOpenMs(currentMs: number): number {
    if (this.isOpenAt(currentMs)) {
      return currentMs;
    }

    const currentParts = getZonedDateTimeParts(new Date(currentMs), this.timeZone);
    const currentLocalDate: LocalDateParts = {
      year: currentParts.year,
      month: currentParts.month,
      day: currentParts.day,
    };

    let nextOpenMs = Number.POSITIVE_INFINITY;

    for (let dayOffset = 0; dayOffset <= 7; dayOffset++) {
      const localDate = addDays(currentLocalDate, dayOffset);
      const weekday = new Date(Date.UTC(localDate.year, localDate.month - 1, localDate.day)).getUTCDay();

      for (const window of this.weeklyLocalWindows) {
        if (window.startDay !== weekday) {
          continue;
        }

        const candidateMs = resolveLocalDateTimeToUtcMs(
          {
            ...localDate,
            hour: Math.floor(window.startMinute / 60),
            minute: window.startMinute % 60,
            second: 0,
            millisecond: 0,
          },
          this.timeZone,
        );

        if (candidateMs > currentMs && candidateMs < nextOpenMs) {
          nextOpenMs = candidateMs;
        }
      }
    }

    return Number.isFinite(nextOpenMs) ? nextOpenMs : currentMs;
  }

  collectOpenBucketTimesBetween(
    startMsInclusive: number,
    endMsExclusive: number,
    stepMs: number,
    maxOpenBuckets: number,
  ): OpenBucketCollection {
    const bucketTimes: number[] = [];
    let openBucketCount = 0;
    let currentMs = startMsInclusive;

    while (currentMs < endMsExclusive) {
      if (!this.isOpenAt(currentMs)) {
        const nextOpenMs = this.getNextOpenMs(currentMs);
        currentMs = nextOpenMs > currentMs ? nextOpenMs : currentMs + stepMs;
        continue;
      }

      openBucketCount++;
      if (openBucketCount > maxOpenBuckets) {
        return {
          bucketTimes,
          openBucketCount,
          exceeded: true,
        };
      }

      bucketTimes.push(currentMs);
      currentMs += stepMs;
    }

    return {
      bucketTimes,
      openBucketCount,
      exceeded: false,
    };
  }

  describe(): string {
    const windowText = this.weeklyLocalWindows
      .map(
        (window) =>
          `${INDEX_TO_DAY_NAME[window.startDay]} ${formatTimeOfDay(window.startMinute)}-` +
          `${INDEX_TO_DAY_NAME[window.endDay]} ${formatTimeOfDay(window.endMinute)}`,
      )
      .join(", ");

    return `${this.label ? `${this.label} ` : ""}${this.timeZone} [${windowText}]`;
  }
}

export function parseWeeklySessionWindows(value: string): WeeklySessionWindowInput[] {
  return value
    .split(",")
    .map((segment) => segment.trim())
    .filter(Boolean)
    .map((segment) => {
      const match = /^([A-Za-z]{3})\s+(\d{2}:\d{2})\s*-\s*([A-Za-z]{3})\s+(\d{2}:\d{2})$/.exec(segment);
      if (!match) {
        throw new Error(
          `Invalid ${MARKET_SESSION_OPEN_WINDOWS_ENV_VAR} segment "${segment}". ` +
            `Expected format like "Sun 17:00-Mon 16:00".`,
        );
      }

      return {
        startDay: match[1] as WeeklySessionWindowInput["startDay"],
        startTime: match[2],
        endDay: match[3] as WeeklySessionWindowInput["endDay"],
        endTime: match[4],
      };
    });
}

const configuredSessionCache = new Map<string, WeeklyMarketSession>();

function serializeSessionConfig(config: MarketSessionConfig): string {
  return JSON.stringify({
    label: config.label ?? "",
    timeZone: config.timeZone,
    weeklyLocalWindows: config.weeklyLocalWindows,
  });
}

function getConfiguredSessionSelection(
  ticker: string | null,
  env: NodeJS.ProcessEnv,
  fallback: MarketSessionConfig,
): {
  profileName: string | null;
  baseConfig: MarketSessionConfig;
} {
  const explicitProfileName = env[MARKET_SESSION_PROFILE_ENV_VAR]?.trim() || null;
  if (explicitProfileName) {
    const explicitProfile = SESSION_PROFILES[explicitProfileName as keyof typeof SESSION_PROFILES];
    if (!explicitProfile) {
      throw new Error(
        `Unknown ${MARKET_SESSION_PROFILE_ENV_VAR} "${explicitProfileName}". ` +
          `Expected one of: ${Object.keys(SESSION_PROFILES).join(", ")}.`,
      );
    }

    return {
      profileName: explicitProfileName,
      baseConfig: explicitProfile,
    };
  }

  const tickerProfileName = ticker ? getSessionProfileForTicker(ticker) : null;
  if (tickerProfileName) {
    return {
      profileName: tickerProfileName,
      baseConfig: SESSION_PROFILES[tickerProfileName],
    };
  }

  return {
    profileName: null,
    baseConfig: fallback,
  };
}

export function getConfiguredMarketSessionForTicker(
  ticker: string,
  env: NodeJS.ProcessEnv = process.env,
  fallback: MarketSessionConfig = DEFAULT_GLOBEX_MARKET_SESSION_CONFIG,
): WeeklyMarketSession {
  const normalizedTicker = ticker.trim().toUpperCase();
  const { profileName, baseConfig } = getConfiguredSessionSelection(normalizedTicker, env, fallback);
  const timeZone = env[MARKET_SESSION_TIME_ZONE_ENV_VAR]?.trim() || baseConfig.timeZone;
  const openWindows = env[MARKET_SESSION_OPEN_WINDOWS_ENV_VAR]?.trim();
  const cacheKey =
    `${profileName ?? DEFAULT_MARKET_SESSION_PROFILE}||${normalizedTicker}||${timeZone}||${openWindows ?? ""}||` +
    `${serializeSessionConfig(baseConfig)}`;

  const cachedSession = configuredSessionCache.get(cacheKey);
  if (cachedSession) {
    return cachedSession;
  }

  const weeklyLocalWindows = openWindows ? parseWeeklySessionWindows(openWindows) : baseConfig.weeklyLocalWindows;
  const session = new WeeklyMarketSession({
    timeZone,
    weeklyLocalWindows,
    label: baseConfig.label,
  });
  configuredSessionCache.set(cacheKey, session);
  return session;
}

export function getConfiguredMarketSession(
  env: NodeJS.ProcessEnv = process.env,
  fallback: MarketSessionConfig = DEFAULT_GLOBEX_MARKET_SESSION_CONFIG,
): WeeklyMarketSession {
  return getConfiguredMarketSessionForTicker("__default__", env, fallback);
}

export function getConfiguredMarketSessionResolver(
  env: NodeJS.ProcessEnv = process.env,
  fallback: MarketSessionConfig = DEFAULT_GLOBEX_MARKET_SESSION_CONFIG,
): MarketSessionResolver {
  return (ticker: string) => getConfiguredMarketSessionForTicker(ticker, env, fallback);
}

export function isMarketOpenAt(date: Date, session: WeeklyMarketSession = getConfiguredMarketSession()): boolean {
  return session.isOpenAt(date);
}

export function collectOpenBucketTimesBetween(
  startMsInclusive: number,
  endMsExclusive: number,
  stepMs: number,
  maxOpenBuckets: number,
  session: WeeklyMarketSession = getConfiguredMarketSession(),
): OpenBucketCollection {
  return session.collectOpenBucketTimesBetween(startMsInclusive, endMsExclusive, stepMs, maxOpenBuckets);
}
