'use client'

import { JsonView, darkStyles } from 'react-json-view-lite'
import classes from './Json.module.scss'
import { Copy } from '../buttons/Copy'

type Props = {
  data: Record<string, any>
  expandUntil?: number
}

export function Json({ data, expandUntil = 3 }: Props) {
  const styles = darkStyles
  for (const key in styles) {
    if (classes[key]) {
      // @ts-ignore
      styles[key] = `${styles[key]} ${classes[key]}`
    }
  }
  styles.noQuotesForStringValues = true

  let displayData = {} as Record<string, any>
  if (typeof data !== 'object' || data === null) {
    displayData = data
  } else {
    for (let key in data) {
      if (data[key] !== null && typeof data[key] === 'object') {
        displayData[key] = data[key]
      } else {
        displayData[key] = data[key]
      }
    }
  }
  return (
    <div
      suppressHydrationWarning
      className={`relative px-1 pb-1 bg-slate-800 ${classes.JsonViewContainer}`}
    >
      <Copy
        text={JSON.stringify(data, null, 2)}
        className="right-1 top-1"
        style={{ position: 'absolute' }}
      />
      <JsonView
        data={displayData}
        shouldExpandNode={(level: number) => level < expandUntil}
        clickToExpandNode
        style={styles}
      />
    </div>
  )
}
