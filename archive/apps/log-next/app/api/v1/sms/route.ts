import { NextRequest, NextResponse } from 'next/server'
import { formatResponse } from '@lib/common/nextjs/formatResponse'
import { getCurrentIpAddress } from '@lib/common/nextjs/getCurrentIpAddress'
import { sqlLogAdd } from '@lib/db-trading/sql/log/add'
import { sendToMyselfSMS } from '@lib/common/twillio/sendToMyselfSMS'
import { buildRequestLogData } from '@/app/api/v1/lib/requestLog'

export const maxDuration = 60

async function handleRequest(request: NextRequest): Promise<NextResponse> {
  try {
    const { logData, bodyText } = await buildRequestLogData(request)

    const addr = await getCurrentIpAddress()

    // Log to database
    await sqlLogAdd({
      name: 'log',
      message: '/api/v1/sms',
      stack: { ...logData, ...addr },
    })
    await sendToMyselfSMS(bodyText)

    return formatResponse({
      ok: true,
      message: 'Logged successfully',
      data: {
        method: request.method,
        time: new Date().toISOString(),
      },
    })
    // @ts-ignore
  } catch (error: Error) {
    // Log the error as well
    try {
      const addr = await getCurrentIpAddress()
      await sqlLogAdd({
        name: 'error',
        message: `Log endpoint error: ${error.message}`,
        stack: {
          error: error.stack,
          method: request.method,
          url: request.nextUrl.href,
          ...addr,
        },
      })
      await sendToMyselfSMS(`Log endpoint error: ${error.message}`)
    } catch (logError) {
      console.error('Failed to log error:', logError)
    }

    return formatResponse(
      {
        ok: false,
        error: error.message,
      },
      500
    )
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  return handleRequest(request)
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  return handleRequest(request)
}
