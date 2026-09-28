"use server";

import { headers } from "next/headers";
import { getDb } from "../../lib/db/postgres";
import { dbLog } from "../../lib/log";
import { OrderRowGet } from "./types";

type Output = {
  ip?: string;
  rows?: OrderRowGet[];
  error?: {
    name: string;
    message: string;
    stack: string;
  };
};

type Props = {
  where?: {
    client_id?: number;
    type?: string;
    ticker?: string;
    side?: string;
    limit?: number;
  };
};

export const orderGets = async function ({ where }: Props = {}): Promise<Output> {
  "use server";

  const output = {} as Output;
  const headersList = headers();
  const ip = headersList.get("x-forwarded-for") || headersList.get("remote-addr") || "IP not available";

  const client = await getDb().connect();
  try {
    let queryText = "SELECT * FROM order_v1";
    const params: any[] = [];
    const whereClauses: string[] = [];

    if (where?.client_id) {
      params.push(where.client_id);
      whereClauses.push(`client_id = $${params.length}`);
    }
    if (where?.type) {
      params.push(where.type);
      whereClauses.push(`type = $${params.length}`);
    }
    if (where?.ticker) {
      params.push(where.ticker);
      whereClauses.push(`ticker = $${params.length}`);
    }
    if (where?.side) {
      params.push(where.side);
      whereClauses.push(`side = $${params.length}`);
    }

    if (whereClauses.length > 0) {
      queryText += ` WHERE ${whereClauses.join(" AND ")}`;
    }

    queryText += " ORDER BY created_at DESC";
    params.push(where?.limit || 100);
    queryText += ` LIMIT $${params.length}`;

    const result = await client.query(queryText, params);
    const orders = result.rows;

    const rows = orders.map((order) => ({
      id: order.id,
      dev: order.node_env === "development",
      client_id: order.client_id,
      type: order.type as "MARKET" | "LIMIT" | "STOP_MARKET",
      ticker: order.ticker,
      side: order.side as "LONG" | "SHORT",
      amount: Number(order.amount),
      price: Number(order.price),
      server_name: order.server_name || "",
      app_name: order.app_name || "",
      node_env: order.node_env || "",
      created_at: new Date(order.created_at),
    })) as OrderRowGet[];

    output.ip = ip;
    output.rows = rows;
  } catch (e: any) {
    try {
      const error = {
        name: "Error lib/sql/order/gets.ts catch",
        message: e.message,
        stack: e.stack,
      };
      output.error = error;
      dbLog.error("sql/order/gets Error: " + error.message, { where });
    } catch (err: any) {
      console.error(output.error);
    }
  } finally {
    client.release();
  }
  return output;
};
