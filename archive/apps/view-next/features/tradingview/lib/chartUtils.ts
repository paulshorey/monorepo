import { LineData, Time, ISeriesApi } from 'lightweight-charts'
import { StrengthRowGet } from '@lib/db-trading/sql/strength'

/**
 * Convert strength data to chart data using the specified intervals
 * If multiple intervals are provided, average their values
 */
export const convertToChartData = (
  data: StrengthRowGet[],
  control_intervals: string[]
): LineData[] => {
  return data
    .map((item) => {
      // Calculate average value across all specified intervals
      let sum = 0
      let count = 0

      for (const interval of control_intervals) {
        const value = item[interval as keyof StrengthRowGet]

        // Only include non-null values in the average
        if (value !== null && value !== undefined) {
          const numericValue =
            typeof value === 'string' ? parseFloat(value) : Number(value)

          if (Number.isFinite(numericValue)) {
            sum += numericValue
            count++
          }
        }
      }

      // Skip this data point if no valid values were found
      if (count === 0) return null

      // Calculate average
      const averageValue = sum / count

      return {
        time: (new Date(item.timenow).getTime() / 1000) as any,
        value: averageValue,
      }
    })
    .filter((item): item is LineData => item !== null) // Remove null values
}

/**
 * Calculate time range from raw data
 */
export const calculateTimeRange = (
  rawData: (StrengthRowGet[] | null)[],
  hoursBack: number
): { from: Time; to: Time } | null => {
  let latestOverallTime = 0
  let earliestOverallTime = Infinity

  // Find the overall time range across all tickers
  rawData.forEach((tickerData) => {
    if (tickerData && tickerData.length > 0) {
      const firstTime = tickerData[0]!.timenow.getTime() / 1000
      const lastTime =
        tickerData[tickerData.length - 1]!.timenow.getTime() / 1000
      earliestOverallTime = Math.min(earliestOverallTime, firstTime)
      latestOverallTime = Math.max(latestOverallTime, lastTime)
    }
  })

  if (latestOverallTime > 0 && earliestOverallTime < Infinity) {
    const hoursBackInSeconds = hoursBack * 60 * 60
    const startTime = Math.max(
      earliestOverallTime,
      latestOverallTime - hoursBackInSeconds
    )

    // Ensure start time is always before end time
    // Add a small buffer if they're equal or too close
    if (startTime >= latestOverallTime) {
      // If we don't have enough data, show at least 1 hour
      const oneHourInSeconds = 60 * 60
      return {
        from: (latestOverallTime - oneHourInSeconds) as Time,
        to: latestOverallTime as Time,
      }
    }

    return {
      from: startTime as Time,
      to: latestOverallTime as Time,
    }
  }

  return null
}

/**
 * Get nearest series value at a specific time using binary search
 * If multiple intervals are provided, average their values
 */
export const getNearestSeriesValueAtTime = (
  chartData: LineData[] | null | undefined,
  t: Time,
  chartIndex: number,
  rawData: (StrengthRowGet[] | null)[],
  control_intervals: string[]
): number | null => {
  const tickerRawData = rawData[chartIndex]
  if (
    !tickerRawData ||
    !chartData ||
    typeof t !== 'number' ||
    tickerRawData.length === 0
  )
    return null
  const target = t as number

  // Binary search to find nearest index by timenow in raw data
  let left = 0
  let right = tickerRawData.length - 1
  while (left <= right) {
    const mid = (left + right) >> 1
    const midTime = tickerRawData[mid]!.timenow.getTime() / 1000
    if (midTime === target) {
      left = mid
      right = mid - 1
      break
    }
    if (midTime < target) left = mid + 1
    else right = mid - 1
  }

  // Candidates are at indices right and left
  let idx = right
  if (left >= 0 && left < tickerRawData.length) {
    if (right < 0) idx = left
    else {
      const leftTime = tickerRawData[left]!.timenow.getTime() / 1000
      const rightTime = tickerRawData[right]!.timenow.getTime() / 1000
      idx =
        Math.abs(leftTime - target) < Math.abs(rightTime - target)
          ? left
          : right
    }
  } else if (right < 0) {
    idx = 0
  } else if (right >= tickerRawData.length) {
    idx = tickerRawData.length - 1
  }

  idx = Math.max(0, Math.min(idx, tickerRawData.length - 1))

  // Calculate average value across all specified intervals
  let sum = 0
  let count = 0

  for (const interval of control_intervals) {
    const raw = tickerRawData[idx]![interval as keyof StrengthRowGet]

    if (raw !== null && raw !== undefined) {
      const value = typeof raw === 'string' ? parseFloat(raw) : Number(raw)
      if (Number.isFinite(value)) {
        sum += value
        count++
      }
    }
  }

  // Return null if no valid values found, otherwise return average
  return count > 0 ? sum / count : null
}

