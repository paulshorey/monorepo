import dbSchema from '@lib/db-trading/generated/contracts/db-schema.json'

type DbColumnType = 'string' | 'number' | 'Date' | 'boolean' | 'unknown'

type DbColumnSchema = {
  column: string
  nullable: boolean
  type: DbColumnType
}

type RawDbSchema = Record<string, DbColumnSchema[]>

export type TableColumn = {
  name: string
  nullable: boolean
  type: DbColumnType
}

export type TableSchema = {
  route: string
  tableName: string
  columns: TableColumn[]
  columnsByName: Record<string, TableColumn>
  label: string
}

const rawSchema = dbSchema as RawDbSchema

function toRouteName(tableName: string): string {
  return tableName.replace(/_v\d+$/i, '')
}

function toLabel(route: string): string {
  return route
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

const routeCounts = Object.keys(rawSchema).reduce<Record<string, number>>(
  (acc, tableName) => {
    const route = toRouteName(tableName)
    acc[route] = (acc[route] || 0) + 1
    return acc
  },
  {}
)

export const TABLE_SCHEMAS: TableSchema[] = Object.entries(rawSchema).map(
  ([tableName, columns]) => {
    const baseRoute = toRouteName(tableName)
    const route =
      routeCounts[baseRoute] && routeCounts[baseRoute] > 1
        ? tableName
        : baseRoute

    const normalizedColumns = columns.map((column) => ({
      name: column.column,
      nullable: column.nullable,
      type: column.type,
    }))

    const columnsByName = normalizedColumns.reduce<Record<string, TableColumn>>(
      (acc, column) => {
        acc[column.name] = column
        return acc
      },
      {}
    )

    return {
      route,
      tableName,
      columns: normalizedColumns,
      columnsByName,
      label: toLabel(route),
    }
  }
)

const tableByRoute = TABLE_SCHEMAS.reduce<Record<string, TableSchema>>(
  (acc, table) => {
    acc[table.route] = table
    return acc
  },
  {}
)

export function getTableSchemaByRoute(route: string): TableSchema | undefined {
  return tableByRoute[route]
}

export const DEFAULT_TABLE_ROUTE =
  getTableSchemaByRoute('log')?.route || TABLE_SCHEMAS[0]?.route || ''
