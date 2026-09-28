'use client'

import React from 'react'
import classes from '../classes.module.scss'

interface ChartTitleProps {
  heading: string | React.ReactNode
  hasData: boolean
  children?: React.ReactNode
}

export default function ChartTitle({
  heading,
  hasData,
  children,
}: ChartTitleProps) {
  return (
    <div dir="ltr" className={classes.ChartTitleWrapperAbsolute}>
      <div className={classes.ChartTitleInnerFixed}>
        {heading}
        {!hasData && children}
      </div>
    </div>
  )
}
