'use client'

import { useRef } from 'react'
import type { Candle } from '@/lib/market-data/candles'
import { useEventPatcher } from './ui/useEventPatcher'
import { useInitChart } from './plot/useInitChart'
import { usePollData } from './plot/usePollData'
import { COLORS } from './plot/constants'

interface ChartProps {
  width: number
  height: number
}

export function Chart({ width, height }: ChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const dataRef = useRef<Candle[]>([])

  // Patch mouse events to handle 2x scale factor
  useEventPatcher(containerRef)

  // Initialize chart and series
  const { chartRef, seriesRefs, absorptionRefs } = useInitChart({
    containerRef,
    dataRef,
    width,
    height,
  })

  // Data fetching y polling - handles initial load and continuous updates
  const { isLoading, error } = usePollData({
    chartRef,
    dataRef,
    seriesRefs,
    absorptionRefs,
    width,
  })

  if (error) {
    return (
      <div
        style={{
          width: width + 'px',
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: height + 'px',
            color: '#ff6b6b',
            background: COLORS.background,
          }}
        >
          Error: {error}
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        width: width + 'px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div ref={containerRef} className="z-10" />

      {isLoading && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: COLORS.background,
            color: COLORS.text,
            zIndex: 10,
          }}
        >
          Loading real-time data...
        </div>
      )}
    </div>
  )
}
