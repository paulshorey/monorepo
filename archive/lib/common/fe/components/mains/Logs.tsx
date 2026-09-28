'use client'

import { Accordion } from '@mantine/core'
import { Json } from '../blocks/Json'
import classes from './Logs.module.scss'
import { Collapsed } from '../blocks/Collapsed'
import { LocalShortTime } from '../inline/LocalShortTime'
// import { cc } from '../../lib/cc';
import { Badge } from '../inline/Badge'

export function Logs({ logs }: any) {
  // cc.info(['client', 'Logs.tsx', `logs.length=${logs.length}`]);
  const sections = logs.map((log: any, i: number) => {
    let string = log.data
    if (
      typeof string === 'string' &&
      (string[0] === '{' || string[0] === '[')
    ) {
      string = string.substring(1, string.length - 1)
    }
    let dataParsed
    try {
      dataParsed = log.data ? JSON.parse(log.data) : null
    } catch (e) {
      dataParsed = `Could not serialize log.data=${log.data}`
    }

    const Title = string?.substring(0, 100)
    return (
      <Collapsed
        classNames={{
          content: 'rounded-md bg-gray-800',
        }}
        key={i}
        title={Title}
        buttonsRight={[
          log.dev ? <Badge key="1">dev</Badge> : undefined,
          <Badge key="2" className="font-bold">
            {log.type}
          </Badge>,
          <Badge key="3">
            <LocalShortTime epoch={log.time} />
          </Badge>,
        ]}
        openDefault={i === 0}
        isClickToToggle
        className="relative px-4 pt-3 pb-3 border-b border-gray-600 "
      >
        <Json data={dataParsed} />
      </Collapsed>
    )
  })

  return <Accordion className={classes.Accordion}>{sections}</Accordion>
}
