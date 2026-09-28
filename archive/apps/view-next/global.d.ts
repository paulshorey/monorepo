/**
 * Extend the global Window interface with custom properties
 */
declare global {
  interface Window {
    /**
     * Scale factor for chart coordinate calculations (used with CSS zoom)
     */
    scaleFactor?: number
    vendor: string
    opera: string
    isMobile?: boolean
  }
}

export {}
