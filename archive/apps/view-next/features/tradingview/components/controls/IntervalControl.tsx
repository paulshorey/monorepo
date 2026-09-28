import { MultiSelect } from '@mantine/core'
import {
  useChartControlsStore,
  strengthIntervalsAll,
} from '../../state/useChartControlsStore'
import React from 'react'

interface Props {
  showLabel?: boolean
}

export default function IntervalControl({ showLabel = true }: Props) {
  // Get state and actions from Zustand store
  const { interval, setInterval } = useChartControlsStore()

  // Show count of selected intervals in placeholder
  const placeholderText =
    interval.length > 0 ? `${interval.length} timeframes` : 'Timeframes'

  return (
    <MultiSelect
      label={showLabel ? 'Interval' : undefined}
      value={interval}
      data={strengthIntervalsAll}
      onChange={setInterval}
      styles={{
        pill: {
          display: 'none',
        },
        input: {
          maxWidth: '100px',
          maxHeight: '27px',
          lineHeight: '27px',
        },
      }}
      placeholder={placeholderText}
      hidePickedOptions={false}
      classNames={{
        dropdown: 'scale2x',
      }}
      // Custom options format (not needed now, maybe in the future):
      // renderOption={({ option, checked }) => (
      //   <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      //     {checked && <span>✓</span>}
      //     <span>{option.label}</span>
      //   </div>
      // )}
    />
  )
}
