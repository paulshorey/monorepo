import type { StrengthDataAdd, StrengthRowGet } from "../types/strength.js";

/** Invalid POST body: raw TradingView template keys ({{ticker}}, etc.) not replaced */
export const mockInvalidPostBody =
  'ticker={{ticker}} interval={{interval}} strength={{plot("strength")}} price={{close}} volume={{volume}} low={{low}} high={{high}}';

/** Valid POST body: plain text key=value pairs */
export const mockValidPostBody = "ticker=ZB interval=30 strength=20 volume=10 low=40 price=30 high=60";

/** Expected parsed data from mockValidPostBody (low/high are ignored by parser) */
export const mockValidStrengthData: StrengthDataAdd = {
  ticker: "ZB",
  interval: "30",
  strength: 20,
  volume: 10,
  price: 30,
};

/** Mock result from strengthAdd for success case */
export const mockStrengthAddResult = { id: 39163053 };

/**
 * Mock strength rows for unit tests.
 * Matches the shape returned by getStrengthRows / GET /api/v1/tradingview.
 */
export const mockStrengthRows: StrengthRowGet[] = [
  {
    id: 39154206,
    ticker: "RTY1!",
    timenow: new Date("2026-02-16T03:08:00.000Z"),
    price: 0,
    volume: 0,
    average: null,
    updated_at: new Date("2026-02-16T03:08:05.000Z"),
    "1": null,
    "2": null,
    "3": null,
    "4": null,
    "5": null,
    "7": null,
    "9": null,
    "10": null,
    "11": null,
    "12": null,
    "13": null,
    "19": null,
    "29": null,
    "30": null,
    "30S": null,
    "39": null,
    "59": null,
    "60": null,
    "71": null,
    "101": null,
    "109": null,
    "181": null,
    "240": null,
    D: null,
    W: null,
  },
  {
    id: 39154056,
    ticker: "RTY1!",
    timenow: new Date("2026-02-16T03:07:00.000Z"),
    price: 0,
    volume: 0,
    average: -5.21,
    updated_at: new Date("2026-02-16T03:07:05.000Z"),
    "1": 2.8181707082831657,
    "2": -20.247287270071258,
    "3": -5.948188744601616,
    "4": -48.65035294447991,
    "5": 0.4115302184879326,
    "7": 4.428842406854949,
    "9": null,
    "10": null,
    "11": null,
    "12": -56.66878070009293,
    "13": 12.526797817524702,
    "19": null,
    "29": 20.543736335673593,
    "30": -38.417376058205626,
    "30S": null,
    "39": null,
    "59": 30.35819263332661,
    "60": -51.34076327835987,
    "71": null,
    "101": null,
    "109": 24.63413833708232,
    "181": 22.10387350419281,
    "240": null,
    D: 25.36625655329633,
    W: null,
  },
];
