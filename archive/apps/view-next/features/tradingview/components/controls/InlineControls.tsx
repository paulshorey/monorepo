'use client'

import React from 'react'
import IntervalControl from './IntervalControl'
// import { ControlsDropdown } from './ControlsDropdown'
import { COLORS } from '../../constants'
import { useChartControlsStore } from '@/features/tradingview/state/useChartControlsStore'

export default function InlineControls({
  drawerNewsOpen,
  drawerCalendarOpen,
}: {
  drawerNewsOpen: () => void
  drawerCalendarOpen: () => void
}) {
  const {
    showStrengthIndicatorLine,
    setshowStrengthIndicatorLine,
    showPriceIndicatorLine,
    setShowPriceIndicatorLine,
    showStrengthLine,
    setShowStrengthLine,
    showStrengthIntervalLines,
    setShowStrengthIntervalLines,
    showPriceLine,
    setShowPriceLine,
    showPriceTickerLines,
    setShowPriceTickerLines,
  } = useChartControlsStore()
  return (
    <div
      className="flex flex-row justify-end mr-[10px] pt-[6px] scale2x"
      style={{ transformOrigin: 'right top' }}
    >
      <div className="">
        <div dir="ltr" className="flex flex-row">
          <span className="flex flex-row">
            <IntervalControl showLabel={false} />
          </span>
        </div>
      </div>
      {/* Strength indicator line toggle */}
      <div className="flex">
        <button
          onClick={() =>
            setshowStrengthIndicatorLine(!showStrengthIndicatorLine)
          }
          className={`px-1.5 py-0.5 text-xs rounded-l transition-colors border-l border-t border-b`}
          style={{
            borderColor: showStrengthIndicatorLine
              ? COLORS.indicator
              : 'transparent',
            backgroundColor: showStrengthIndicatorLine
              ? COLORS.indicator + '20'
              : 'transparent',
            color: COLORS.indicator,
          }}
          title="Show/hide strength indicator line"
        >
          I
        </button>
      </div>
      {/* Strength line toggles */}
      <div className="flex">
        <button
          onClick={() => setShowStrengthLine(!showStrengthLine)}
          className={`px-1.5 py-0.5 text-xs transition-colors border-l border-t border-b`}
          style={{
            borderColor: showStrengthLine ? COLORS.strength : 'transparent',
            backgroundColor: showStrengthLine
              ? COLORS.strength + '20'
              : 'transparent',
            color: COLORS.strength,
          }}
          title="Show/hide aggregate strength line"
        >
          S
        </button>
        <button
          onClick={() =>
            setShowStrengthIntervalLines(!showStrengthIntervalLines)
          }
          className={`px-1.5 py-0.5 text-xs rounded-r transition-colors border`}
          style={{
            borderColor: showStrengthIntervalLines
              ? COLORS.strength_i
              : 'transparent',
            backgroundColor: showStrengthIntervalLines
              ? COLORS.strength_i + '20'
              : 'transparent',
            color: COLORS.strength_i,
          }}
          title="Show/hide individual interval strength lines"
        >
          s
        </button>
      </div>
      {/* Price indicator line toggle */}
      <div className="flex ml-1">
        <button
          onClick={() => setShowPriceIndicatorLine(!showPriceIndicatorLine)}
          className={`px-1.5 py-0.5 text-xs rounded-l transition-colors border-l border-t border-b`}
          style={{
            borderColor: showPriceIndicatorLine
              ? COLORS.indicator
              : 'transparent',
            backgroundColor: showPriceIndicatorLine
              ? COLORS.indicator + '20'
              : 'transparent',
            color: COLORS.indicator,
          }}
          title="Show/hide price indicator line"
        >
          i
        </button>
      </div>
      {/* Price line toggles */}
      <div className="flex">
        <button
          onClick={() => setShowPriceLine(!showPriceLine)}
          className={`px-1.5 py-0.5 text-xs transition-colors border-l border-t border-b`}
          style={{
            borderColor: showPriceLine ? COLORS.price : 'transparent',
            backgroundColor: showPriceLine
              ? COLORS.price + '20'
              : 'transparent',
            color: COLORS.price,
          }}
          title="Show/hide aggregate price line"
        >
          P
        </button>
        <button
          onClick={() => setShowPriceTickerLines(!showPriceTickerLines)}
          className={`px-1.5 py-0.5 text-xs rounded-r transition-colors border`}
          style={{
            borderColor: showPriceTickerLines ? COLORS.price_i : 'transparent',
            backgroundColor: showPriceTickerLines
              ? COLORS.price_i + '20'
              : 'transparent',
            color: COLORS.price_i,
          }}
          title="Show/hide individual ticker price lines"
        >
          p
        </button>
      </div>
      <div>
        <button
          className={`px-2 py-0.5 text-xs rounded transition-colors border border-transparent`}
          onClick={drawerNewsOpen}
        >
          N
        </button>
      </div>
      <div>
        <button
          className={`px-2 py-0.5 text-xs rounded transition-colors border border-transparent`}
          onClick={drawerCalendarOpen}
        >
          C
        </button>
      </div>
      {/* <ControlsDropdown /> */}
    </div>
  )
}
