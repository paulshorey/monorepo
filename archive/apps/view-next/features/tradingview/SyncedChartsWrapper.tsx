'use client'

import { useEffect, useState } from 'react'

import { SyncedCharts } from './SyncedCharts'
import { useChartControlsStore } from './state/useChartControlsStore'
import Header from './components/Header'
import classes from './classes.module.scss'
import { SCALE_FACTOR_DESKTOP, SCALE_FACTOR_MOBILE } from './constants'

interface SyncedChartsWrapperProps {}

/**
 * Responsive wrapper component that:
 * 1. Waits for window dimensions to be available
 * 2. Waits for Zustand store to hydrate from URL query parameters
 * 3. Renders charts only when both are ready
 *
 * This ensures that charts initialize with the correct size and
 * with any URL parameters properly loaded into the store.
 */
export default function SyncedChartsWrapper({}: SyncedChartsWrapperProps) {
  const [dimensions, setDimensions] = useState<{
    availableWidth: number
    availableHeight: number
  } | null>(null)

  // Get hydration state from the store
  // The store will set this to true after loading URL parameters
  const isHydrated = useChartControlsStore((state) => state.isHydrated)

  useEffect(() => {
    // Function to calculate and set dimensions
    const updateDimensions = () => {
      if (typeof window !== 'undefined') {
        const windowWidth = window.innerWidth
        const windowHeight = window.innerHeight
        // On mobile portrait, limit height to width to prevent chart distortion
        const chartHeight = Math.min(windowHeight, windowWidth)
        const isMobile =
          /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent || navigator.vendor || window.opera
          )
        window.scaleFactor = isMobile
          ? SCALE_FACTOR_MOBILE
          : SCALE_FACTOR_DESKTOP
        window.isMobile = isMobile

        setDimensions({
          availableWidth: windowWidth * window.scaleFactor,
          availableHeight: chartHeight * window.scaleFactor,
        })
      }
    }

    // Initial calculation when component mounts
    updateDimensions()

    // Debounced resize handler
    let resizeTimeout: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(updateDimensions, 150) // Debounce by 150ms
    }

    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      clearTimeout(resizeTimeout)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // Only render charts once we have dimensions and store is hydrated
  if (!dimensions || !isHydrated) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Initializing charts...</div>
      </div>
    )
  }

  return (
    <div className={`overflow-auto w-full ${classes.Wrapper}`} dir="rtl">
      <Header />
      <SyncedCharts
        availableHeight={dimensions.availableHeight}
        availableHeightCrop={40}
      />
    </div>
  )
}
