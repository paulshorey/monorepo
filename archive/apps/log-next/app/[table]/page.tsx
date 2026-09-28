import { notFound } from 'next/navigation'
import { ThemeWrapper } from '@/components/ThemeWrapper'
import { ListData } from '@/components/list/data/ListData'
import { getTableRows } from '@/lib/dataAccess/getTableRows'
import { parseExactWhereFromSearchParams } from '@/lib/searchParams'
import { getTableSchemaByRoute, TABLE_SCHEMAS } from '@/config/schemaRegistry'

export const revalidate = 0

type PageProps = {
  params: { table: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

function isDebugModeEnabled(
  value: string | string[] | undefined
): boolean {
  const scalar = Array.isArray(value) ? value[0] : value
  return scalar === '1' || scalar === 'true'
}

export default async function Page({ params, searchParams }: PageProps) {
  const table = getTableSchemaByRoute(params.table)
  if (!table) {
    notFound()
  }

  const where = parseExactWhereFromSearchParams({
    searchParams,
    columnsByName: table.columnsByName,
  })

  const { rows, sortColumn } = await getTableRows({
    table,
    where,
  })
  const debugEnabled = isDebugModeEnabled(searchParams.debug)

  return (
    <ThemeWrapper colorScheme="dark">
      <ListData
        tableRoute={table.route}
        tables={TABLE_SCHEMAS.map((entry) => ({
          route: entry.route,
          label: entry.label,
        }))}
        filters={table.columns.map((column) => column.name)}
        where={where}
        items={rows}
        debug={
          debugEnabled
            ? {
                tableName: table.tableName,
                sortColumn: sortColumn || 'none',
              }
            : undefined
        }
      />
    </ThemeWrapper>
  )
}
