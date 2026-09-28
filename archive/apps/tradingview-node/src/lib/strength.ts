import type { PoolClient } from "pg";
import { getDb } from "@lib/db-trading";
import { ALL_INTERVALS, FORWARD_FILL_DEPTH } from "./constants.js";
import type { StrengthDataAdd, StrengthInterval, StrengthRow, StrengthRowGet, StrengthWhere } from "../types/strength.js";

export const parseStrengthText = (bodyText: string): StrengthDataAdd => {
  const data = {} as StrengthDataAdd;
  const pairs = bodyText.trim().split(/\s+/);

  for (const pair of pairs) {
    const [key, value] = pair.split("=");
    if (key && value !== undefined) {
      if (key === "ticker") {
        data.ticker = value !== "{{ticker}}" ? value : null;
      } else if (key === "interval") {
        data.interval = value !== "{{interval}}" ? value : null;
      } else if (key === "price") {
        const num = Number.parseFloat(value);
        data.price = Number.isNaN(num) ? null : num;
      } else if (key === "strength") {
        const num = Number.parseFloat(value);
        data.strength = Number.isNaN(num) ? null : num;
      } else if (key === "volume") {
        const num = Number.parseFloat(value);
        data.volume = Number.isNaN(num) ? null : num;
      }
    }
  }

  return data;
};

const extractIntervalValues = (row: StrengthRow): Record<StrengthInterval, number | null> => {
  const values = {} as Record<StrengthInterval, number | null>;
  for (const interval of ALL_INTERVALS) {
    const rawValue = row[interval];
    if (rawValue !== null && rawValue !== undefined) {
      const numValue = Number(rawValue);
      values[interval] = Number.isFinite(numValue) ? numValue : null;
    } else {
      values[interval] = null;
    }
  }
  return values;
};

const calculateAverage = (values: Record<StrengthInterval, number | null>): number | null => {
  const validValues = Object.values(values).filter((value): value is number => value !== null);
  if (validValues.length === 0) {
    return null;
  }
  return validValues.reduce((sum, value) => sum + value, 0) / validValues.length;
};

const preCreateRows = async (client: PoolClient, ticker: string, currentTime: Date, futureTime: Date): Promise<void> => {
  const insertQuery = `
    INSERT INTO strength_v1("ticker", "timenow")
    VALUES($1, $2)
    ON CONFLICT (ticker, timenow) DO NOTHING
  `;
  await client.query(insertQuery, [ticker, currentTime]);
  await client.query(insertQuery, [ticker, futureTime]);
};

const fetchRecentRows = async (client: PoolClient, ticker: string, currentTime: Date, limit: number): Promise<StrengthRow[]> => {
  const query = `
    SELECT *
    FROM strength_v1
    WHERE ticker = $1 AND timenow <= $2
    ORDER BY timenow DESC
    LIMIT $3
  `;
  const result = await client.query(query, [ticker, currentTime, limit]);
  return result.rows;
};

const updateRowWithForwardFill = async (
  client: PoolClient,
  ticker: string,
  timenow: Date,
  interval: StrengthInterval,
  strengthValue: number,
  price: number | null,
  volume: number | null,
  recentRows: StrengthRow[],
) => {
  const currentRowIndex = recentRows.findIndex((row) => new Date(String(row.timenow)).getTime() === timenow.getTime());
  const currentRow = currentRowIndex >= 0 ? recentRows[currentRowIndex] : null;

  const currentValues = {} as Record<StrengthInterval, number | null>;
  for (const int of ALL_INTERVALS) {
    const rawValue = currentRow?.[int];
    currentValues[int] = rawValue !== null && rawValue !== undefined ? Number(rawValue) : null;
  }

  currentValues[interval] = strengthValue;

  if (recentRows.length > 0) {
    const startIdx = currentRowIndex >= 0 ? currentRowIndex : 0;
    for (const int of ALL_INTERVALS) {
      if (currentValues[int] === null) {
        for (let i = startIdx + 1; i < Math.min(recentRows.length, startIdx + FORWARD_FILL_DEPTH + 1); i++) {
          const rawValue = recentRows[i]?.[int];
          if (rawValue !== null && rawValue !== undefined) {
            currentValues[int] = Number(rawValue);
            break;
          }
        }
      }
    }
  }

  const average = calculateAverage(currentValues);
  const setClauses: string[] = [];
  const values: Array<string | number | Date | null> = [ticker, timenow];
  let paramIndex = 3;

  setClauses.push(`"${interval}" = $${paramIndex}`);
  values.push(strengthValue);
  paramIndex++;

  for (const int of ALL_INTERVALS) {
    if (int !== interval && currentValues[int] !== null && (currentRow?.[int] === null || currentRow?.[int] === undefined)) {
      setClauses.push(`"${int}" = COALESCE("${int}", $${paramIndex})`);
      values.push(currentValues[int]);
      paramIndex++;
    }
  }

  setClauses.push(`"average" = $${paramIndex}`);
  values.push(average);
  paramIndex++;

  setClauses.push(`"updated_at" = COALESCE("updated_at", $${paramIndex})`);
  values.push(new Date());
  paramIndex++;

  if (price !== null) {
    setClauses.push(`price = COALESCE($${paramIndex}, price)`);
    values.push(price);
    paramIndex++;
  }
  if (volume !== null) {
    setClauses.push(`volume = COALESCE($${paramIndex}, volume)`);
    values.push(volume);
    paramIndex++;
  }

  const updateQuery = `
    UPDATE strength_v1
    SET ${setClauses.join(", ")}
    WHERE ticker = $1 AND timenow = $2
    RETURNING *
  `;
  const result = await client.query(updateQuery, values);
  return result.rows[0];
};

