import { useRef, useCallback } from 'react'
import { ISeriesApi, LineData, Time } from 'lightweight-charts'
import { VerticalLinePrimitive } from './VerticalLinePrimitive'
import { TimeRangeHighlightPrimitive } from './TimeRangeHighlight'
import { getMarkerTimestamps, markerConfigToOptions } from './timeMarkers'
import { TIME_MARKERS, TIME_RANGE_HIGHLIGHTS } from '../../constants'

/**
 * Hook to manage time markers and range highlights on a chart series.
 *
 * Creates:
 * - Time range highlights (shaded background areas for market hours)
 * - Vertical line markers (for specific times like market open/close)
 *
 * @returns Object with createTimeMarkers function and initialization state ref
 */
export function useTimeMarkers() {
  const timeMarkersRef = useRef<VerticalLinePrimitive[]>([])
  const timeRangeHighlightRef = useRef<TimeRangeHighlightPrimitive | null>(null)
  const markersInitialized = useRef(false)

  /**
   * Create time markers and range highlights on the given series.
   * Should only be called once per chart initialization.
   *
   * @param series - The series to attach markers to
   * @param data - Chart data array (needs at least one point)
   */
  const createTimeMarkers = useCallback(
    (series: ISeriesApi<'Line'>, data: LineData[]) => {
      if (!series || markersInitialized.current) return
      if (data.length === 0) return

      // Extract all timestamps from the data
      const dataTimestamps = data.map((d) => d.time as number)
      const dataStartTime = dataTimestamps[0]!
      const dataEndTime = dataTimestamps[dataTimestamps.length - 1]!

      // Create time range highlights (shaded background areas)
      if (!timeRangeHighlightRef.current && TIME_RANGE_HIGHLIGHTS.length > 0) {
        const highlight = new TimeRangeHighlightPrimitive(TIME_RANGE_HIGHLIGHTS)
        highlight.setDataRange(dataTimestamps)
        series.attachPrimitive(highlight)
        timeRangeHighlightRef.current = highlight
      }

      // Create vertical line markers for each configured time marker
      TIME_MARKERS.forEach((markerConfig) => {
        const timestamps = getMarkerTimestamps(
          markerConfig.utcHour,
          markerConfig.utcMinute,
          dataStartTime,
          dataEndTime
        )

        timestamps.forEach((timestamp) => {
          const marker = new VerticalLinePrimitive(
            timestamp as Time,
            markerConfigToOptions(markerConfig)
          )
          series.attachPrimitive(marker)
          timeMarkersRef.current.push(marker)
        })
      })

      markersInitialized.current = true
    },
    []
  )

  return {
    createTimeMarkers,
    markersInitialized,
  }
}