/**
 * Efficiently update chart series data using update() for appends or setData() for full refreshes.
 *
 * IMPORTANT: lightweight-charts update() can ONLY:
 * 1. Update the LAST point in the series (if same timestamp)
 * 2. Append a new point that comes AFTER the last point
 *
 * It CANNOT update points in the middle of the series.
 * For any other changes, we must use setData().
 *
 * @param series - The chart series to update
 * @param currentData - New data array
 * @param prevData - Previous data array (for comparison)
 * @returns true if data was updated, false if no changes detected
 */
export const updateSeriesEfficiently = (
  series: ISeriesApi<'Line'>,
  currentData: LineData[],
  prevData: LineData[] | null
): boolean => {
  if (currentData.length === 0) return false

  // First load or no previous data: use setData
  if (!prevData || prevData.length === 0) {
    series.setData(currentData)
    return true
  }

  const lengthDiff = currentData.length - prevData.length

  // Check if this is a simple append (new points at the end only)
  if (lengthDiff > 0 && lengthDiff <= 10) {
    // Verify that existing data hasn't changed (timestamps match)
    // We only check the last few points of the existing data for performance
    const checkCount = Math.min(5, prevData.length)
    let existingDataUnchanged = true

    for (let i = 0; i < checkCount; i++) {
      const idx = prevData.length - 1 - i
      const curr = currentData[idx]
      const prev = prevData[idx]

      // If timestamps differ or values significantly differ, data changed
      if (
        !curr ||
        !prev ||
        curr.time !== prev.time ||
        Math.abs(curr.value - prev.value) > 0.0001
      ) {
        existingDataUnchanged = false
        break
      }
    }

    // Only use update() if existing data is unchanged
    // (meaning we're just appending new points)
    if (existingDataUnchanged) {
      try {
        // Append only the new points
        for (let i = prevData.length; i < currentData.length; i++) {
          const point = currentData[i]
          if (point) {
            series.update(point)
          }
        }
        return true
      } catch (e) {
        // If update fails for any reason, fall back to setData
        console.warn('update() failed, falling back to setData:', e)
        series.setData(currentData)
        return true
      }
    }
  }

  // Same length - check if only the LAST point changed
  if (lengthDiff === 0) {
    const lastCurr = currentData[currentData.length - 1]
    const lastPrev = prevData[prevData.length - 1]

    // If only the last point changed (same timestamp, different value)
    if (
      lastCurr &&
      lastPrev &&
      lastCurr.time === lastPrev.time &&
      Math.abs(lastCurr.value - lastPrev.value) > 0.0001
    ) {
      // Check if everything else is the same
      let onlyLastChanged = true
      const checkCount = Math.min(5, currentData.length - 1)

      for (let i = 0; i < checkCount; i++) {
        const idx = currentData.length - 2 - i
        if (idx < 0) break
        const curr = currentData[idx]
        const prev = prevData[idx]

        if (
          !curr ||
          !prev ||
          curr.time !== prev.time ||
          Math.abs(curr.value - prev.value) > 0.0001
        ) {
          onlyLastChanged = false
          break
        }
      }

      if (onlyLastChanged) {
        try {
          // Safe to use update() - only the last point changed
          series.update(lastCurr)
          return true
        } catch (e) {
          // Fall back to setData if update fails
          console.warn('update() failed, falling back to setData:', e)
          series.setData(currentData)
          return true
        }
      }
    }

    // Check if data is identical (no changes needed)
    let identical = true
    for (let i = 0; i < Math.min(10, currentData.length); i++) {
      const idx = currentData.length - 1 - i
      const curr = currentData[idx]
      const prev = prevData[idx]
      if (
        !curr ||
        !prev ||
        curr.time !== prev.time ||
        Math.abs(curr.value - prev.value) > 0.0001
      ) {
        identical = false
        break
      }
    }

    if (identical) {
      return false // No changes detected
    }
  }

  // For any other changes (data in middle changed, length decreased, etc.)
  // we must use setData()
  series.setData(currentData)
  return true
}
