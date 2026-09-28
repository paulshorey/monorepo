'use client'

import React from 'react'
import { Combobox, InputBase, Input, useCombobox } from '@mantine/core'
import {
  useChartControlsStore,
  tickersByMarket,
} from '../../state/useChartControlsStore'
import { IconChevronDown } from '@tabler/icons-react'
import { cursorTo } from 'readline'

interface Props {
  showLabel?: boolean
}

export default function MarketControl({ showLabel = true }: Props) {
  // Get state and actions from Zustand store
  const { chartTickers, setChartTickers } = useChartControlsStore()

  // ComboBox for ticker selector
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  })

  // Find the selected option label by searching through all markets
  let selectedOption: { label: string; value: string[] } | undefined
  for (const market of tickersByMarket) {
    const found = market.tickers.find(
      (ticker) => JSON.stringify(ticker.value) === JSON.stringify(chartTickers)
    )
    if (found) {
      selectedOption = found
      break
    }
  }

  // Handler that updates the ticker selection
  const handleTickerSelect = (val: string) => {
    const tickers = JSON.parse(val) as string[]
    setChartTickers(tickers)
    combobox.closeDropdown()
  }

  return (
    <Combobox
      offset={2}
      store={combobox}
      withinPortal={true}
      position="top-start"
      onOptionSubmit={handleTickerSelect}
      // @ts-ignore
      className="flex flex-row justify-end mr-[10px] px-[6px] pt-[6px]"
      style={{
        cursor: 'pointer',
        '--mantine-color-text': 'black',
      }}
      styles={{
        dropdown: {
          boxShadow: '1px 1px 4px 0 rgba(0, 0, 0, 0.1)',
          maxHeight: '95vh',
          position: 'fixed',
          top: '0.5rem',
          left: '0.5rem',
          overflowY: 'auto',
          whiteSpace: 'nowrap',
        },
      }}
    >
      <Combobox.Target>
        <InputBase
          className="scale2x"
          styles={{
            input: {
              minWidth: '95px',
              pointerEvents: 'all',
              userSelect: 'all',
              boxShadow: '1px 1px 1px 0 rgba(0, 0, 0, 0.1)',
            },
          }}
          component="button"
          type="button"
          pointer
          rightSection={
            <IconChevronDown
              size={14}
              style={{ position: 'absolute', top: '0', height: '28px' }}
            />
          }
          onClick={() => combobox.toggleDropdown()}
          rightSectionPointerEvents="none"
          label={showLabel ? 'Ticker:' : null}
        >
          {selectedOption ? (
            selectedOption.label
          ) : (
            <Input.Placeholder>Pick ticker</Input.Placeholder>
          )}
        </InputBase>
      </Combobox.Target>

      <Combobox.Dropdown
        className="scale2x"
        style={{ zIndex: 1000000000, minWidth: '125px' }}
      >
        <Combobox.Options>
          {tickersByMarket.map((market) => (
            <Combobox.Group key={market.market} label={market.market}>
              {market.tickers.map((ticker) => (
                <Combobox.Option
                  value={JSON.stringify(ticker.value)}
                  key={JSON.stringify(ticker.value)}
                >
                  {ticker.label}
                </Combobox.Option>
              ))}
            </Combobox.Group>
          ))}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  )
}
