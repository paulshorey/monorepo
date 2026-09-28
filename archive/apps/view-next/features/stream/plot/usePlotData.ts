import { useCallback } from 'react'
import type { Candle } from '@/lib/market-data/candles'
import { SERIES } from './constants'
import type { SeriesRefs, AbsorptionRefs } from './useInitChart'

interface UsePlotDataProps {
  seriesRefs: SeriesRefs
  absorptionRefs: AbsorptionRefs
}

interface UsePlotDataReturn {
  plotChartData: (candles: Candle[]) => void
}

export function usePlotData({
  seriesRefs,
  absorptionRefs,
}: UsePlotDataProps): UsePlotDataReturn {
  const plotChartData = useCallback(
    (candles: Candle[]) => {
      type SeriesKey = keyof typeof SERIES & keyof SeriesRefs
      const seriesEntries = Object.entries(SERIES) as [
        SeriesKey,
        (typeof SERIES)[SeriesKey],
      ][]

      /*
       * Plot series
       */
      seriesEntries.forEach(([key, config]) => {
        if (!config.enabled) return
        const ref = seriesRefs[key]
        if (ref?.current && config.formatter) {
          ref.current.setData(config.formatter(candles) as never)
        }
      })

      /*
       * Plot markers
       */
      // Temporarily disable absorption markers:
      // // Update absorption markers
      // if (seriesRefs.price.current) {
      //   const absorptionTimestamps = detectAbsorptionPoints(candles)
      //   // Add markers for new absorption points (avoid duplicates)
      //   for (const timestamp of absorptionTimestamps) {
      //     if (!absorptionRefs.timestamps.current.has(timestamp)) {
      //       const marker = new VerticalLinePrimitive(
      //         (timestamp / 1000) as Time,
      //         ABSORPTION_MARKER
      //       )
      //       seriesRefs.price.current.attachPrimitive(marker)
      //       absorptionRefs.markers.current.push(marker)
      //       absorptionRefs.timestamps.current.add(timestamp)
      //     }
      //   }
      // }
    },
    [seriesRefs, absorptionRefs]
  )

  return { plotChartData }
}
