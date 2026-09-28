import { describe, it } from "node:test";
import assert from "node:assert";
import request from "supertest";
import { createApp } from "@/src/index.js";
import {
  mockInvalidPostBody,
  mockValidPostBody,
  mockValidStrengthData,
  mockStrengthAddResult,
} from "@/src/test/mockData.js";

const noOpSqlLogAdd = async (): Promise<null | undefined> => null;

describe("POST /api/v1/tradingview", () => {
  it("returns 400 with Invalid strengthData when template keys are not replaced", async () => {
    const app = createApp({ sqlLogAdd: noOpSqlLogAdd });

    const res = await request(app)
      .post("/api/v1/tradingview")
      .set("Content-Type", "text/plain")
      .send(mockInvalidPostBody);

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.ok, false);
    assert.strictEqual(res.body.error, "Invalid strengthData");
    assert.strictEqual(res.body.status, 400);
  });

  it("returns 200 with success payload when valid plain text is sent", async () => {
    const mockStrengthAdd = async () => mockStrengthAddResult;
    const app = createApp({ strengthAdd: mockStrengthAdd, sqlLogAdd: noOpSqlLogAdd });

    const res = await request(app)
      .post("/api/v1/tradingview")
      .set("Content-Type", "text/plain")
      .send(mockValidPostBody)
      .expect(200);

    assert.strictEqual(res.body.ok, true);
    assert.strictEqual(res.body.message, "Strength data saved successfully");
    assert.strictEqual(res.body.resultId, 39163053);
    assert.strictEqual(res.body.status, 200);

    const data = res.body.data as Record<string, unknown>;
    assert.strictEqual(data.ticker, mockValidStrengthData.ticker);
    assert.strictEqual(data.interval, mockValidStrengthData.interval);
    assert.strictEqual(data.strength, mockValidStrengthData.strength);
    assert.strictEqual(data.volume, mockValidStrengthData.volume);
    assert.strictEqual(data.price, mockValidStrengthData.price);
  });
});
