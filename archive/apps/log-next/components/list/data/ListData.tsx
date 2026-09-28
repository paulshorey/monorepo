'use client'

import { useMemo, useState } from 'react'
import { Json } from '@lib/common/fe/components/blocks/Json'
import { AccordionItem } from '@/components/list/accordion/AccordionItem'
import { Header } from '../nav/Header'
import { FilterBadge } from '../accordion/FilterBadge'
import type { DbRow } from '@/lib/dataAccess/getTableRows'
import type { WhereFilters } from '@/lib/searchParams'

type TableNav = {
  route: string
  label: string
}

type DebugInfo = {
  tableName: string
  sortColumn: string
}

function isNonEmpty(value: unknown): boolean {
  return value !== null && value !== undefined && value !== ''
}

function formatOrderLikeTitle(row: DbRow): string | null {
  const side = row.side
  const amount = row.amount
  const ticker = row.ticker
  const price = row.price

  if (!isNonEmpty(side) || !isNonEmpty(amount) || !isNonEmpty(ticker)) {
    return null
  }

  const left = `${String(side)} ${String(amount)} ${String(ticker)}`
  if (!isNonEmpty(price)) {
    return left
  }

  return `${left} @ ${String(price)}`
}

function getRowTitle(row: DbRow): string {
  const orderLike = formatOrderLikeTitle(row)
  if (orderLike) {
    return orderLike
  }

  const preferredKeys = ['message', 'name', 'ticker', 'type', 'id']
  const preferred = preferredKeys
    .map((key) => row[key])
    .find((value) => isNonEmpty(value))
  if (preferred !== undefined) {
    return String(preferred)
  }

  const firstValue = Object.values(row).find((value) => isNonEmpty(value))
  return firstValue !== undefined ? String(firstValue) : 'Unknown'
}

function toJsonRecord(value: unknown): Record<string, any> {
  if (typeof value === 'object' && value !== null) {
    return value as Record<string, any>
  }
  return { value }
}

function getRowDetail(row: DbRow): Record<string, any> {
  const stack = row.stack
  if (typeof stack !== 'string') {
    return toJsonRecord(row)
  }

  try {
    return toJsonRecord(JSON.parse(stack))
  } catch (_error) {
    return toJsonRecord(row)
  }
}

export function ListData({
  tableRoute,
  tables,
  filters,
  where,
  items,
  debug,
}: {
  tableRoute: string
  tables: TableNav[]
  filters: string[]
  where: WhereFilters
  items: DbRow[]
  debug?: DebugInfo
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const columnsWithValues = useMemo(
    () =>
      filters.filter((columnName) =>
        items.some((item) => isNonEmpty(item[columnName]))
      ),
    [filters, items]
  )

  return (
    <div>
      <Header tableRoute={tableRoute} tables={tables} where={where} debug={debug} />
      <main>
        {items.map((row: DbRow, index: number) => {
          const rowTitle = getRowTitle(row)
          const rowDetail = getRowDetail(row)
          const rowKey = row.id ?? `${tableRoute}-${index}`

          return (
            <AccordionItem
              classNames={{
                content: 'rounded-md bg-gray-800 mt-3 p-4',
              }}
              key={String(rowKey)}
              title={rowTitle}
              buttonsRight={columnsWithValues.map((columnName) => (
                <FilterBadge
                  key={columnName}
                  field={columnName}
                  value={row[columnName]}
                />
              ))}
              open={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? null : index)}
              className="relative pl-3 pr-0 pt-3 pb-3 border-b border-gray-600 "
            >
              <Json data={rowDetail} />
            </AccordionItem>
          )
        })}
      </main>
    </div>
  )
}
