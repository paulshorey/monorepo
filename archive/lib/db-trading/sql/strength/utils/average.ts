import { ALL_INTERVALS, StrengthInterval, extractIntervalValues } from "../constants";

export function calculateAverage(intervalValues: Record<StrengthInterval, number | null> | Record<string, number | null>): number | null {
  let sum = 0;
  let count = 0;

  for (const interval of ALL_INTERVALS) {
    const rawValue = intervalValues[interval];
    const value = rawValue !== null && rawValue !== undefined ? Number(rawValue) : null;

    if (value !== null && !isNaN(value) && isFinite(value)) {
      sum += value;
      count++;
    }
  }

  if (count === 0) {
    return null;
  }

  return Math.round((sum / count) * 100) / 100;
}

export function mergeAndCalculateAverage(
  existingValues: Record<StrengthInterval, number | null>,
  newInterval: StrengthInterval,
  newValue: number
): { values: Record<StrengthInterval, number | null>; average: number | null } {
  const merged = { ...existingValues };
  merged[newInterval] = newValue;

  return {
    values: merged,
    average: calculateAverage(merged),
  };
}

export { extractIntervalValues };
