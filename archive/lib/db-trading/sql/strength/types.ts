import { IntervalValues } from "./constants";

export type StrengthRowGet = {
  id: number;
  ticker: string;
  timenow: Date;
  price: number;
  volume: number;
  average: number | null;
  updated_at: Date | null;
} & IntervalValues;

export type StrengthRowAdd = {
  ticker: string;
  timenow: Date;
  price: number | null;
  volume: number | null;
  updated_at?: Date | null;
} & Record<string, number | null>;

export type StrengthDataAdd = {
  ticker: string | null;
  interval: string | null;
  strength: number | null;
  price?: number | null;
  volume?: number | null;
};
