# ARCHIVED — historical reference only

This code is retired, excluded from the active workspace, and must not be deployed.
The instructions below describe the former architecture and do not govern active code.

# Lightweight Charts v5.1 Documentation

TradingView's lightweight-charts library for client-side financial charting.

## Table of Contents

| Concept | File | Description |
|---------|------|-------------|
| **Getting Started** | [intro.mdx](./intro.mdx) | Installation, creating charts/series, setting data |
| **Chart Types** | [chart-types.mdx](./chart-types.mdx) | Standard time-based, yield curve, options (price-based), custom horizontal scale |
| **Series Types** | [series-types.mdx](./series-types.mdx) | Area, Bar, Baseline, Candlestick, Histogram, Line, Custom |
| **Time Scale** | [time-scale.md](./time-scale.md) | Horizontal axis, visible range (data/logical), chart margins |
| **Price Scale** | [price-scale.md](./price-scale.md) | Vertical axis, left/right/overlay scales |
| **Panes** | [panes.md](./panes.md) | Multiple panes for displaying related data (e.g., price + volume) |
| **Time Zones** | [time-zones.md](./time-zones.md) | Not natively supported—manual timestamp adjustment required |
| **Release Notes** | [release-notes.md](./release-notes.md) | Changelog for all versions |

### Plugins

| Concept | File | Description |
|---------|------|-------------|
| **Overview** | [plugins/intro.md](./plugins/intro.md) | Custom series and primitives overview |
| **Custom Series** | [plugins/custom_series.md](./plugins/custom_series.md) | Define new series types with custom rendering |
| **Series Primitives** | [plugins/series-primitives.mdx](./plugins/series-primitives.mdx) | Custom drawings attached to a series (can draw on pane + axes) |
| **Pane Primitives** | [plugins/pane-primitives.md](./plugins/pane-primitives.md) | Chart-wide annotations (watermarks), cannot draw on axes |
| **Canvas Rendering** | [plugins/canvas-rendering-target.md](./plugins/canvas-rendering-target.md) | Bitmap vs media coordinate space |
| **Pixel Perfect** | [plugins/pixel-perfect-rendering/](./plugins/pixel-perfect-rendering/) | Crisp rendering using integer bitmap coordinates |

## Quick Reference

### Create Chart & Series

```js
import { createChart, AreaSeries, CandlestickSeries } from 'lightweight-charts'

const chart = createChart(container, options)
const series = chart.addSeries(CandlestickSeries, { upColor: '#26a69a', downColor: '#ef5350' })
series.setData([{ time: '2024-01-01', open: 100, high: 110, low: 95, close: 105 }])
series.update({ time: '2024-01-02', open: 105, high: 115, low: 100, close: 110 }) // Real-time update
chart.timeScale().fitContent()
```

### Chart Types

- `createChart()` — Standard time-based (most common)
- `createYieldCurveChart()` — Yield curves with linear monthly spacing
- `createOptionsChart()` — Price-based horizontal scale
- `createChartEx()` — Custom horizontal scale behavior

### Series Types

| Type | Data Format | Use Case |
|------|-------------|----------|
| `AreaSeries` | `{ time, value }` | Filled area charts |
| `LineSeries` | `{ time, value }` | Simple line plots |
| `BaselineSeries` | `{ time, value }` | Above/below baseline with different colors |
| `HistogramSeries` | `{ time, value, color? }` | Volume indicators |
| `CandlestickSeries` | `{ time, open, high, low, close }` | OHLC price data |
| `BarSeries` | `{ time, open, high, low, close }` | OHLC with vertical bars |

### Scales

**Time Scale** (horizontal):
- `chart.timeScale().fitContent()` — Fit all data
- `chart.timeScale().setVisibleRange({ from, to })` — Set visible date range
- `chart.timeScale().setVisibleLogicalRange({ from, to })` — Set by bar indices

**Price Scale** (vertical):
- Default: left + right scales
- Overlay scales: assign unique `priceScaleId` to series
- `series.priceScale()` — Get scale API for a series

### Panes

Multi-pane support for separating indicators (v5.0+):

```js
const mainPane = chart.panes()[0]
const newPane = chart.addPane()
newPane.addSeries(HistogramSeries, { priceScaleId: 'volume' })
```

### Time Zones

Library processes all timestamps as UTC. To display local time, manually adjust timestamps:

```js
function timeToLocal(utcTimestamp) {
  const d = new Date(utcTimestamp * 1000)
  return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 
                  d.getHours(), d.getMinutes(), d.getSeconds()) / 1000
}
```

### Plugins

**Series Primitive** — Attach to series, can draw on main pane + price/time axes:
```js
series.attachPrimitive(myPrimitive)
```

**Pane Primitive** — Chart-wide (watermarks), cannot draw on axes:
```js
chart.panes()[0].attachPrimitive(myPanePrimitive)
```

## v5.0+ Key Features

- **Multi-pane support** — Independent viewing areas
- **Data conflation** (v5.1) — Performance optimization for large datasets when zoomed out
- **Watermarks as plugins** — `TextWatermark`, `ImageWatermark`
- **Series markers as plugin** — Extracted for better tree-shaking
- **New chart types** — Yield curve, options charts
- **Bundle size reduced ~16%** — Down to ~35kB base

## Migration Notes

v5.0 breaking changes:
- New unified series creation: `chart.addSeries(CandlestickSeries)` instead of `chart.addCandlestickSeries()`
- CommonJS dropped, ES2020 only
- Watermarks/markers moved to plugins

