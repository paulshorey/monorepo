import { NextResponse } from 'next/server'
import { getSchema } from '@/lib/market-data/schema'

/**
 * Database Schema
 * Returns list of tables with their columns and data types
 */
export async function GET() {
  try {
    const schema = await getSchema()
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: process.env.RAILWAY_ENVIRONMENT_NAME || 'local',
      database: schema,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('Error fetching schema:', message)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch database schema',
        message,
      },
      { status: 500 }
    )
  }
}
