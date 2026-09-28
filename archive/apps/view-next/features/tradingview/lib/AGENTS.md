# ARCHIVED — historical reference only

This code is retired, excluded from the active workspace, and must not be deployed.
The instructions below describe the former architecture and do not govern active code.

# Charts Library Files

Utilities and functions for chart rendering, data processing, and real-time updates.

## Folder Structure

```
lib/
├── data/                   # Data fetching (@data/AGENTS.md)
├── aggregation/            # Data aggregation (@aggregation/AGENTS.md)
├── workers/                # Web Workers (@workers/AGENTS.md)
├── primitives/             # Time ranges and markers (@primitives/AGENTS.md)
├── chartConfig.ts          # Chart styling and configuration
├── chartUtils.ts           # Time range calculations, series update utilities
└── useChartEventPatcher.ts # Mouse event coordinate fix for zoom: 0.5
```

## Web Workers (@workers/AGENTS.md)

Aggregation runs in a Web Worker to prevent UI freezes during real-time updates:

- **aggregation.worker.ts** - Self-contained worker with all aggregation logic
- **useAggregationWorker.ts** - React hook to manage worker lifecycle
- **types.ts** - Shared types for worker communication

## Data Fetching (@data/AGENTS.md)

- **FetchStrengthData.ts** - API client for fetching strength data
- **useRealtimeStrengthData.ts** - React hook: polls for new data every 10 seconds

## Data Aggregation (@aggregation/AGENTS.md)

- **aggregateStrengthData.ts** - Aggregate strength data across tickers/intervals
- **aggregatePriceData.ts** - Aggregate and normalize price data
- **aggregateDataUtils.ts** - Shared utilities (timestamps, forward-fill, extend future)

Note: These functions are also inlined in the worker for off-thread execution.

## Custom Primitives (@primitives/AGENTS.md)

- **TimeRangeHighlight.ts** - Shaded background regions for market hours
- **VerticalLinePrimitive.ts** - Vertical line markers for events
- **timeMarkers.ts** - Configuration for time ranges and markers
- **forwardFillData.ts** - Add data points at time range boundaries

## Chart Configuration

- **chartConfig.ts** - Chart options, dual y-axes configuration
- **chartUtils.ts** - Time range calculations, data formatting, `updateSeriesEfficiently()` for optimal chart updates

## Chart Hooks

- **useChartEventPatcher.ts** - Patches mouse events for zoom: 0.5 scaling fix (coordinates need doubling)
- **useTimeMarkers.ts** - Creates time markers (vertical lines) and range highlights (shaded backgrounds)
