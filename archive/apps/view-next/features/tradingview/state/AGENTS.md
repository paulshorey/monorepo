# ARCHIVED — historical reference only

This code is retired, excluded from the active workspace, and must not be deployed.
The instructions below describe the former architecture and do not govern active code.

# State Management

Zustand store for chart controls with URL query parameter synchronization.

## Files

- **useChartControlsStore.ts** - Zustand store managing chart state (tickers, intervals, time range, toggles)
- **lib/urlSync.ts** - Syncs state with URL query params for persistent bookmarkable state

## Key State

- `chartTickers` - Selected tickers to display
- `interval` - Selected intervals for strength calculation
- `hoursBack` - Time range (hours of historical data)
- **Line visibility toggles (4 independent toggles):**
  - `showStrengthLine` - Toggle aggregate strength line
  - `showStrengthIntervalLines` - Toggle individual interval strength lines
  - `showPriceLine` - Toggle aggregate price line
  - `showPriceTickerLines` - Toggle individual ticker price lines
- `strengthAverage` / `priceAverage` - Cached aggregated data
- `strengthIntervals` / `priceTickers` - Individual interval/ticker line data

State changes automatically update URL, allowing users to bookmark specific chart configurations.

## Documentation

After you edit any of the concepts mentioned here, update this file ./apps/tradingview/stream/AGENTS.md with the changes. Keep this file concise and accurate.
