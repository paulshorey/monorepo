import 'server-only'

import { getDb } from '@lib/db-trading'
import type { TableSchema } from '@/config/schemaRegistry'
import type { WhereFilters } from '@/lib/searchParams'

export type DbRow = Record<string, unknown>
export type GetTableRowsResult = {
  rows: DbRow[]
  sortColumn?: string
}

const DEFAULT_LIMIT = 100

function quoteIdentifier(identifier: string): string {
  return `"${identifier.replace(/"/g, '""')}"`
}

const TIMESTAMP_SORT_PREFERENCE = [
  'timenow',
  'updated_at',
  'created_at',
  'time',
] as const

function getSortCandidates(table: TableSchema): string[] {
  const preferredColumns = TIMESTAMP_SORT_PREFERENCE.filter(
    (column) => table.columnsByName[column]
  )

  if (preferredColumns.length > 0) {
    return preferredColumns
  }

  if (table.columnsByName.id) {
    return ['id']
  }

  return []
}

function buildQuery({
  table,
  whereClauses,
  orderByColumn,
  paramsLength,
}: {
  table: TableSchema
  whereClauses: string[]
  orderByColumn?: string
  paramsLength: number
}): string {
  let queryText = `SELECT * FROM ${quoteIdentifier(table.tableName)}`
  if (whereClauses.length > 0) {
    queryText += ` WHERE ${whereClauses.join(' AND ')}`
  }

  if (orderByColumn) {
    queryText += ` ORDER BY ${quoteIdentifier(orderByColumn)} DESC NULLS LAST`
  }

  queryText += ` LIMIT $${paramsLength}`
  return queryText
}

function isUndefinedColumnError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false
  }

  const code = 'code' in error ? (error.code as string | undefined) : undefined
  return code === '42703'
}

function normalizeRowValue(value: unknown): unknown {
  if (value instanceof Date) {
    return value.toISOString()
  }
  if (typeof value === 'bigint') {
    return Number(value)
  }
  return value
}

function normalizeRow(row: Record<string, unknown>): DbRow {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [key, normalizeRowValue(value)])
  )
}

export async function getTableRows({
  table,
  where,
  limit = DEFAULT_LIMIT,
}: {
  table: TableSchema
  where: WhereFilters
  limit?: number
}): Promise<GetTableRowsResult> {
  const client = await getDb().connect()

  try {
    const params: Array<string | number | boolean | Date> = []
    const whereClauses: string[] = []

    for (const [columnName, value] of Object.entries(where)) {
      if (!table.columnsByName[columnName]) {
        continue
      }
      params.push(value)
      whereClauses.push(`${quoteIdentifier(columnName)} = $${params.length}`)
    }

    const queryParams = [...params, limit]
    const sortCandidates = getSortCandidates(table)

    for (const sortColumn of sortCandidates) {
      const queryText = buildQuery({
        table,
        whereClauses,
        orderByColumn: sortColumn,
        paramsLength: queryParams.length,
      })

      try {
        const result = await client.query(queryText, queryParams)
        return {
          rows: result.rows.map((row) => normalizeRow(row)),
          sortColumn,
        }
      } catch (error) {
        if (isUndefinedColumnError(error)) {
          continue
        }
        throw error
      }
    }

    const queryText = buildQuery({
      table,
      whereClauses,
      paramsLength: queryParams.length,
    })
    const result = await client.query(queryText, queryParams)
    return {
      rows: result.rows.map((row) => normalizeRow(row)),
    }
  } finally {
    client.release()
  }
}
