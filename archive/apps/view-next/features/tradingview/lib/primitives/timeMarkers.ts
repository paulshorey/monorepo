/**
 * Time Markers Configuration
 *
 * Defines vertical line markers to display on the chart at specific times.
 * All times are stored in UTC to avoid timezone issues.
 * The chart will display them in the user's local timezone.
 */

import { VerticalLineOptions } from './VerticalLinePrimitive'

export interface TimeMarkerConfig {
  /** Unique identifier for the marker */
  // id: string
  /** Label text displayed on the marker */
  label: string
  /** Hour in UTC (0-23) */
  utcHour: number
  /** Minute in UTC (0-59) */
  utcMinute: number
  /** Color of the vertical line */
  color: string
  /** Background color of the label */
  labelBackgroundColor: string
  /** Text color of the label */
  labelTextColor: string
  /** Line style: 'solid' or 'dashed' */
  lineStyle: 'solid' | 'dashed' | 'dotted'
  /** Line width in pixels */
  width: number
  /** Whether to show the label */
  showLabel: boolean
}

/**
 * Convert a UTC time to a Unix timestamp for today (or the most recent occurrence)
 * that falls within the chart's data range.
 *
 * @param utcHour - Hour in UTC (0-23)
 * @param utcMinute - Minute in UTC (0-59)
 * @param dataStartTime - Start time of chart data (Unix timestamp)
 * @param dataEndTime - End time of chart data (Unix timestamp)
 * @returns Array of Unix timestamps for each occurrence within the data range
 */
export function getMarkerTimestamps(
  utcHour: number,
  utcMinute: number,
  dataStartTime: number,
  dataEndTime: number
): number[] {
  const timestamps: number[] = []

  // Start from the data start time and find all occurrences
  const startDate = new Date(dataStartTime * 1000)
  const endDate = new Date(dataEndTime * 1000)

  // Set to the target UTC time on the start date
  const markerDate = new Date(
    Date.UTC(
      startDate.getUTCFullYear(),
      startDate.getUTCMonth(),
      startDate.getUTCDate(),
      utcHour,
      utcMinute,
      0,
      0
    )
  )

  // If the marker time is before the start date, move to next day
  if (markerDate.getTime() < startDate.getTime()) {
    markerDate.setUTCDate(markerDate.getUTCDate() + 1)
  }

  // Find all occurrences within the data range
  while (markerDate.getTime() <= endDate.getTime()) {
    timestamps.push(Math.floor(markerDate.getTime() / 1000))
    markerDate.setUTCDate(markerDate.getUTCDate() + 1)
  }

  return timestamps
}

/**
 * Convert TimeMarkerConfig to VerticalLineOptions
 */
export function markerConfigToOptions(
  config: TimeMarkerConfig
): Omit<VerticalLineOptions, 'labelText'> & { labelText: string } {
  return {
    color: config.color,
    width: config.width,
    labelText: config.label,
    labelBackgroundColor: config.labelBackgroundColor,
    labelTextColor: config.labelTextColor,
    showLabel: config.showLabel,
    lineStyle: config.lineStyle,
  }
}
