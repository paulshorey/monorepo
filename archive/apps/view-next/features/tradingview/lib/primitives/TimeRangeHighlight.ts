/**
 * TimeRangeHighlight - A custom primitive for shading time ranges on lightweight-charts
 *
 * Based on the official TradingView session-highlighting plugin:
 * https://github.com/tradingview/lightweight-charts/tree/master/plugin-examples/src/plugins/session-highlighting
 *
 * This implementation draws semi-transparent rectangles between specified time ranges
 * to highlight periods like market hours, overnight sessions, etc.
 */

import {
  IChartApi,
  ISeriesApi,
  ISeriesPrimitive,
  IPrimitivePaneRenderer,
  IPrimitivePaneView,
  Time,
  Coordinate,
  SeriesType,
  SeriesAttachedParameter,
  PrimitivePaneViewZOrder,
} from 'lightweight-charts'

// Type for the canvas rendering target
interface CanvasRenderingTarget2D {
  useBitmapCoordinateSpace: (
    callback: (scope: {
      context: CanvasRenderingContext2D
      bitmapSize: { width: number; height: number }
      horizontalPixelRatio: number
      verticalPixelRatio: number
    }) => void
  ) => void
}

export interface TimeRangeConfig {
  /** Unique identifier for the range */
  // id: string
  /** Start time in UTC */
  startUtcHour: number
  startUtcMinute: number
  /** End time in UTC */
  endUtcHour: number
  endUtcMinute: number
  /** Background color (should include alpha for transparency) */
  color: string
}

interface RangeData {
  x1: Coordinate | null
  x2: Coordinate | null
  color: string
}

/**
 * Renderer - handles the actual canvas drawing
 */
class TimeRangeHighlightRenderer implements IPrimitivePaneRenderer {
  private _ranges: RangeData[]

  constructor(ranges: RangeData[]) {
    this._ranges = ranges
  }

  draw(target: CanvasRenderingTarget2D): void {
    target.useBitmapCoordinateSpace((scope) => {
      const ctx = scope.context
      const height = scope.bitmapSize.height

      this._ranges.forEach((range) => {
        if (range.x1 === null || range.x2 === null) return

        const x1Scaled = Math.round(range.x1 * scope.horizontalPixelRatio)
        const x2Scaled = Math.round(range.x2 * scope.horizontalPixelRatio)

        // Ensure x1 < x2
        const xStart = Math.min(x1Scaled, x2Scaled)
        const xEnd = Math.max(x1Scaled, x2Scaled)

        // Skip if completely off screen
        if (xEnd < 0 || xStart > scope.bitmapSize.width) return

        // Clamp to visible area
        const x1Clamped = Math.max(0, xStart)
        const x2Clamped = Math.min(scope.bitmapSize.width, xEnd)

        ctx.fillStyle = range.color
        ctx.fillRect(x1Clamped, 0, x2Clamped - x1Clamped, height)
      })
    })
  }
}

interface ViewData {
  ranges: RangeData[]
}

/**
 * PaneView - manages the renderer and updates coordinates
 *
 * Uses timeToCoordinate for times with data points, and interpolates
 * between nearest data points for times within gaps (like holidays).
 */
class TimeRangeHighlightPaneView implements IPrimitivePaneView {
  private _source: TimeRangeHighlightPrimitive
  private _data: ViewData

  constructor(source: TimeRangeHighlightPrimitive) {
    this._source = source
    this._data = { ranges: [] }
  }

  /**
   * Find the nearest data timestamps before and after the target time
   */
  private _findNearestDataPoints(
    timestamp: number,
    dataTimestamps: number[]
  ): { before: number | null; after: number | null } {
    if (dataTimestamps.length === 0) {
      return { before: null, after: null }
    }

    // Binary search for efficiency
    let left = 0
    let right = dataTimestamps.length - 1

    // Handle edge cases
    if (timestamp <= dataTimestamps[0]!) {
      return { before: null, after: dataTimestamps[0]! }
    }
    if (timestamp >= dataTimestamps[right]!) {
      return { before: dataTimestamps[right]!, after: null }
    }

    // Binary search for the insertion point
    while (left < right) {
      const mid = Math.floor((left + right) / 2)
      if (dataTimestamps[mid]! < timestamp) {
        left = mid + 1
      } else {
        right = mid
      }
    }

    // Check if we found an exact match
    if (dataTimestamps[left] === timestamp) {
      return { before: timestamp, after: timestamp }
    }

    // Return the timestamps before and after
    return {
      before: dataTimestamps[left - 1] ?? null,
      after: dataTimestamps[left] ?? null,
    }
  }

