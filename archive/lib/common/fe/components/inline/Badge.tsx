'use client'

import React from 'react'

type Props = React.ComponentProps<'span'>

export function Badge({ className, children, ...props }: Props) {
  return (
    <span className={`p-1 text-sm ${className}`} {...props}>
      {children}
    </span>
  )
}
