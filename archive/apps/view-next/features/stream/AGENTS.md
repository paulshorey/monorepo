# ARCHIVED — historical reference only

This code is retired, excluded from the active workspace, and must not be deployed.
The instructions below describe the former architecture and do not govern active code.

# Stream Chart

Real-time financial chart using `lightweight-charts` to display price, CVD, RSI, and various market metrics with absorption detection markers.

## Architecture

Wrapper.tsx - Loaded first. Waits for window to load, to know available screen size. It passes available width/height to Chart.tsx.
Chart.tsx - Renders full-screen chart. Calls function to set up time series plots, and another function to populate plots with real-time updating data.
plot/ -
plot/useInitChart.ts - called by Chart.tsx to set up chart, series, and zoom/interaction handlers. Returns `seriesRefs` and `latestBarVisibleRef`.
plot/usePollData.ts - called by Chart.tsx to manage data. Fetches, aggregates, and adds data to `seriesRefs` returned by useInitChart.ts. Handles initial load, real-time polling, and lazy-loading historical data on scroll.
plot/usePlotData.ts - transforms Candle[] data through series formatters and calls setData() on each enabled series.
plot/constants.ts - configuration to render, enable, and style each line plot and marker on the chart.
lib/ -
lib/indicators.ts - utility functions to generate custom time series like RSI (relative strength) from price/volume.
ui/ -
ui/useEventPatcher.ts - the page is zoomed out to 50%, to fit more pixels on the screen (higher resolution charts). Then the user elements on the page are zoomed in 200% using CSS. This fixes the remaining issue of user cursor position, which in lightweight-charts library does not notice the 50% zoom out. So this script hijacks cursor position from lightweight-charts and modifies it to expand 200% to fill the new screen resolution.

## Zoom behavior (useInitChart.ts)

Zoom uses an adaptive anchor point that depends on whether the chart is in real-time or historical mode:

- **Real-time mode** (latest bar visible): zoom anchors at the right edge of the visible range, keeping the last candle fixed. Expansion/contraction happens on the left (into history).
- **Historical mode** (scrolled back in time): zoom anchors at the mouse cursor position (desktop) or pinch midpoint (mobile), keeping the point under the cursor fixed.

Mode is determined by subscribing to `subscribeVisibleLogicalRangeChange` and checking if the visible range's right edge is within `LATEST_BAR_VISIBILITY_BUFFER` bars of the last data point.

Desktop zoom requires ctrl/cmd + scroll wheel. A momentum scroll cooldown (`ZOOM_COOLDOWN_MS`) prevents macOS trackpad momentum events from unintentionally panning the chart after a zoom gesture. Mouse position is tracked from original (unpatched) events with manual scale factor correction, since `useEventPatcher` patches mouse coordinates separately for the chart library.
