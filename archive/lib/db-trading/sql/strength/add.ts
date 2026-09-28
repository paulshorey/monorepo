"use server";

import { StrengthDataAdd } from "./types";
import { getDb } from "../../lib/db/postgres";
import { dbLog } from "../../lib/log";
import { ALL_INTERVALS, FORWARD_FILL_DEPTH, calculateAverage, StrengthRow, StrengthInterval } from "./utils";

export const strengthAdd = async function (data: StrengthDataAdd) {
  "use server";

  console.log("strengthAdd", JSON.stringify(data, null, 2));

  const client = await getDb().connect();
  try {
    if (!data.ticker || !data.interval || !data.strength) {
      throw new Error("Missing required fields");
    }
    for (let key of ["price", "volume", "strength"]) {
      if (typeof data[key as keyof StrengthDataAdd] !== "number" || isNaN(data[key as keyof StrengthDataAdd] as number)) {
        if (key === "strength") {
          throw new Error(`Invalid NaN value for ${key}`);
        } else {
          delete data[key as keyof StrengthDataAdd];
        }
      }
    }

    const normalizedTimenow = new Date();
    normalizedTimenow.setSeconds(0, 0);

    const futureTimenow = new Date(normalizedTimenow);
    const futureMinutes = futureTimenow.getMinutes() + 1;

    if (futureMinutes >= 60) {
      futureTimenow.setHours(futureTimenow.getHours() + 1);
      futureTimenow.setMinutes(futureMinutes - 60);
    } else {
      futureTimenow.setMinutes(futureMinutes);
    }

    await preCreateRows(client, data.ticker, normalizedTimenow, futureTimenow);
    const recentRows = await fetchRecentRows(client, data.ticker, normalizedTimenow, FORWARD_FILL_DEPTH + 1);

    const updatedRow = await updateRowWithForwardFill(
      client,
      data.ticker,
      normalizedTimenow,
      data.interval as StrengthInterval,
      data.strength,
      data.price ?? null,
      data.volume ?? null,
      recentRows
    );

    return updatedRow;
  } catch (e: any) {
    const error = {
      name: "Error strength/add.ts catch",
      message: e.message || "",
      stack: e.stack || "",
    };
    dbLog.error(`${error.name} ${e.message} ${e.stack?.substring(0, e.stack?.indexOf("\n"))}`, error);
  } finally {
    client.release();
  }
};

async function preCreateRows(client: any, ticker: string, currentTime: Date, futureTime: Date): Promise<void> {
  const insertQuery = `
    INSERT INTO strength_v1("ticker", "timenow")
    VALUES($1, $2)
    ON CONFLICT (ticker, timenow) DO NOTHING
  `;

  try {
    await client.query(insertQuery, [ticker, currentTime]);
  } catch (error: any) {
    dbLog.log(`Pre-creating current row (expected occasional conflicts): ${error.message}`);
  }

  try {
    await client.query(insertQuery, [ticker, futureTime]);
  } catch (error: any) {
    dbLog.log(`Pre-creating future row (expected occasional conflicts): ${error.message}`);
  }
}

async function fetchRecentRows(client: any, ticker: string, currentTime: Date, limit: number): Promise<StrengthRow[]> {
  const query = `
    SELECT *
    FROM strength_v1
    WHERE ticker = $1 AND timenow <= $2
    ORDER BY timenow DESC
    LIMIT $3
  `;

  const result = await client.query(query, [ticker, currentTime, limit]);
  return result.rows as StrengthRow[];
}

async function updateRowWithForwardFill(
  client: any,
  ticker: string,
  timenow: Date,
  interval: StrengthInterval,
  strengthValue: number,
  price: number | null,
  volume: number | null,
  recentRows: StrengthRow[]
): Promise<any> {
  const currentRowIndex = recentRows.findIndex((row) => row.timenow.getTime() === timenow.getTime());
  const currentRow = currentRowIndex >= 0 ? recentRows[currentRowIndex] : null;

  const currentValues: Record<string, number | null> = {};
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

  const average = calculateAverage(currentValues as Record<StrengthInterval, number | null>);

  const setClauses: string[] = [];
  const values: any[] = [ticker, timenow];
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
}
