export type StrengthWhere = {
  ticker?: string;
  timenow_gt?: string;
  timenow_lt?: string;
  limit?: number;
};

export type StrengthDataAdd = {
  ticker: string | null;
  interval: string | null;
  strength: number | null;
  price?: number | null;
  volume?: number | null;
};

export type StrengthInterval =
  | "2"
  | "4"
  | "12"
  | "30"
  | "60"
  | "240"
  | "1"
  | "3"
  | "5"
  | "7"
  | "9"
  | "10"
  | "11"
  | "13"
  | "19"
  | "29"
  | "30S"
  | "39"
  | "59"
  | "71"
  | "101"
  | "109"
  | "181"
  | "D"
  | "W";
export type StrengthRow = Record<string, unknown>;

export type StrengthRowGet = {
  id: number;
  ticker: string;
  timenow: Date;
  price: number;
  volume: number;
  average: number | null;
  updated_at: Date | null;
} & Record<StrengthInterval, number | null>;
