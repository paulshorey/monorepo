'use client'

import { useEffect, useState } from 'react'
import { Chart } from './Chart'

// Scale factors to match global.scss 2x rendering pattern
// Desktop: render at 2x, CSS scales to 0.5 for retina detail
// Mobile: render at 1x, no CSS scaling
const SCALE_FACTOR_DESKTOP = 2
const SCALE_FACTOR_MOBILE = 1

/**
 * Full-screen wrapper for the stream chart
 * Handles responsive sizing and window resize
 * Uses 2x scaling on desktop to take advantage of retina displays
 *
 * The pattern matches tradingview/SyncedChartsWrapper:
 * 1. global.scss transforms body to scale(0.5) with width/height 200%
 * 2. We render the chart at 2x the window dimensions
 * 3. CSS scales it back down, resulting in retina-quality detail
 */
export function StreamChartWrapper() {
  const [dimensions, setDimensions] = useState<{
    width: number
    height: number
  } | null>(null)

  useEffect(() => {
    const updateDimensions = () => {
      if (typeof window !== 'undefined') {
        const isMobile =
          /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent || navigator.vendor || (window as any).opera
          )
        const scaleFactor = isMobile ? SCALE_FACTOR_MOBILE : SCALE_FACTOR_DESKTOP

        // Store scaleFactor on window for consistency with tradingview pattern
        ;(window as any).scaleFactor = scaleFactor
        ;(window as any).isMobile = isMobile

        // On mobile portrait, limit height to width to prevent chart distortion
        const isPortrait = window.innerHeight > window.innerWidth
        const chartHeight =
          isMobile && isPortrait ? window.innerWidth : window.innerHeight
        setDimensions({
          width: window.innerWidth * scaleFactor,
          height: chartHeight * scaleFactor,
        })
      }
    }

    // Initial calculation
    updateDimensions()

    // Debounced resize handler
    let resizeTimeout: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(updateDimensions, 150)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      clearTimeout(resizeTimeout)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  if (!dimensions) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Initializing chart...</div>
      </div>
    )
  }

  // Match the tradingview wrapper structure:
  // - overflow-hidden prevents scrollbars from creating gaps
  // - w-full ensures full width
  // - The chart is rendered at 2x dimensions, CSS scales it down
  return (
    <div className="overflow-hidden w-full">
      <div className="relative w-full">
        <Chart width={dimensions.width} height={dimensions.height} />
      </div>
    </div>
  )
}
