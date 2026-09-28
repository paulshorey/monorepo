import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_GLOBEX_MARKET_SESSION_CONFIG,
  getSessionProfileForTicker,
  MARKET_SESSION_OPEN_WINDOWS_ENV_VAR,
  MARKET_SESSION_PROFILE_ENV_VAR,
  MARKET_SESSION_TIME_ZONE_ENV_VAR,
  SESSION_PROFILES,
} from "./market-session-config.js";
import {
  getConfiguredMarketSession,
  getConfiguredMarketSessionForTicker,
  WeeklyMarketSession,
  collectOpenBucketTimesBetween,
} from "./market-session.js";

test("Globex session follows winter and summer DST boundaries in the configured time zone", () => {
  const session = new WeeklyMarketSession(DEFAULT_GLOBEX_MARKET_SESSION_CONFIG);

  assert.equal(session.isOpenAt(new Date("2026-01-05T21:59:59.000Z")), true);
  assert.equal(session.isOpenAt(new Date("2026-01-05T22:00:00.000Z")), false);
  assert.equal(session.isOpenAt(new Date("2026-01-05T22:59:59.000Z")), false);
  assert.equal(session.isOpenAt(new Date("2026-01-05T23:00:00.000Z")), true);

  assert.equal(session.isOpenAt(new Date("2026-03-09T20:59:59.000Z")), true);
  assert.equal(session.isOpenAt(new Date("2026-03-09T21:00:00.000Z")), false);
  assert.equal(session.isOpenAt(new Date("2026-03-09T21:59:59.000Z")), false);
  assert.equal(session.isOpenAt(new Date("2026-03-09T22:00:00.000Z")), true);
});

test("next open calculation skips closed periods using local session time", () => {
  const session = new WeeklyMarketSession(DEFAULT_GLOBEX_MARKET_SESSION_CONFIG);

  const nextWinterOpenMs = session.getNextOpenMs(new Date("2026-01-05T22:15:00.000Z").getTime());
  assert.equal(new Date(nextWinterOpenMs).toISOString(), "2026-01-05T23:00:00.000Z");

  const nextSummerOpenMs = session.getNextOpenMs(new Date("2026-03-09T21:15:00.000Z").getTime());
  assert.equal(new Date(nextSummerOpenMs).toISOString(), "2026-03-09T22:00:00.000Z");
});

test("session helpers support non-US time zones and multiple daily windows", () => {
  const session = new WeeklyMarketSession(SESSION_PROFILES.tokyo_daytime);

  assert.equal(session.isOpenAt(new Date("2026-01-05T00:30:00.000Z")), true);
  assert.equal(session.isOpenAt(new Date("2026-01-05T03:00:00.000Z")), false);
  assert.equal(session.isOpenAt(new Date("2026-01-05T04:30:00.000Z")), true);

  const nextOpenMs = session.getNextOpenMs(new Date("2026-01-05T03:00:00.000Z").getTime());
  assert.equal(new Date(nextOpenMs).toISOString(), "2026-01-05T03:30:00.000Z");

  const openBuckets = collectOpenBucketTimesBetween(
    new Date("2026-01-05T03:00:00.000Z").getTime(),
    new Date("2026-01-05T04:30:00.000Z").getTime(),
    30 * 60 * 1000,
    10,
    session,
  );
  assert.deepEqual(
    openBuckets.bucketTimes.map((timeMs) => new Date(timeMs).toISOString()),
    ["2026-01-05T03:30:00.000Z", "2026-01-05T04:00:00.000Z"],
  );
});

test("configured session can select a named profile and still allow env overrides", () => {
  const tokyoSession = getConfiguredMarketSession({
    [MARKET_SESSION_PROFILE_ENV_VAR]: "tokyo_daytime",
  });
  assert.equal(tokyoSession.describe(), new WeeklyMarketSession(SESSION_PROFILES.tokyo_daytime).describe());

  const overriddenSession = getConfiguredMarketSession({
    [MARKET_SESSION_PROFILE_ENV_VAR]: "tokyo_daytime",
    [MARKET_SESSION_TIME_ZONE_ENV_VAR]: "UTC",
    [MARKET_SESSION_OPEN_WINDOWS_ENV_VAR]: "Mon 00:00-Mon 01:00",
  });
  assert.equal(overriddenSession.isOpenAt(new Date("2026-01-05T00:30:00.000Z")), true);
  assert.equal(overriddenSession.isOpenAt(new Date("2026-01-05T02:00:00.000Z")), false);
});

test("configured session resolves named profiles from ticker mappings", () => {
  assert.equal(getSessionProfileForTicker("ES"), "globex");
  assert.equal(getSessionProfileForTicker("NK"), "tokyo_daytime");
  assert.equal(getSessionProfileForTicker("UNKNOWN"), null);

  const esSession = getConfiguredMarketSessionForTicker("ES");
  const nkSession = getConfiguredMarketSessionForTicker("NK");
  assert.equal(esSession.describe(), new WeeklyMarketSession(SESSION_PROFILES.globex).describe());
  assert.equal(nkSession.describe(), new WeeklyMarketSession(SESSION_PROFILES.tokyo_daytime).describe());
});

test("configured session still honors an explicit fallback when no profile env var is set", () => {
  const fallbackSession = getConfiguredMarketSession(
    {},
    {
      timeZone: "UTC",
      weeklyLocalWindows: [{ startDay: "Mon", startTime: "00:00", endDay: "Mon", endTime: "01:00" }],
      label: "Fallback only",
    },
  );

  assert.equal(fallbackSession.isOpenAt(new Date("2026-01-05T00:30:00.000Z")), true);
  assert.equal(fallbackSession.isOpenAt(new Date("2026-01-05T02:00:00.000Z")), false);
});

test("configured session rejects unknown named profiles", () => {
  assert.throws(
    () =>
      getConfiguredMarketSession({
        [MARKET_SESSION_PROFILE_ENV_VAR]: "does_not_exist",
      }),
    /Unknown MARKET_SESSION_PROFILE/,
  );
});