export const strengthAdd = async (data: StrengthDataAdd) => {
  if (!data.ticker || !data.interval || !data.strength) {
    throw new Error("Missing required fields");
  }
  if (!ALL_INTERVALS.includes(data.interval as StrengthInterval)) {
    throw new Error(`Unsupported interval: ${data.interval}`);
  }

  const client = await getDb().connect();
  const onClientError = (err: Error) => {
    console.error("Postgres client error:", err);
  };
  client.on("error", onClientError);
  let destroyClient = false;
  try {
    const normalizedTimenow = new Date();
    normalizedTimenow.setSeconds(0, 0);

    const futureTimenow = new Date(normalizedTimenow);
    futureTimenow.setMinutes(futureTimenow.getMinutes() + 1);

    await preCreateRows(client, data.ticker, normalizedTimenow, futureTimenow);
    const recentRows = await fetchRecentRows(client, data.ticker, normalizedTimenow, FORWARD_FILL_DEPTH + 1);

    return await updateRowWithForwardFill(
      client,
      data.ticker,
      normalizedTimenow,
      data.interval as StrengthInterval,
      data.strength,
      data.price ?? null,
      data.volume ?? null,
      recentRows,
    );
  } catch (error) {
    destroyClient = true;
    throw error;
  } finally {
    client.off("error", onClientError);
    client.release(destroyClient);
  }
};

export const getStrengthRows = async (where: StrengthWhere): Promise<StrengthRowGet[]> => {
  const client = await getDb().connect();
  const onClientError = (err: Error) => {
    console.error("Postgres client error:", err);
  };
  client.on("error", onClientError);
  let destroyClient = false;
  try {
    let queryText = "SELECT * FROM strength_v1";
    const params: Array<string | number> = [];
    const whereClauses: string[] = [];

    if (where.ticker) {
      params.push(where.ticker);
      whereClauses.push(`ticker = $${params.length}`);
    }
    if (where.timenow_gt) {
      params.push(where.timenow_gt);
      whereClauses.push(`timenow >= $${params.length}`);
    }
    if (where.timenow_lt) {
      params.push(where.timenow_lt);
      whereClauses.push(`timenow < $${params.length}`);
    }

    if (whereClauses.length > 0) {
      queryText += ` WHERE ${whereClauses.join(" AND ")}`;
    }

    queryText += " ORDER BY timenow DESC";
    params.push(where.limit || 10000);
    queryText += ` LIMIT $${params.length}`;

    const result = await client.query(queryText, params);
    return result.rows.map((row: StrengthRow) => ({
      id: Number(row.id),
      ticker: String(row.ticker),
      timenow: new Date(String(row.timenow)),
      price: Number(row.price),
      volume: Number(row.volume),
      updated_at: row.updated_at ? new Date(String(row.updated_at)) : null,
      average: row.average !== null ? Number(row.average) : null,
      ...extractIntervalValues(row),
    }));
  } catch (error) {
    destroyClient = true;
    throw error;
  } finally {
    client.off("error", onClientError);
    client.release(destroyClient);
  }
};
