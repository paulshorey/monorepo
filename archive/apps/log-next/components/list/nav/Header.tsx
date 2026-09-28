'use client'

import { colors } from '@/constants/ui'
import Link from 'next/link'
import React from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import type { WhereFilters } from '@/lib/searchParams'

type TableNav = {
  route: string
  label: string
}

type DebugInfo = {
  tableName: string
  sortColumn: string
}

export const Header = ({
  where,
  tableRoute,
  tables,
  debug,
}: {
  where: WhereFilters
  tableRoute: string
  tables: TableNav[]
  debug?: DebugInfo
}) => {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const clearParams = new URLSearchParams()
  const debugParam = searchParams.get('debug')
  const isDebugMode = debugParam === '1' || debugParam === 'true'
  if (isDebugMode) {
    clearParams.set('debug', '1')
  }
  const clearHref = clearParams.toString()
    ? `${pathname}?${clearParams.toString()}`
    : pathname

  return (
    <div className="flex justify-between pt-2 px-3">
      <div className="flex items-center gap-3">
        {Object.keys(where).length > 0 && (
          <Link
            href={clearHref}
            style={{
              color: colors.red,
            }}
            className="pl-1"
          >
            ◀ clear
          </Link>
        )}
        {debug && (
          <span className="text-xs" style={{ color: colors.gray }}>
            table: {debug.tableName} | sort: {debug.sortColumn}
          </span>
        )}
      </div>
      <nav className="flex gap-2">
        {tables.map((table) => {
          const href = `/${table.route}`
          const isActive = table.route === tableRoute

          return (
            <Link
              key={table.route}
              href={href}
              style={{
                color: isActive ? colors.green : colors.gray,
              }}
            >
              {table.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
