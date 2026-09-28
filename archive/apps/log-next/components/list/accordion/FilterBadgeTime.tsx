'use client'

import { Badge } from '@lib/common/fe/components/inline/Badge'
import Link from 'next/link'
import { getDayRange } from '@lib/common/fe/lib/time'
import { LocalShortTime } from '@lib/common/fe/components/inline/LocalShortTime'
import { usePathname, useSearchParams } from 'next/navigation'
import { colors } from '@/constants/ui'

export function FilterBadgeTime({ time }: { time: number }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  if (!time) {
    return null
  }

  const { startOfDay, endOfDay } = getDayRange(time)
  const [localTime, localDate] = LocalShortTime({ epoch: time })

  const isActive =
    searchParams.get('time_start') === String(startOfDay) &&
    searchParams.get('time_end') === String(endOfDay)

  const newParams = new URLSearchParams(searchParams.toString())
  if (isActive) {
    newParams.delete('time_start')
    newParams.delete('time_end')
  } else {
    newParams.set('time_start', String(startOfDay))
    newParams.set('time_end', String(endOfDay))
  }

  return (
    <Badge className="">
      <span
        className="mr-2"
        style={{
          color: colors.gray,
        }}
      >
        {localTime}
      </span>
      <Link
        className="font-bold mr-2"
        key="edit"
        href={`${pathname}?${newParams.toString()}`}
        style={{
          color: isActive ? colors.gray : colors.green,
          // textDecoration: isActive ? 'none' : 'underline',
        }}
      >
        {localDate}
      </Link>
    </Badge>
  )
}
