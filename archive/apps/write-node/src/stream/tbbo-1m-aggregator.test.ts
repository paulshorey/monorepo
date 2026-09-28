import assert from "node:assert/strict";
import test from "node:test";

process.env.TIMESCALE_DB_URL ??= "postgres://test:test@localhost:5432/test";

const { Tbbo1mAggregator } = await import("./tbbo-1m-aggregator.js");

test("flushCompleted retries queued hourly writes during idle periods", async () => {
  let flushCompletedCalls = 0;

  const aggregator = new Tbbo1mAggregator({
    queryable: {
      query: async <Row = unknown>() => ({ rows: [] as Row[] }),
    },
    writeCandlesFn: async () => {},
    hourlyAggregator: {
      initialize: async () => {},
      addBaseCandles: () => 0,
      flushCompleted: async () => {
        flushCompletedCalls++;
      },
      flushAll: async () => {},
    },
  });

  await aggregator.flushCompleted();

  assert.equal(flushCompletedCalls, 1);
});
