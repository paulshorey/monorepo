import { NextRequest, NextResponse } from 'next/server'
import { getCandles, TIMEFRAMES } from '@/lib/market-data/candles'

export const dynamic = 'force-dynamic'

// Default date range: 2010-01-01 to now
const DEFAULT_START_MS = new Date('2010-01-01').getTime()

/**
 * Historical Candles
 *
 * Query params:
 *   ticker - Ticker symbol (required)
 *   start  - Start timestamp in ms (default: 2010-01-01)
 *   end    - End timestamp in ms (default: now)
 *   limit  - Max number of candles to return (optional)
 *   timeframe - Force a specific timeframe id (optional, e.g. "1m")
 *
 * Returns array of tuples: [timestamp_ms, open, high, low, close, volume, cvd_close]
 * Automatically selects the best timeframe based on date range unless overridden.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const ticker = searchParams.get('ticker')
    const start = searchParams.get('start')
    const end = searchParams.get('end')
    const limit = searchParams.get('limit')
    const timeframe = searchParams.get('timeframe')

    if (!ticker) {
      return NextResponse.json(
        { error: 'Missing required param: ticker' },
        { status: 400 }
      )
    }

    // Use defaults if not provided
    const startMs = start ? parseInt(start, 10) : DEFAULT_START_MS
    const endMs = end ? parseInt(end, 10) : Date.now()

    const limitValue = limit ? parseInt(limit, 10) : undefined

    if (limit && (!limitValue || limitValue <= 0)) {
      return NextResponse.json(
        { error: 'Invalid limit: must be a positive number' },
        { status: 400 }
      )
    }

    if (timeframe && !TIMEFRAMES.some((tf) => tf.id === timeframe)) {
      return NextResponse.json(
        { error: `Invalid timeframe: ${timeframe}` },
        { status: 400 }
      )
    }

    if (isNaN(startMs) || isNaN(endMs)) {
      return NextResponse.json(
        { error: 'Invalid timestamps: start and end must be numbers (ms)' },
        { status: 400 }
      )
    }

    if (startMs >= endMs) {
      return NextResponse.json(
        { error: 'Invalid range: start must be less than end' },
        { status: 400 }
      )
    }

    const result = await getCandles(startMs, endMs, ticker, {
      limit: limitValue,
      timeframe: timeframe ?? undefined,
    })

    // Return just the data array for Highcharts compatibility
    // Include metadata in headers for debugging
    return NextResponse.json(result.data, {
      headers: {
        'X-Timeframe': result.timeframe,
        'X-Table': result.table,
        'X-Count': result.count.toString(),
      },
    })
  } catch (error) {
    console.error('Error fetching candles:', error)
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { error: 'Failed to fetch candle data', message },
      { status: 500 }
    )
  }
}
