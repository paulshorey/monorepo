export type LogRowGet = {
  id: number;
  dev: boolean;
  name: string;
  message: string;
  stack: string;
  category: string;
  tag: string;
  access_key: string;
  server_name: string;
  app_name: string;
  node_env: string;
  created_at: Date;
};

export type LogRowAdd = {
  name: LogLevel;
  message: string;
  stack: Record<string, any>;
  access_key?: string;
  category?: string;
  tag?: string;
  type?: string;
  title?: string;
  server_name?: string;
  app_name?: string;
  node_env?: string;
  created_at?: Date;
};

export type LogLevel =
  | "info"
  | "warn"
  | "error"
  | "debug"
  | "fatal"
  | "trace"
  | "log"
  | "dir"
  | "table"
  | "time"
  | "timeEnd"
  | "group"
  | "groupEnd"
  | "groupCollapsed"
  | "clear"
  | "count"
  | "assert"
  | "profile"
  | "profileEnd"
  | "context"
  | "memory"
  | "exception"
  | "assertion"
  | "dirxml"
  | "profile"
  | "profileEnd"
  | "startGroup"
  | "startGroupCollapsed"
  | "endGroup"
  | "table"
  | "timeStamp"
  | "timeStampEnd";
