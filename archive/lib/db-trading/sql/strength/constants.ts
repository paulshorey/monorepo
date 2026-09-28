export const OLD_INTERVALS = ["2", "4", "12", "30", "60", "240"] as const;

export const NEW_INTERVALS = ["1", "3", "5", "7", "13", "29", "59", "109", "181", "D", "W"] as const;

export const EXTRA_INTERVALS = ["9", "10", "11", "19", "30S", "39", "71", "101"] as const;

export const ALL_INTERVALS = [...OLD_INTERVALS, ...NEW_INTERVALS, ...EXTRA_INTERVALS] as const;

export type OldInterval = (typeof OLD_INTERVALS)[number];
export type NewInterval = (typeof NEW_INTERVALS)[number];
export type ExtraInterval = (typeof EXTRA_INTERVALS)[number];
export type StrengthInterval = (typeof ALL_INTERVALS)[number];

export type IntervalValues = {
  [K in StrengthInterval]: number | null;
};

export type PartialIntervalValues = Partial<IntervalValues>;

export const FORWARD_FILL_DEPTH = 5;

export function isValidInterval(value: string): value is StrengthInterval {
  return (ALL_INTERVALS as readonly string[]).includes(value);
}

export function extractIntervalValues(row: Record<string, unknown>): IntervalValues {
  const values: Record<string, number | null> = {};

  for (const interval of ALL_INTERVALS) {
    const rawValue = row[interval];
    if (rawValue !== null && rawValue !== undefined) {
      const numValue = Number(rawValue);
      values[interval] = !isNaN(numValue) && isFinite(numValue) ? numValue : null;
    } else {
      values[interval] = null;
    }
  }

  return values as IntervalValues;
}
