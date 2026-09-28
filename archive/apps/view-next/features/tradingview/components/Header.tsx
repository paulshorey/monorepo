'use client'

import React from 'react'
import InlineControls from './controls/InlineControls'
import classes from '../classes.module.scss'
import MarketControl from './controls/MarketControl'
import { useDisclosure } from '@mantine/hooks'
import { DrawerCalendar } from './DrawerCalendar'
import { DrawerNews } from './DrawerNews'

export default function Header() {
  const [drawerNewsOpened, { open: drawerNewsOpen, close: drawerNewsClose }] =
    useDisclosure(false)
  const [
    drawerCalendarOpened,
    { open: drawerCalendarOpen, close: drawerCalendarClose },
  ] = useDisclosure(false)
  return (
    <>
      <DrawerCalendar
        drawerOpened={drawerCalendarOpened}
        closeDrawer={drawerCalendarClose}
      />
      <DrawerNews
        drawerOpened={drawerNewsOpened}
        closeDrawer={drawerNewsClose}
      />
      <div dir="ltr" className={classes.Header}>
        {/* Top bar */}
        <div className="relative flex flex-row justify-between z-[100]">
          {/* Left */}
          <MarketControl showLabel={false} />

          {/* Center */}
          {/* <div className="flex-1 pl-2 py-1 mt-[12px] font-semibold text-gray-900 w-full text-center">
          <span
            style={{
              scale: '1.05 1',
              transformOrigin: 'left center',
            }}
          >
            strength<span className="text-gray-400">.finance</span>
          </span>
        </div> */}

          {/* Right */}
          <InlineControls
            drawerNewsOpen={drawerNewsOpen}
            drawerCalendarOpen={drawerCalendarOpen}
          />
        </div>
      </div>
    </>
  )
}
