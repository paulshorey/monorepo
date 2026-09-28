import { NextRequest } from 'next/server'
import { formatResponse } from '@lib/common/nextjs/formatResponse'
import { cc } from '@lib/common/cc'
import { sendToMyselfMMS } from '@lib/common/twillio/sendToMyselfMMS'

export const dynamic = 'force-dynamic'
export const maxDuration = 600

// Docs: https://docs.rasterwise.com/docs/getscreenshot/api-reference-0/
export async function GET(request: NextRequest) {
  return formatResponse({
    ok: true,
    note: 'Disabled for now',
  })
  try {
    const tickers = ['GC1', 'ZL1', 'CL1', 'HG1', 'ES1', 'GC1']
    const width = 754 // 754
    const height = 354 // 354
    const apiKey = 's9M14e7kMH16bOaHA5H06Wk9VQv0kpwai6ayhxdb'

    for (const ticker of tickers) {
      // Fetch
      const url = new URL(
        `https://strength.finance/?hoursBack=120h&interval=%5B%224%22%2C%2212%22%2C%2230%22%2C%2260%22%5D&tickers=%5B%22${ticker}%21%22%5D`
      )
      const fetchUrl = `https://api.rasterwise.com/v1/get-screenshot?apikey=${apiKey}&url=${encodeURIComponent(
        url.toString()
      )}&width=${height}&height=${height}&devicefactor=3`
      // &element=%23screenshot-target
      const response = await fetch(fetchUrl, { next: { revalidate: 10 } })
      const screenshotData = await response.json()
      const image = screenshotData.screenshotImage
      // Send SMS
      sendToMyselfMMS(image)
    }

    return formatResponse({
      ok: true,
    })
  } catch (error: any) {
    cc.error(
      `GET /api/v1/tradingview-screenshot CATCH ERROR: ` + error.message,
      error
    )
    return formatResponse(
      {
        ok: false,
        error: error.message || 'Failed to fetch strength-screenshot data',
      },
      500
    )
  }
}
