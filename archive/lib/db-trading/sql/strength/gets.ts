"use server";

import { headers } from "next/headers";
import { getDb } from "../../lib/db/postgres";
import { dbLog } from "../../lib/log";
import { StrengthRowGet } from "./types";
import { extractIntervalValues } from "./constants";

type Output = {
  ip?: string;
  rows?: StrengthRowGet[];
  error?: {
    name: string;
    message: string;
    stack: string;
  };
};

type Props = {
  where?: {
    ticker?: string;
    limit?: number;
    timenow_gt?: Date | string;
    timenow_lt?: Date | string;
  };
};

export const strengthGets = async function ({ where }: Props = {}): Promise<Output> {
  "use server";

  const output = {} as Output;
  const headersList = headers();
  const ip = headersList.get("x-forwarded-for") || headersList.get("remote-addr") || "IP not available";

  const client = await getDb().connect();
  try {
    let queryText = "SELECT * FROM strength_v1";
    const params: any[] = [];
    const whereClauses: string[] = [];

    if (where?.ticker) {
      params.push(where.ticker);
      whereClauses.push(`ticker = $${params.length}`);
    }

    if (where?.timenow_gt) {
      params.push(where.timenow_gt);
      whereClauses.push(`timenow >= $${params.length}`);
    }

    if (where?.timenow_lt) {
      params.push(where.timenow_lt);
      whereClauses.push(`timenow < $${params.length}`);
    }

    if (whereClauses.length > 0) {
      queryText += ` WHERE ${whereClauses.join(" AND ")}`;
    }

    queryText += " ORDER BY timenow DESC";
    params.push(where?.limit || 10000);
    queryText += ` LIMIT $${params.length}`;

    const result = await client.query(queryText, params);
    const strengths = result.rows;

    const rows = strengths.map((strength) => ({
      id: strength.id,
      ticker: strength.ticker,
      timenow: new Date(strength.timenow),
      price: Number(strength.price),
      volume: Number(strength.volume),
      updated_at: strength.updated_at ? new Date(strength.updated_at) : null,
      average: strength.average !== null ? Number(strength.average) : null,
      ...extractIntervalValues(strength),
    })) as StrengthRowGet[];

    output.ip = ip;
    output.rows = rows;
  } catch (e: any) {
    try {
      const error = {
        name: "Error lib/sql/strengthGets.ts catch",
        message: e?.message?.toString(),
        stack: e?.stack?.toString(),
      };
      output.error = error;
      dbLog.error("sql/strength/gets Error", error);
    } catch (err: any) {
      console.error(err);
    }
  } finally {
    client.release();
  }
  return output;
};
