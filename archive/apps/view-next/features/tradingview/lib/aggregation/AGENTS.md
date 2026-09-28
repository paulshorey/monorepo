# ARCHIVED — historical reference only

This code is retired, excluded from the active workspace, and must not be deployed.
The instructions below describe the former architecture and do not govern active code.

# Data Aggregation

Functions for aggregating strength and price data across multiple tickers and intervals.

## Files

**aggregateDataUtils.ts** - Shared utilities:
- `extractGlobalTimestamps()` - Collect all unique timestamps from data
- `forwardFillData()` - Forward-fill missing values (aggressive interpolation)
- `extendDataIntoFuture()` - Add 12 hours of flat projection
- `aggregateStrengthDataWithInterpolation()` - Forward-fill and aggregate strength

**aggregateStrengthData.ts** - Strength aggregation (left y-axis):
- `aggregateStrengthData()` - Average selected intervals across all tickers
- `aggregateStrengthByInterval()` - Separate line per interval

**aggregatePriceData.ts** - Price aggregation (right y-axis):
- `aggregatePriceData()` - Normalized average of all tickers
- `aggregatePriceByTicker()` - Separate normalized line per ticker

**Important**: Both price functions share normalization context to ensure ticker lines converge at the right edge.

## Data Flow

```
Raw Data (StrengthRowGet[])
      ↓
extractGlobalTimestamps() - collect all unique timestamps
      ↓
forwardFillData() - fill missing values with forward-fill
      ↓
aggregate/normalize - combine data across tickers/intervals
      ↓
extendDataIntoFuture() - add 12 hours of flat line projection
      ↓
LineData[] - ready for chart rendering
```

## Price Normalization

Each ticker's prices are normalized relative to its last valid price:

1. Divide each price by the ticker's last price (so last = 1.0)
2. Calculate average of all tickers' last prices (`avgLastPrice`)
3. Scale normalized values by `avgLastPrice` for meaningful absolute values

This ensures:
- Individual ticker lines converge at the right edge
- The aggregated line passes through the average of individual lines
- Visual consistency between aggregated and individual price lines

