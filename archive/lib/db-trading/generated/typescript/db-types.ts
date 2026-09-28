// AUTO-GENERATED FILE. DO NOT EDIT.
// Run: pnpm --filter @lib/db-trading db:types:generate

export interface LogV1Row {
  "id": number;
  "name": string | null;
  "message": string | null;
  "stack": unknown | null;
  "access_key": string | null;
  "server_name": string | null;
  "app_name": string | null;
  "node_env": string | null;
  "category": string | null;
  "tag": string | null;
  "time": Date | null;
  "created_at": Date | null;
}

export interface OrderV1Row {
  "id": number;
  "client_id": number | null;
  "type": string | null;
  "ticker": string | null;
  "side": string | null;
  "amount": number | null;
  "price": number | null;
  "server_name": string | null;
  "app_name": string | null;
  "node_env": string | null;
  "created_at": Date | null;
}

export interface StrengthV1Row {
  "id": number;
  "price": number | null;
  "volume": number | null;
  "ticker": string | null;
  "timenow": Date | null;
  "updated_at": Date | null;
  "240": number | null;
  "12": number | null;
  "4": number | null;
  "60": number | null;
  "30": number | null;
  "1": number | null;
  "2": number | null;
  "average": number | null;
  "5": number | null;
  "13": number | null;
  "39": number | null;
  "71": number | null;
  "30S": number | null;
  "3": number | null;
  "59": number | null;
  "7": number | null;
  "19": number | null;
  "101": number | null;
  "10": number | null;
  "11": number | null;
  "9": number | null;
  "29": number | null;
  "109": number | null;
  "181": number | null;
  "D": number | null;
  "W": number | null;
}

export interface PostgresDbSchema {
  "log_v1": LogV1Row;
  "order_v1": OrderV1Row;
  "strength_v1": StrengthV1Row;
}
