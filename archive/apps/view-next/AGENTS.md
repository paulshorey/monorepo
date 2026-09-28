# ARCHIVED — historical reference only

This code is retired, excluded from the active workspace, and must not be deployed.
The instructions below describe the former architecture and do not govern active code.

# Market View Next app (apps/view-next/)

Financial charting app displaying price and relative strength, with real-time updates.

## Overview

- **Left y-axis:** Strength (-100 to 100)
- **Right y-axis:** Price
- **X-axis:** Time (shared)

## Folders

Current working directory is `apps/view-next`

Main code is inside:

- apps/view-next/features/stream
- apps/view-next/features/tradingview

Inside:

- api - NextJS api
- price - /price page - will display new improved chart using highcharts library
- page.tsx - / homepage - renders old (current version) chart using lightweight-charts
- components - React components for the new
- features - client-only chart code, moved out of /pages to avoid Next.js treating helper files as routes
  - stream - real-time data streaming
  - tradingview - TradingView/lightweight-charts integration

## Configuration

Shared configs are pulled from `@lib/config`:

- Tailwind preset: `@lib/config/tailwind/app`
- Jest preset: `@lib/config/jest/next-app`
- TypeScript/Next/PostCSS: `@lib/config`
