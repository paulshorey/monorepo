# ARCHIVED — historical reference only

This code is retired, excluded from the active workspace, and must not be deployed.
The instructions below describe the former architecture and do not govern active code.

# Custom Chart Primitives

Custom lightweight-charts primitives for time range highlighting and vertical line markers.

## Files

| File                           | Purpose                                               |
| ------------------------------ | ----------------------------------------------------- |
| `TimeRangeHighlight.ts`        | Custom primitive for rendering shaded rectangles      |
| `timeMarkers.ts`               | Configuration for time ranges and vertical markers    |
| `forwardFillData.ts`           | Utility ensuring data exists at time range boundaries |
| `VerticalLinePrimitive.ts`     | Vertical line markers (complementary feature)         |

## Time Range Highlighting

Draws shaded rectangles behind chart data for specific time periods (e.g., market hours vs overnight sessions).

### Configuration

Time ranges are defined in `timeMarkers.ts` using UTC hours/minutes and colors.

### How It Works

**Challenge**: `timeToCoordinate()` returns `null` for timestamps without data.

**Solution**: 
1. `forwardFillData.ts` adds data points ONLY at time range boundaries (preserves gaps)
2. `TimeRangeHighlight.ts` uses interpolation fallback if needed

**Result**: Boundaries always render correctly; weekends/holidays compress naturally.

### Implementation

Implements `ISeriesPrimitive<Time>` pattern:
- `TimeRangeHighlightPaneView` - Calculates x-coordinates with fallback interpolation
- `TimeRangeHighlightRenderer` - Draws rectangles via Canvas API

Usage: Add required timestamps → attach primitive to series (see `Chart.tsx`)

## Vertical Line Markers

`VerticalLinePrimitive.ts` draws vertical lines at specific times (e.g., market open/close).

Configuration in `timeMarkers.ts` defines when lines appear and their styling.
