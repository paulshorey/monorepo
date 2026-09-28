import { StrengthRowGet } from '@lib/db-trading/sql/strength'
import { FETCH_DATA_HOURS_BACK } from '../../constants'

export interface FetchStrengthDataParams {
  ticker: string
  timenow_gt: Date
  timenow_lt?: Date
}

export interface FetchStrengthDataResult {
  rows: StrengthRowGet[] | null
  error: string | null
}

/**
 * Service for fetching strength data from the API
 */
export class FetchStrengthData {
  private static baseUrl =
    process.env.NEXT_PUBLIC_TRADINGVIEW_URL ||
    process.env.NEXT_PUBLIC_TRADINGVIEW_API_URL ||
    'http://localhost:8080/api/v1/tradingview'

  /**
   * Fetch strength data for a single ticker
   */
  static async fetchTickerData(
    params: FetchStrengthDataParams
  ): Promise<FetchStrengthDataResult> {
    try {
      const queryParams = new URLSearchParams()
      queryParams.append('ticker', params.ticker)
      queryParams.append('timenow_gt', params.timenow_gt.toISOString())
      if (params.timenow_lt) {
        queryParams.append('timenow_lt', params.timenow_lt.toISOString())
      }

      const response = await fetch(
        `${this.baseUrl}?${queryParams.toString()}`,
        { method: 'GET' }
      )
      const data = await response.json()

      if (data.error) {
        return { rows: null, error: data.error }
      }

      // Convert date strings back to Date objects
      let rows = data.rows
      if (rows && rows.length > 0) {
        rows = rows.map((row: any) => {
          const timenow = new Date(row.timenow)

          // Validate that timenow has no seconds (1-minute intervals)
          const seconds = timenow.getSeconds()
          const milliseconds = timenow.getMilliseconds()

          if (seconds !== 0 || milliseconds !== 0) {
            console.warn('[fetchTickerData] Invalid timestamp detected:', {
              ticker: params.ticker,
              timenow: timenow.toISOString(),
              seconds,
              milliseconds,
            })
          }

          return {
            ...row,
            timenow,
            updated_at: row.updated_at ? new Date(row.updated_at) : null,
          }
        })

        // Ensure data is sorted in ascending order by timenow
        rows.sort(
          (a: StrengthRowGet, b: StrengthRowGet) =>
            a.timenow.getTime() - b.timenow.getTime()
        )
      }

      return { rows, error: null }
    } catch (err) {
      console.error(`Error fetching data for ${params.ticker}:`, err)
      return {
        rows: null,
        error: err instanceof Error ? err.message : 'Failed to fetch data',
      }
    }
  }

  /**
   * Fetch data for multiple tickers in parallel
   */
  static async fetchMultipleTickersData(
    tickers: string[],
    timenow_gt: Date,
    timenow_lt?: Date
  ): Promise<(StrengthRowGet[] | null)[]> {
    const promises = tickers.map((ticker) =>
      this.fetchTickerData({ ticker, timenow_gt, timenow_lt })
    )

    const results = await Promise.all(promises)
    return results.map((result) => result.rows)
  }

  /**
   * Prepare date for API query (no seconds, 1-minute intervals)
   */
  static prepareDate(date: Date): Date {
    const prepared = new Date(date)
    prepared.setSeconds(0, 0) // Sets seconds and milliseconds to 0
    return prepared
  }

  /**
   * Get the date for initial data load
   */
  static getInitialDataDate(hoursBack: number = FETCH_DATA_HOURS_BACK): Date {
    const date = new Date(Date.now() - hoursBack * 60 * 60 * 1000)
    return this.prepareDate(date)
  }

  /**
   * Merge new data with existing data, handling duplicates
   * IMPORTANT: Uses timenow as the exact timestamp (1-minute intervals, no seconds)
   */
  static mergeData(
    existingData: StrengthRowGet[],
    newData: StrengthRowGet[]
  ): StrengthRowGet[] {
    if (!newData || newData.length === 0) return existingData
    if (!existingData || existingData.length === 0) {
      // Ensure new data is sorted
      return [...newData].sort(
        (a, b) => a.timenow.getTime() - b.timenow.getTime()
      )
    }

    // Create a map of existing data by timestamp
    const dataMap = new Map<number, StrengthRowGet>()

    // Add existing data to map
    existingData.forEach((item) => {
      const timestamp = item.timenow.getTime()
      dataMap.set(timestamp, item)
    })

    // Add or update with new data
    newData.forEach((item) => {
      const timestamp = item.timenow.getTime()
      dataMap.set(timestamp, item)
    })

    // Convert back to array and sort by time (ascending order)
    const sortedData = Array.from(dataMap.values()).sort(
      (a, b) => a.timenow.getTime() - b.timenow.getTime()
    )

    // Validate that data is properly sorted
    for (let i = 1; i < sortedData.length; i++) {
      if (
        sortedData[i]!.timenow.getTime() < sortedData[i - 1]!.timenow.getTime()
      ) {
        console.error('Data not properly sorted after merge', {
          current: sortedData[i]!.timenow,
          previous: sortedData[i - 1]!.timenow,
        })
      }
    }

    return sortedData
  }
}
