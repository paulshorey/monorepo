'use client'

import React from 'react'

interface LoadingStateProps {
  message?: string
}

export function LoadingState({
  message = 'Loading strength data...',
}: LoadingStateProps) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-lg">{message}</div>
    </div>
  )
}

interface ErrorStateProps {
  error: string
}

export function ErrorState({ error }: ErrorStateProps) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-lg text-red-500">Error: {error}</div>
    </div>
  )
}

export function NoDataState() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-white rounded">
      <div className="text-lg text-gray-500">No data</div>
    </div>
  )
}
