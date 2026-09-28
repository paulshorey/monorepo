import type { TableColumn } from '@/config/schemaRegistry'

export type PageSearchParams = Record<string, string | string[] | undefined>

export type WhereValue = string | number | boolean | Date

export type WhereFilters = Record<string, WhereValue>

function getScalarValue(
  value: string | string[] | undefined
): string | undefined {
  if (Array.isArray(value)) {
    return value[0]
  }
  return value
}

function parseNumber(input: string): number | undefined {
  const parsed = Number(input)
  return Number.isFinite(parsed) ? parsed : undefined
}

function parseDate(input: string): Date | undefined {
  const parsed = new Date(input)
  return Number.isNaN(parsed.getTime()) ? undefined : parsed
}

function parseBoolean(input: string): boolean | undefined {
  if (input === 'true') {
    return true
  }
  if (input === 'false') {
    return false
  }
  return undefined
}

function parseByColumnType(
  value: string,
  column: TableColumn
): WhereValue | undefined {
  if (value === '') {
    return undefined
  }

  if (column.type === 'number') {
    return parseNumber(value)
  }
  if (column.type === 'Date') {
    return parseDate(value)
  }
  if (column.type === 'boolean') {
    return parseBoolean(value)
  }

  return value
}

export function parseExactWhereFromSearchParams({
  searchParams,
  columnsByName,
}: {
  searchParams: PageSearchParams
  columnsByName: Record<string, TableColumn>
}): WhereFilters {
  const where: WhereFilters = {}

  for (const [key, rawValue] of Object.entries(searchParams)) {
    const column = columnsByName[key]
    if (!column) {
      continue
    }

    const value = getScalarValue(rawValue)
    if (value === undefined) {
      continue
    }

    const parsed = parseByColumnType(value, column)
    if (parsed === undefined) {
      continue
    }

    where[key] = parsed
  }

  return where
}