  /**
   * Convert a timestamp to x-coordinate, interpolating between
   * nearest actual data points when necessary.
   */
  private _timeToX(
    timestamp: number,
    timeScale: ReturnType<IChartApi['timeScale']>,
    dataTimestamps: number[],
    dataStartTime: number,
    dataEndTime: number,
    firstDataX: Coordinate | null,
    lastDataX: Coordinate | null,
    pixelsPerSecond: number
  ): Coordinate | null {
    // First try the native method - works for times with data points
    const directCoord = timeScale.timeToCoordinate(timestamp as Time)
    if (directCoord !== null) {
      return directCoord
    }

    // If we don't have the reference coordinates, we can't interpolate
    if (firstDataX === null || lastDataX === null) {
      return null
    }

    // For times before data starts - extrapolate left from first data point
    if (timestamp < dataStartTime) {
      const secondsBeforeStart = dataStartTime - timestamp
      return (firstDataX - secondsBeforeStart * pixelsPerSecond) as Coordinate
    }

    // For times after data ends - extrapolate right from last data point
    if (timestamp > dataEndTime) {
      const secondsAfterEnd = timestamp - dataEndTime
      return (lastDataX + secondsAfterEnd * pixelsPerSecond) as Coordinate
    }

    // For times within the data range but in a gap (no data point exists)
    // Find nearest data points and interpolate between them
    const nearest = this._findNearestDataPoints(timestamp, dataTimestamps)

    if (nearest.before !== null && nearest.after !== null) {
      const beforeX = timeScale.timeToCoordinate(nearest.before as Time)
      const afterX = timeScale.timeToCoordinate(nearest.after as Time)

      if (beforeX !== null && afterX !== null) {
        // Interpolate between the two known coordinates
        const timeDiff = nearest.after - nearest.before
        const offset = timestamp - nearest.before
        const ratio = timeDiff > 0 ? offset / timeDiff : 0
        return (beforeX + ratio * (afterX - beforeX)) as Coordinate
      }
    }

    // Fallback: use the nearest available coordinate
    if (nearest.before !== null) {
      const beforeX = timeScale.timeToCoordinate(nearest.before as Time)
      if (beforeX !== null) {
        const offset = timestamp - nearest.before
        return (beforeX + offset * pixelsPerSecond) as Coordinate
      }
    }

    if (nearest.after !== null) {
      const afterX = timeScale.timeToCoordinate(nearest.after as Time)
      if (afterX !== null) {
        const offset = nearest.after - timestamp
        return (afterX - offset * pixelsPerSecond) as Coordinate
      }
    }

    return null
  }

  update(): void {
    const chart = this._source.chart
    if (!chart) {
      this._data.ranges = []
      return
    }

    const timeScale = chart.timeScale()
    const dataStartTime = this._source.dataStartTime
    const dataEndTime = this._source.dataEndTime
    const dataTimestamps = this._source.dataTimestamps

    if (!dataStartTime || !dataEndTime || dataTimestamps.length === 0) {
      this._data.ranges = []
      return
    }

    // Get coordinates for the first and last data points
    const firstDataX = timeScale.timeToCoordinate(dataStartTime as Time)
    const lastDataX = timeScale.timeToCoordinate(dataEndTime as Time)

    // Calculate pixels per second based on data range (for extrapolation)
    let pixelsPerSecond = 0
    if (
      firstDataX !== null &&
      lastDataX !== null &&
      dataEndTime > dataStartTime
    ) {
      pixelsPerSecond = (lastDataX - firstDataX) / (dataEndTime - dataStartTime)
    }

    this._data.ranges = this._source.rangeTimestamps.map((range) => {
      const x1 = this._timeToX(
        range.startTime,
        timeScale,
        dataTimestamps,
        dataStartTime,
        dataEndTime,
        firstDataX,
        lastDataX,
        pixelsPerSecond
      )
      const x2 = this._timeToX(
        range.endTime,
        timeScale,
        dataTimestamps,
        dataStartTime,
        dataEndTime,
        firstDataX,
        lastDataX,
        pixelsPerSecond
      )

      return {
        x1,
        x2,
        color: range.color,
      }
    })
  }

