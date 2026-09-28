# ARCHIVED — historical reference only

This code is retired, excluded from the active workspace, and must not be deployed.
The instructions below describe the former architecture and do not govern active code.

# Data Fetching

Hooks for fetching strength data with real-time polling.

## Files

- **FetchStrengthData.ts** - API service class
- **useStrengthData.ts** - Main data fetching hook (RECOMMENDED)
- **useRealtimeStrengthData.ts** - Legacy hook

## Data Flow

```
User selects tickers → dataState = 'loading'
      ↓
Historical fetch (up to 240 hours)
      ↓
dataState = 'ready', start polling
      ↓
Every 10s: fetch recent data → merge → trigger aggregation
```

## Real-Time Polling

**Interval:** 10 seconds (`updateIntervalMs: 10000`)

**Fetch window:** Dynamic based on time since last successful fetch
- Normal: 4 minutes
- After background: up to 2 hours (fills gaps)

**Process:**
1. Calculate fetch window from `lastSuccessfulFetchRef`
2. Fetch from API
3. Forward-fill null intervals from existing historical data
4. Merge into rawData (updates existing timestamps, adds new ones)

**Pause/Resume:** The `paused` option stops polling when user is scrolling the chart. On resume, immediate fetch fills any gaps.

## Background Tab Recovery

When tab is in background, JS execution is limited. On return:
1. Visibility change event triggers immediate fetch
2. Dynamic window calculates time since last fetch
3. All missing data fetched (capped at 2 hours)

## Forward-Fill

Database rows may have null interval values (not yet calculated).
Forward-fill copies the last known value to ensure chart continuity.

**Key improvements:**
1. First row of new data is forward-filled from existing historical data
2. Uses "composite row" approach: searches backwards for EACH interval separately
   - Different intervals may have different calculation lag in the database
   - Old approach required a single row with ALL intervals complete
   - New approach finds last non-null value for each interval independently
   - This prevents interval lines from stopping when some intervals lag behind

## State Machine

```
IDLE → LOADING → READY ←→ (polling)
  ↑        ↓
  ←― ticker change ―←
```

## Key Config

```typescript
const MIN_FETCH_MINUTES = 4    // Minimum window
const MAX_FETCH_MINUTES = 120  // Maximum window (2 hours)
updateIntervalMs: 10000        // 10 seconds polling
```

## Lazy Loading (Infinite History)

The hook supports loading older historical data on demand:

### New Return Values

```typescript
{
  earliestDataTime: Date | null,    // Timestamp of first data point
  latestDataTime: Date | null,      // Timestamp of last data point  
  fetchHistoricalDataBefore: (beforeDate: Date, minutes: number) => Promise<void>,
  isLoadingHistorical: boolean,     // Loading state for historical fetch
}
```

### fetchHistoricalDataBefore

Fetches data BEFORE the current earliest timestamp, used for lazy loading:

```typescript
// Fetch 120 minutes of data before the earliest point
fetchHistoricalDataBefore(earliestDataTime, 120)
```

**Process:**
1. Fetch from API: `fromDate = beforeDate - minutes`, `toDate = beforeDate`
2. Merge with existing data (prepend to beginning)
3. Update `earliestDataTimestampRef` and `earliestDataTime` state
4. Triggers re-aggregation with the new historical data

**Safeguards:**
- Prevents duplicate concurrent fetches via `isFetchingHistoricalRef`
- Exposes `isLoadingHistorical` for UI feedback and debouncing
