# ARCHIVED — historical reference only

This code is retired, excluded from the active workspace, and must not be deployed.
The instructions below describe the former architecture and do not govern active code.

# Charts Mini-App

Financial charting system built on `lightweight-charts` (v5.0.8). Dual y-axis charts showing strength (left) and price (right) with real-time updates.

## Folder Structure

```
charts/
├── SyncedChartsWrapper.tsx   # Entry point - waits for dimensions
├── SyncedCharts.tsx          # Orchestrates data flow
├── components/
│   ├── Chart.tsx             # Core chart rendering (lightweight-charts)
│   └── controls/             # Ticker, interval, date selectors
├── lib/
│   ├── data/                 # Data fetching (see lib/data/AGENTS.md)
│   ├── workers/              # Web Workers (see lib/workers/AGENTS.md)
│   ├── aggregation/          # Data aggregation
│   └── primitives/           # Custom chart primitives
└── state/                    # Zustand store + URL sync
```

## Key Technical Points

- **Timestamps:** 1-minute intervals, seconds/ms must be 0
- **Polling:** Every 10 seconds for real-time updates
- **Aggregation:** Runs in Web Worker (~1000-1500ms)
- **Caching:** Results cached by ticker+interval for instant switching

## Database

See `@lib/db-trading/sql/strength/` for data types and queries.

## Data Flow

```
useStrengthData (fetches raw data, polls every 10s)
      ↓
SyncedCharts (debounces, checks hash, triggers aggregation)
      ↓
Web Worker (aggregates all data off main thread)
      ↓
Chart.tsx (uses setData/update efficiently)
```

## Performance Optimizations

### 1. Aggregation Debouncing (2000ms)

Real-time data arrives every 10 seconds. Aggregation takes ~1000-1500ms.
Debounce prevents excessive aggregations while ensuring fresh data.

### 2. Smart Hash Comparison

Before aggregating, we compare a hash of:

- Data lengths and timestamps
- Last 5 price values (detects actual value changes)
  Skips aggregation if hash unchanged.

### 3. Result Caching

Aggregated results are cached by ticker+interval combination.
When switching back to a previously viewed ticker, cached data displays instantly.
Cache expires after 5 minutes.

### 4. Efficient Chart Updates

`Chart.tsx` uses `update()` for single-point changes and `setData()` only when necessary.
This is the `lightweight-charts` best practice for real-time data.

### 5. Background Tab Recovery

When tab is in background, polling may stop. On return:

- Visibility change triggers immediate fetch
- Dynamic window calculates missed time
- All missing data fetched in one request

### 6. Smart Pause/Resume (Latest Bar Visibility)

Real-time polling is controlled based on whether the latest bar is visible:

- Chart subscribes to `visibleLogicalRangeChange` to detect scroll position
- When **latest bar is visible**: polling continues, new data auto-scrolls into view
- When **latest bar is hidden** (user scrolled back): polling pauses automatically
- This prevents chart jumping while user explores historical data
- When user scrolls forward to see latest bar again, polling resumes
- On resume, all missed minutes are fetched (using dynamic fetch window)
- Visual indicator shows "⏸ paused" in bottom-right corner

### 7. Lazy Loading (Infinite History)

When user scrolls to the beginning of chart data, more historical data loads automatically:

**Trigger:** `barsInLogicalRange().barsBefore < LAZY_LOAD_BARS_THRESHOLD` (50 bars)

**Fetch:** Loads `LAZY_LOAD_FETCH_MINUTES` (120 minutes / 2 hours) of additional history

**Scroll Preservation:** When historical data is prepended, the view position is preserved:

1. Save `visibleLogicalRange` before `setData()`
2. After update, restore range with offset: `from + prependedBarsCount`, `to + prependedBarsCount`

**Data Flow:**

```
User scrolls near beginning
      ↓
Chart.tsx: onNeedMoreHistory callback
      ↓
SyncedCharts: handleNeedMoreHistory
      ↓
useStrengthData: fetchHistoricalDataBefore(earliestDataTime, minutes)
      ↓
FetchStrengthData: API fetch for older data
      ↓
Merge with existing data (prepend)
      ↓
Trigger aggregation worker
      ↓
Chart updates with scroll position preserved
```

## Chart Lines

4 independent toggles control visibility:

- **Aggregate Strength** (orange, left axis) - average of selected intervals
- **Individual Interval Strength** (light orange, left axis) - one line per interval
- **Aggregate Price** (blue, right axis) - normalized average of tickers
- **Individual Ticker Price** (light blue, right axis) - one line per ticker

UI buttons: `S` (strength), `s` (intervals), `P` (price), `p` (tickers)

### Dynamic Line Options via `applyOptions()`

Series options (`visible`, `lineWidth`, `color`) can be changed dynamically without recreating the chart or re-aggregating data. This enables instant show/hide and highlighting:

```typescript
series.applyOptions({
  visible: showStrengthIntervalLines && isSelected,
  lineWidth: isHighlightedInterval ? 2 : 1,
  color: isHighlightedInterval ? COLORS.strength : COLORS.strength_i,
})
```

**Key pattern:** Worker always computes ALL individual interval lines (not just selected). Chart.tsx controls visibility based on user selection. This avoids re-aggregation when user changes interval selection.

## Key Implementation Notes

- **dataVersion:** Increments on ticker change, used to ignore stale worker results
- **Never mutate arrays:** Use `[...arr].sort()` not `arr.sort()` to avoid mutating store state
- **Ticker comparison:** Uses Set-based comparison (order-independent) to detect changes
- **Forward-fill:** `buildLastKnownValuesRow()` finds last non-null value per interval separately

## Related Docs

- `lib/data/AGENTS.md` - Data fetching and polling
- `lib/workers/AGENTS.md` - Web Worker and race conditions

## Lightweight Charts Library

This strength app consists mostly of the charts logic and components in `charts` folder.
This app uses light-weight charts library. Documentation in `docs/lightweight-charts`.
@docs/lightweight-charts/AGENTS.md