  renderer(): IPrimitivePaneRenderer {
    return new TimeRangeHighlightRenderer(this._data.ranges)
  }

  zOrder(): PrimitivePaneViewZOrder {
    return 'bottom'
  }
}

interface RangeTimestamp {
  startTime: number
  endTime: number
  color: string
}

/**
 * TimeRangeHighlightPrimitive - Main primitive class that attaches to a series
 */
export class TimeRangeHighlightPrimitive implements ISeriesPrimitive<Time> {
  private _chart: IChartApi | null = null
  private _series: ISeriesApi<SeriesType> | null = null
  private _configs: TimeRangeConfig[]
  private _paneViews: TimeRangeHighlightPaneView[]
  private _rangeTimestamps: RangeTimestamp[] = []
  private _dataStartTime: number = 0
  private _dataEndTime: number = 0
  private _dataTimestamps: number[] = [] // All actual data point timestamps

  constructor(configs: TimeRangeConfig[]) {
    this._configs = configs
    this._paneViews = [new TimeRangeHighlightPaneView(this)]
  }

  // Public getters
  get chart(): IChartApi | null {
    return this._chart
  }

  get rangeTimestamps(): RangeTimestamp[] {
    return this._rangeTimestamps
  }

  get dataStartTime(): number {
    return this._dataStartTime
  }

  get dataEndTime(): number {
    return this._dataEndTime
  }

  get dataTimestamps(): number[] {
    return this._dataTimestamps
  }

  // Called when primitive is attached to a series
  attached(param: SeriesAttachedParameter<Time>): void {
    this._chart = param.chart
    this._series = param.series
  }

  // Called when primitive is detached
  detached(): void {
    this._chart = null
    this._series = null
  }

  // Called to update all views before rendering
  updateAllViews(): void {
    this._paneViews.forEach((pw) => pw.update())
  }

  // Returns the pane views for rendering
  paneViews(): readonly IPrimitivePaneView[] {
    return this._paneViews
  }

  /**
   * Set the data range and all data timestamps for proper interpolation
   * @param dataTimestamps - Array of all data point timestamps (sorted ascending)
   */
  setDataRange(dataTimestamps: number[]): void {
    if (dataTimestamps.length === 0) return

    this._dataTimestamps = dataTimestamps
    this._dataStartTime = dataTimestamps[0]!
    this._dataEndTime = dataTimestamps[dataTimestamps.length - 1]!
    this._calculateRangeTimestamps()
    this.updateAllViews()
  }

  /**
   * Calculate all occurrences of the time ranges within the data range
   */
  private _calculateRangeTimestamps(): void {
    this._rangeTimestamps = []

    if (this._dataStartTime === 0 || this._dataEndTime === 0) return

    const startDate = new Date(this._dataStartTime * 1000)
    const endDate = new Date(this._dataEndTime * 1000)

    this._configs.forEach((config) => {
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

      // If start time is before data start, move to next occurrence
      if (currentDate.getTime() < startDate.getTime()) {
        currentDate.setUTCDate(currentDate.getUTCDate() + 1)
      }

      // Find all occurrences within the data range
      while (currentDate.getTime() <= endDate.getTime()) {
        const rangeStart = Math.floor(currentDate.getTime() / 1000)

        // Calculate end time
        let endHour = config.endUtcHour
        let endMinute = config.endUtcMinute
        let dayOffset = 0

        // Handle ranges that cross midnight
        if (
          config.endUtcHour < config.startUtcHour ||
          (config.endUtcHour === config.startUtcHour &&
            config.endUtcMinute < config.startUtcMinute)
        ) {
          dayOffset = 1
        }

        const rangeEndDate = new Date(
          Date.UTC(
            currentDate.getUTCFullYear(),
            currentDate.getUTCMonth(),
            currentDate.getUTCDate() + dayOffset,
            endHour,
            endMinute,
            0,
            0
          )
        )
        const rangeEnd = Math.floor(rangeEndDate.getTime() / 1000)

        this._rangeTimestamps.push({
          startTime: rangeStart,
          endTime: rangeEnd,
          color: config.color,
        })

        // Move to next day
        currentDate.setUTCDate(currentDate.getUTCDate() + 1)
      }
    })
  }

  /**
   * Update configs dynamically
   */
  setConfigs(configs: TimeRangeConfig[]): void {
    this._configs = configs
    this._calculateRangeTimestamps()
    this.updateAllViews()
  }
}
