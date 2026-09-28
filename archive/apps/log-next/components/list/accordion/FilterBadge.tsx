'use client'

import { Badge } from '@lib/common/fe/components/inline/Badge'
import { colors } from '@/constants/ui'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

export function FilterBadge({
  field,
  value,
}: {
  field: string
  value: unknown
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  if (value === null || value === undefined || value === '') {
    return null
  }

  const valueAsString = String(value)
  const isActive = searchParams.get(field) === valueAsString

  const newParams = new URLSearchParams(searchParams.toString())
  if (isActive) {
    newParams.delete(field)
  } else {
    newParams.set(field, valueAsString)
  }

  return (
    <Badge className="pr-2">
      <Link
        key="edit"
        href={`${pathname}?${newParams.toString()}`}
        style={{
          color: isActive ? colors.gray : colors.green,
          // textDecoration: isActive ? 'none' : 'underline',
        }}
      >
        {' '}
        {valueAsString}{' '}
      </Link>
    </Badge>
  )
}
