# ARCHIVED — historical reference only

This code is retired, excluded from the active workspace, and must not be deployed.
The instructions below describe the former architecture and do not govern active code.

# Web Workers

Aggregation runs in a Web Worker to prevent UI freezes.

## Files

- **aggregation.worker.ts** - Self-contained worker (all logic inlined, no imports)
- **useAggregationWorker.ts** - React hook managing worker lifecycle
- **types.ts** - Shared types for worker communication

## Why Workers?

Aggregation processes ~14,400 data points with forward-fill, normalization, and averaging.
Takes 1000-1500ms. Running on main thread would freeze the UI.

## Race Condition Prevention

When tickers change rapidly, multiple aggregations may be in flight.
The `dataVersion` system ensures stale results are ignored:

1. `dataVersion` increments on ticker change
2. Worker echoes back `dataVersion` in results
3. Results with old version are discarded at multiple levels

## Usage

```typescript
const { aggregate, isReady, setValidDataVersion } = useAggregationWorker({
  onResult: (result, processingTimeMs, dataVersion) => { ... },
  onError: (error) => { ... },
})

// Set valid version to ignore stale results
setValidDataVersion(dataVersion)

// Trigger aggregation
aggregate(rawData, intervals, tickers, dataVersion)
```

## What the Worker Computes

1. **Strength data** - Average of selected intervals across all tickers
2. **Price data** - Normalized average of all tickers
3. **Interval data** - Individual line per ALL intervals (not just selected)
4. **Ticker data** - Individual line per ticker (for detail view)

All results extend 12 hours into the future (flat projection).

**Note:** Individual interval lines are computed for ALL intervals regardless of selection. This enables instant visibility toggling without re-aggregation. Chart.tsx controls which lines are visible based on the `interval` selection array.
