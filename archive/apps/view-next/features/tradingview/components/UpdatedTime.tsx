'use client'

import React from 'react'

interface UpdatedTimeProps {
  isRealtime: boolean
  lastUpdateTime: Date | null
  paused?: boolean
}

export function UpdatedTime({
  isRealtime,
  lastUpdateTime,
  paused = false,
}: UpdatedTimeProps) {
  if (!isRealtime || !lastUpdateTime) return null

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
  }

  return (
    <div
      className="fixed bottom-[1.25rem] right-1 z-[10001] scale2x"
      dir="ltr"
      style={{ transformOrigin: 'bottom right' }}
    >
      {paused && <span className="text-xs text-gray-500 bg-white">⏸ </span>}
      <span className="text-xs text-orange-400 bg-white">
        {formatTime(lastUpdateTime)}
      </span>
    </div>
  )
}
