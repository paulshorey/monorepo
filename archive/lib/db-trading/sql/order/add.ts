"use server";

import { OrderRowAdd } from "./types";
import { getDb } from "../../lib/db/postgres";
import { dbLog } from "../../lib/log";

export const orderAdd = async function (row: OrderRowAdd) {
  "use server";
  const server_name = process.env.SERVER_NAME || "";
  const app_name = process.env.APP_NAME || "";
  const node_env = process.env.NODE_ENV || "";

  const client = await getDb().connect();
  try {
    const queryText = `
      INSERT INTO order_v1(client_id, type, ticker, side, amount, price, server_name, app_name, node_env)
      VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`;
    const values = [row.client_id, row.type, row.ticker, row.side, row.amount, row.price, server_name, app_name, node_env];
    const res = await client.query(queryText, values);
    return res.rows[0];
  } catch (e: any) {
    const error = {
      name: "Error order/add.ts catch",
      message: e.message || "",
      stack: e.stack || "",
    };
    dbLog.error(`${error.name} ${e.message} ${e.stack?.substring(0, e.stack?.indexOf("\n"))}`, error);
  } finally {
    client.release();
  }
};
