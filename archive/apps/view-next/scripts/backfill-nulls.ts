/**
 * Backfill script to forward-fill null interval columns in strength_v1 table.
 *
 * Run from apps/strength:
 *   npx tsx scripts/backfill-nulls.ts
 */

import { readFileSync } from 'fs'
import { resolve } from 'path'
import { getDb } from '@lib/db-trading/lib/db/postgres'
import {
  ALL_INTERVALS,
  extractIntervalValues,
} from '@lib/db-trading/sql/strength/constants'
import { calculateAverage } from '@lib/db-trading/sql/strength/utils/average'

// Load .env file from apps/strength directory
function loadEnv() {
  try {
    const envPath = resolve(process.cwd(), '.env')
    const envContent = readFileSync(envPath, 'utf-8')
    for (const line of envContent.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIndex = trimmed.indexOf('=')
      if (eqIndex === -1) continue
      const key = trimmed.slice(0, eqIndex).trim()
      let value = trimmed.slice(eqIndex + 1).trim()
      // Remove surrounding quotes if present
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }
      if (!process.env[key]) {
        process.env[key] = value
      }
    }
  } catch (e) {
    console.log('No .env file found, using existing environment variables')
  }
}

loadEnv()

// Tickers to process
const TICKERS = [
  'NQ1!',
  'ES1!',
  'RTY1!',
  'GC1!',
  'SI1!',
  'PL1!',
  'HG1!',
  'BTCUSD',
  'SOLUSD',
]

async function backfillNulls() {
  if (!process.env.TRADING_DB_URL) {
    console.error('Error: TRADING_DB_URL environment variable not set')
    process.exit(1)
  }

  const db = getDb()

  try {
    console.log('Connecting to database...')
    console.log(`Processing ${TICKERS.length} tickers: ${TICKERS.join(', ')}`)

    let totalUpdated = 0

    const startDate = new Date('2025-12-28T17:00:00Z')
    console.log(`Starting from: ${startDate.toISOString()}`)

    for (const ticker of TICKERS) {
      console.log(`\nProcessing ticker: ${ticker}`)

      // Fetch rows starting from cutoff date, ordered by timenow ASC (oldest first)
      const rowsResult = await db.query(
        `
        SELECT * FROM strength_v1
        WHERE ticker = $1 AND timenow >= $2
        ORDER BY timenow ASC
      `,
        [ticker, startDate]
      )

      const rows = rowsResult.rows
      console.log(`  Found ${rows.length} rows`)

      // previousValues starts empty - will be populated as we encounter non-null values
      const previousValues: Record<string, number | null> = {}
      let updatedCount = 0

      for (const row of rows) {
        const updates: Record<string, number> = {}

        // Extract current interval values from the row
        const currentIntervalValues = extractIntervalValues(row)

        // Check each interval column
        for (const interval of ALL_INTERVALS) {
          const currentValue = currentIntervalValues[interval]

          if (currentValue === null) {
            // Current is null - check if we have a previous value to fill
            const prevValue = previousValues[interval]
            if (prevValue !== null && prevValue !== undefined) {
              updates[interval] = prevValue
              // Update currentIntervalValues so average calculation includes filled values
              currentIntervalValues[interval] = prevValue
            }
          } else {
            // Current has a value - remember it for next row
            previousValues[interval] = currentValue
          }
        }

        // If we have updates, apply them and recalculate average
        if (Object.keys(updates).length > 0) {
          const average = calculateAverage(currentIntervalValues)

          const setClauses = Object.keys(updates).map(
            (col, i) => `"${col}" = $${i + 3}`
          )
          const values = [ticker, row.timenow, ...Object.values(updates)]

          // Add average to update
          setClauses.push(`"average" = $${values.length + 1}`)
          values.push(average as any)

          await db.query(
            `
            UPDATE strength_v1
            SET ${setClauses.join(', ')}
            WHERE ticker = $1 AND timenow = $2
          `,
            values
          )

          updatedCount++
        }
      }

      console.log(`  Updated ${updatedCount} rows`)
      totalUpdated += updatedCount
    }

    console.log(`\n✅ Done! Updated ${totalUpdated} total rows.`)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  } finally {
    await db.end()
  }
}

backfillNulls()
