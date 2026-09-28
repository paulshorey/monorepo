import { NextRequest, NextResponse } from 'next/server'
import { getDateRange } from '@/lib/market-data/candles'

export const dynamic = 'force-dynamic'

/**
 * Historical Candles - Date Range
 * Returns the available date range for a ticker
 *
 * Query params:
 *   ticker - Ticker symbol (required)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const ticker = searchParams.get('ticker')

    if (!ticker) {
      return NextResponse.json(
        { error: 'Missing required param: ticker' },
        { status: 400 }
      )
    }

    const range = await getDateRange(ticker)

    if (!range) {
      return NextResponse.json(
        { error: 'No data available for ticker' },
        { status: 404 }
      )
    }

    return NextResponse.json(range)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('Error fetching date range:', message)
    return NextResponse.json(
      { error: 'Failed to fetch date range', message },
      { status: 500 }
    )
  }
}
