import { describe, it } from "node:test";
import assert from "node:assert";
import request from "supertest";
import { createApp } from "@/src/index.js";
import { mockStrengthRows } from "@/src/test/mockData.js";

describe("GET /api/v1/tradingview", () => {
  it("returns ok: true and rows array with expected structure", async () => {
    const mockGetStrengthRows = async () => mockStrengthRows;
    const app = createApp({ getStrengthRows: mockGetStrengthRows });

    const res = await request(app).get("/api/v1/tradingview").query({ ticker: "RTY1!" }).expect(200);

    assert.strictEqual(res.body.ok, true);
    assert.strictEqual(res.body.status, 200);
    assert.ok(Array.isArray(res.body.rows));

    type Row = Record<string, unknown>;
    const rows = res.body.rows as Row[];
    assert.ok(rows.length >= 2, "Expected at least 2 rows");

    const row1 = rows[0] as Row;
    const row2 = rows[1] as Row;

    assert.strictEqual(row1.id, 39154206);
    assert.strictEqual(row1.ticker, "RTY1!");
    assert.strictEqual(row1.timenow, "2026-02-16T03:08:00.000Z");
    assert.strictEqual(row1.average, null);
    assert.strictEqual(row1["1"], null);
    assert.strictEqual(row1["240"], null);

    assert.strictEqual(row2.id, 39154056);
    assert.strictEqual(row2.ticker, "RTY1!");
    assert.strictEqual(row2.average, -5.21);
    assert.strictEqual(typeof row2["1"], "number");
    assert.strictEqual(row2["1"], 2.8181707082831657);
    assert.strictEqual(row2.D, 25.36625655329633);
    assert.strictEqual(row2.W, null);
  });
});
