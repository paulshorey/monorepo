import { ALL_INTERVALS, FORWARD_FILL_DEPTH, StrengthInterval, IntervalValues } from "../constants";

export interface StrengthRow extends IntervalValues {
  id?: number;
  ticker: string;
  timenow: Date;
  average?: number | null;
  [key: string]: unknown;
}

export function forwardFillInterval(rows: StrengthRow[], interval: StrengthInterval, rowIndex: number, maxDepth: number = FORWARD_FILL_DEPTH): number | null {
  const currentValue = rows[rowIndex]?.[interval];
  if (currentValue !== null && currentValue !== undefined) {
    return Number(currentValue);
  }

  for (let i = rowIndex + 1; i < Math.min(rows.length, rowIndex + maxDepth + 1); i++) {
    const value = rows[i]?.[interval];
    if (value !== null && value !== undefined) {
      return Number(value);
    }
  }

  return null;
}

export function forwardFillAllIntervals(rows: StrengthRow[], rowIndex: number = 0, maxDepth: number = FORWARD_FILL_DEPTH): Record<StrengthInterval, number | null> {
  const filled: Record<string, number | null> = {};

  for (const interval of ALL_INTERVALS) {
    const value = forwardFillInterval(rows, interval, rowIndex, maxDepth);
    filled[interval] = value !== null && !isNaN(value) ? value : null;
  }

  return filled as Record<StrengthInterval, number | null>;
}

export function getMissingIntervals(row: StrengthRow): StrengthInterval[] {
  const missing: StrengthInterval[] = [];

  for (const interval of ALL_INTERVALS) {
    if (row[interval] === null || row[interval] === undefined) {
      missing.push(interval);
    }
  }

  return missing;
}

export function needsForwardFill(row: StrengthRow): boolean {
  return getMissingIntervals(row).length > 0;
}
