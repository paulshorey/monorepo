import { NextResponse } from 'next/server'
import { getDb } from '@lib/db-timescale'

/**
 * Health Check
 * Verifies database connectivity
 */
export async function GET() {
  try {
    const db = getDb()
    await db.query('SELECT 1')

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('Health check failed:', message)
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: message,
      },
      { status: 503 }
    )
  }
}
