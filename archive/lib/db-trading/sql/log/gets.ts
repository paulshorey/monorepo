"use server";

import { headers } from "next/headers";
import { getDb } from "../../lib/db/postgres";
import { dbLog } from "../../lib/log";
import { LogRowGet } from "./types";

type Output = {
  ip?: string;
  rows?: LogRowGet[];
  error?: {
    name: string;
    message: string;
    stack: string;
  };
};

type Props = {
  where?: {
    name?: string;
    category?: string;
    tag?: string;
    access_key?: string;
    limit?: number;
  };
};

export const logGets = async function ({ where }: Props = {}): Promise<Output> {
  "use server";

  const output = {} as Output;
  const headersList = headers();
  const ip = headersList.get("x-forwarded-for") || headersList.get("remote-addr") || "IP not available";

  const client = await getDb().connect();
  try {
    let queryText = "SELECT * FROM log_v1";
    const params: any[] = [];
    const whereClauses: string[] = [];

    if (where?.name) {
      params.push(where.name);
      whereClauses.push(`name = $${params.length}`);
    }
    if (where?.category) {
      params.push(where.category);
      whereClauses.push(`category = $${params.length}`);
    }
    if (where?.tag) {
      params.push(where.tag);
      whereClauses.push(`tag = $${params.length}`);
    }
    if (where?.access_key) {
      params.push(where.access_key);
      whereClauses.push(`access_key = $${params.length}`);
    }

    if (whereClauses.length > 0) {
      queryText += ` WHERE ${whereClauses.join(" AND ")}`;
    }

    queryText += " ORDER BY created_at DESC";
    params.push(where?.limit || 100);
    queryText += ` LIMIT $${params.length}`;

    const result = await client.query(queryText, params);
    const logs = result.rows;

    const rows = logs.map((log) => ({
      id: log.id,
      dev: log.node_env === "development",
      name: log.name,
      message: log.message,
      stack: JSON.stringify(log.stack),
      category: log.category || "",
      tag: log.tag || "",
      access_key: log.access_key || "",
      server_name: log.server_name || "",
      app_name: log.app_name || "",
      node_env: log.node_env || "",
      created_at: new Date(log.created_at),
    })) as LogRowGet[];

    output.ip = ip;
    output.rows = rows;
  } catch (e: any) {
    try {
      const error = {
        name: "Error lib/sql/logsGet.ts catch",
        message: e?.message?.toString(),
        stack: e?.stack?.toString(),
      };
      output.error = error;
      dbLog.error("sql/log/gets Error", error);
    } catch (err: any) {
      console.error(err);
    }
  } finally {
    client.release();
  }
  return output;
};
