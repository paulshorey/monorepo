/**
 * Forward Fill Data Utility
 *
 * Ensures data points exist at required timestamps (like time range boundaries)
 * by adding forward-filled values. Does NOT fill every interval - only adds
 * data points at specifically required timestamps.
 *
 * This preserves natural gaps in the data (weekends, holidays) while ensuring
 * time range highlighting works correctly at boundaries.
 */

import { LineData, Time } from 'lightweight-charts'

/**
 * Add data points at required timestamps using forward-fill.
 *
 * This function:
 * 1. Takes existing data points
 * 2. Adds forward-filled values ONLY at required timestamps (e.g., time range boundaries)
 * 3. Does NOT fill gaps between regular data points
 *
 * @param data - Original data array (must be sorted by time ascending)
 * @param requiredTimestamps - Array of specific timestamps that MUST exist (e.g., time range boundaries)
 * @returns Data array with required timestamps added
 */
export function addRequiredTimestamps(
  data: LineData[],
  requiredTimestamps: number[]
): LineData[] {
  if (data.length === 0) return data
  if (!requiredTimestamps || requiredTimestamps.length === 0) return data

  // Create a map for O(1) lookup of existing data
  const dataMap = new Map<number, LineData>()
  data.forEach((d) => dataMap.set(d.time as number, d))

  const startTime = data[0]!.time as number
  const endTime = data[data.length - 1]!.time as number

  // Collect all timestamps that should exist
  const allTimestamps = new Set<number>()

  // Add all existing data timestamps
  data.forEach((d) => allTimestamps.add(d.time as number))

  // Add required timestamps that fall within the data range
  requiredTimestamps.forEach((ts) => {
    if (ts >= startTime && ts <= endTime) {
      allTimestamps.add(ts)
    }
  })

  // Sort all timestamps
  const sortedTimes = Array.from(allTimestamps).sort((a, b) => a - b)

  // Build result with forward-fill for missing required timestamps
  const result: LineData[] = []
  let lastValue = data[0]!.value

  for (const t of sortedTimes) {
    const existing = dataMap.get(t)

    if (existing) {
      // Use existing data point
      result.push(existing)
      lastValue = existing.value
    } else {
      // This is a required timestamp without data - forward-fill
      result.push({ time: t as Time, value: lastValue })
    }
  }

  return result
}

/**
 * @deprecated Use addRequiredTimestamps instead.
 * This function is kept for backwards compatibility.
 */
export function forwardFillData(
  data: LineData[],
  _intervalSeconds: number = 60,
  requiredTimestamps?: number[]
): LineData[] {
  return addRequiredTimestamps(data, requiredTimestamps || [])
}

/**
 * Extract all time range boundary timestamps from the configuration.
 *
 * @param configs - Time range configurations
 * @param dataStartTime - Start of data range (unix timestamp)
 * @param dataEndTime - End of data range (unix timestamp)
 * @returns Array of timestamps where time ranges start or end
 */
export function getTimeRangeBoundaries(
  configs: Array<{
    startUtcHour: number
    startUtcMinute: number
    endUtcHour: number
    endUtcMinute: number
  }>,
  dataStartTime: number,
  dataEndTime: number
): number[] {
  const boundaries: number[] = []
  const startDate = new Date(dataStartTime * 1000)
  const endDate = new Date(dataEndTime * 1000)

  configs.forEach((config) => {
    // Start from the beginning of the data range
    const currentDate = new Date(
      Date.UTC(
        startDate.getUTCFullYear(),
        startDate.getUTCMonth(),
        startDate.getUTCDate(),
        config.startUtcHour,
        config.startUtcMinute,
        0,
        0
      )
    )

    // If start time is before data start, move to that day's occurrence
    if (currentDate.getTime() < startDate.getTime() - 24 * 60 * 60 * 1000) {
      currentDate.setUTCDate(currentDate.getUTCDate() + 1)
    }

    // Find all occurrences within the data range (plus buffer)
    const bufferMs = 24 * 60 * 60 * 1000 // 1 day buffer
    while (currentDate.getTime() <= endDate.getTime() + bufferMs) {
      // Add start time
      boundaries.push(Math.floor(currentDate.getTime() / 1000))

      // Calculate and add end time
      let dayOffset = 0
      if (
        config.endUtcHour < config.startUtcHour ||
        (config.endUtcHour === config.startUtcHour &&
          config.endUtcMinute < config.startUtcMinute)
      ) {
        dayOffset = 1
      }

      const endTimeDate = new Date(
        Date.UTC(
          currentDate.getUTCFullYear(),
          currentDate.getUTCMonth(),
          currentDate.getUTCDate() + dayOffset,
          config.endUtcHour,
          config.endUtcMinute,
          0,
          0
        )
      )
      boundaries.push(Math.floor(endTimeDate.getTime() / 1000))

      // Move to next day
      currentDate.setUTCDate(currentDate.getUTCDate() + 1)
    }
  })

  return boundaries
}

/**
 * Round a timestamp down to the nearest interval boundary.
 *
 * @param timestamp - Unix timestamp in seconds
 * @param intervalSeconds - Interval in seconds (default: 60 = 1 minute)
 * @returns Rounded timestamp
 */
export function roundToInterval(
  timestamp: number,
  intervalSeconds: number = 60
): number {
  return Math.floor(timestamp / intervalSeconds) * intervalSeconds
}

/**
 * Time range highlight configuration interface.
 */
export interface TimeRangeConfig {
  startUtcHour: number
  startUtcMinute: number
  endUtcHour: number
  endUtcMinute: number
}

/**
 * Prepare data by ensuring required timestamps exist at time range boundaries.
 * This adds forward-filled values ONLY at boundary timestamps,
 * preserving natural gaps in the data (weekends, holidays).
 *
 * @param data - Original data array
 * @param timeRangeHighlights - Time range configurations defining boundaries
 * @returns Data array with boundary timestamps added
 */
export function prepareDataWithRequiredTimestamps(
  data: LineData[],
  timeRangeHighlights: TimeRangeConfig[]
): LineData[] {
  if (data.length === 0) return data

  const dataStartTime = data[0]!.time as number
  const dataEndTime = data[data.length - 1]!.time as number

  // Get all time range boundaries that need to exist in the data
  const requiredTimestamps = getTimeRangeBoundaries(
    timeRangeHighlights,
    dataStartTime,
    dataEndTime
  )

  // Add forward-filled values only at required timestamps
  return forwardFillData(data, 60, requiredTimestamps)
}
