/**
 * URL Synchronization Utilities for Zustand Store
 *
 * This module provides two-way synchronization between Zustand store state
 * and URL query parameters, enabling:
 *
 * 1. **URL → Store**: On page load, query parameters are read and used as
 *    initial values for the store (e.g., ?interval=["3","7"]&tickers=["ETHUSD"])
 *
 * 2. **Store → URL**: When store values change, the URL is automatically
 *    updated using history.replaceState() to reflect the new state
 *
 * 3. **Bookmarkable State**: Users can bookmark or share URLs with specific
 *    chart configurations that will be restored when the page loads
 *
 * How it works:
 * - The createURLStorage function creates a custom StateStorage adapter
 * - This adapter is used with Zustand's persist middleware
 * - Only specified keys (URL_SYNC_KEYS) are synced with the URL
 * - Arrays and objects are JSON stringified/parsed automatically
 * - The URL updates don't cause page reloads (uses replaceState)
 *
 * Example URL with synced parameters:
 * /charts?interval=["3","7"]&tickers=["ETHUSD","BTCUSD"]
 */

import { StateStorage } from 'zustand/middleware'

/**
 * Parse URL query parameter value
 * Handles JSON arrays and simple strings
 */
const parseQueryValue = (value: string | null): any => {
  if (!value) return null

  // Try to parse as JSON first (for arrays and objects)
  try {
    return JSON.parse(value)
  } catch {
    // If not JSON, treat as string
    // Handle special cases
    if (value === 'true') return true
    if (value === 'false') return false
    if (!isNaN(Number(value))) return Number(value)
    return value
  }
}

/**
 * Stringify value for URL query parameter
 * Handles arrays, objects, and primitives
 */
const stringifyQueryValue = (value: any): string => {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean')
    return String(value)
  // For arrays and objects, use JSON
  return JSON.stringify(value)
}

/**
 * Get all query parameters as an object
 */
export const getQueryParams = (): Record<string, any> => {
  if (typeof window === 'undefined') return {}

  const searchParams = new URLSearchParams(window.location.search)
  const params: Record<string, any> = {}

  searchParams.forEach((value, key) => {
    params[key] = parseQueryValue(value)
  })

  return params
}

/**
 * Update URL with new query parameters
 * Preserves existing params not in the update
 */
export const updateQueryParams = (updates: Record<string, any>) => {
  if (typeof window === 'undefined') return

  const searchParams = new URLSearchParams(window.location.search)

  Object.entries(updates).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') {
      searchParams.delete(key)
    } else {
      searchParams.set(key, stringifyQueryValue(value))
    }
  })

  const newUrl = `${window.location.pathname}${
    searchParams.toString() ? '?' + searchParams.toString() : ''
  }`
  window.history.replaceState(null, '', newUrl)
}

/**
 * Create a URL storage adapter for specific state keys
 * This allows selective syncing of only certain state properties
 */
export const createURLStorage = (syncKeys: string[]): StateStorage => {
  // Track if we're currently writing to prevent read-after-write issues
  let isWriting = false

  return {
    getItem: (name) => {
      if (typeof window === 'undefined') return null

      // Don't read while writing to prevent conflicts
      if (isWriting) {
        return null
      }

      // Get current query params
      const params = getQueryParams()

      // Build state object from URL params
      const state: any = {}
      let hasData = false

      syncKeys.forEach((key) => {
        if (params[key] !== undefined) {
          state[key] = params[key]
          hasData = true
        }
      })

      // Return null if no relevant data in URL
      if (!hasData) {
        return null
      }

      // Zustand expects the stored format with state property
      return JSON.stringify({
        state,
        version: 0,
      })
    },

    setItem: (name, value) => {
      if (typeof window === 'undefined') return

      isWriting = true

      try {
        const { state } = JSON.parse(value)

        // Build updates object with only sync keys
        const updates: Record<string, any> = {}
        syncKeys.forEach((key) => {
          if (state[key] !== undefined) {
            updates[key] = state[key]
          }
        })

        updateQueryParams(updates)
      } catch (e) {
        console.error('Failed to sync state to URL:', e)
      } finally {
        // Reset writing flag after a small delay to ensure URL update completes
        setTimeout(() => {
          isWriting = false
        }, 10)
      }
    },

    removeItem: (name) => {
      if (typeof window === 'undefined') return

      // Remove all sync keys from URL
      const searchParams = new URLSearchParams(window.location.search)
      syncKeys.forEach((key) => searchParams.delete(key))

      const newUrl = `${window.location.pathname}${
        searchParams.toString() ? '?' + searchParams.toString() : ''
      }`
      window.history.replaceState(null, '', newUrl)
    },
  }
}

/**
 * Hook to sync specific store values with URL
 * Returns initial values from URL
 */
export const useURLSync = (syncKeys: string[]) => {
  if (typeof window === 'undefined') {
    return {}
  }

  const params = getQueryParams()
  const initialValues: Record<string, any> = {}

  syncKeys.forEach((key) => {
    if (params[key] !== undefined) {
      initialValues[key] = params[key]
    }
  })

  return initialValues
}
