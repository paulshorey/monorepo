# Historical data

Status: plan for review. Nothing below is implemented except the CSV importer
described in [Current importer](#current-importer). The plan feeds the session
calendar, 1-minute base bars, and `1h@1m` window engine in the
[sliding-window design](../sliding-windows/design.md).

## What to download

Buy Databento **TBBO** for **6 years of MGC**: every trade, with its aggressor side
and the best bid and ask immediately before it.

| Schema     | Contents                                     | CVD | Spread-aware fills | Bytes per record |
| ---------- | -------------------------------------------- | --- | ------------------ | ---------------- |
| `ohlcv-1s` | One bar per second with trades               | No  | No                 | 56               |
| `trades`   | Every trade with aggressor side              | Yes | No                 | 48               |
| `tbbo`     | Every trade plus the bid and ask just before | Yes | Yes                | 80               |

One-second bars have no aggressor side, so they cannot produce CVD. `trades` is
enough for OHLCV and CVD, but TBBO is worth about 1.7× the size. It lets the
backtest charge the actual spread at the moment of each simulated order, which is
the main source of optimism in day-trading backtests. It also shows sweeps and how
much size was displayed at the best price. The extra complexity is small: the same
records carry six more fields, and the bar builder can ignore them. The bid and ask
are a pre-trade snapshot, not a continuous quote history.

Download settings for the portal:

| Job       | Settings                                                                                                    |
| --------- | ----------------------------------------------------------------------------------------------------------- |
| Trades    | Dataset `GLBX.MDP3`, schema `tbbo`, symbol `MGC.FUT` (parent), encoding DBN, compression zstd, split by day |
| Contracts | Same symbol and dates, schema `definition` (expirations, tick size, multiplier)                             |
| Optional  | `statistics` for settlement and open interest; `status` to cross-check the session calendar                 |

Choose DBN rather than JSON or CSV. Its records already have integer prices (in
units of 10⁻⁹) and nanosecond timestamps, and its header records the query and
which contract each instrument ID means on each date. On the sample day it decoded
about 10 times faster than JSON, and it converts losslessly to JSON or CSV whenever
a readable copy helps. Compression does not change how easy it is to read.

Split by day. Each file covers one UTC date, matching the per-date entries in
`condition.json`, and one file is small enough to read whole. A CME session runs
from 17:00 to 16:00 CT, so it spans two files; the pipeline reads files in order and
never assumes a file is a session.

`MGC.FUT` includes every MGC contract and calendar spread. That lets us choose our
own roll rule and warm up the next contract before switching to it. Keep each job
folder exactly as delivered, including `manifest.json`, `metadata.json`, and
`condition.json`, under `data/databento/GLBX.MDP3/<job_id>/`. That folder is
gitignored; back it up.

## What the sample shows

The one-day sample in `data/sample/` (August 31, 2026) has 218,695 TBBO records
across 21 instruments:

- **Contracts.** The front contract, MGCZ6, has 80% of trades. The expiring MGCV6
  has 11%, calendar spreads 9%, and farther months 0.5%.
- **Schedule.** MGCZ6 traded in all 1,380 open minutes and in 60% of open seconds.
  Nothing traded during the 16:00–17:00 CT halt.
- **Aggressor side.** MGCZ6 volume was 45% buyer-initiated, 45% seller-initiated,
  and 10% unknown. Every unknown-side trade coincided with a spread trade: these
  are the outright legs of spread trades.
- **Sweeps.** 14% of MGCZ6 trades printed outside the attached bid and ask. 99.8% of
  those were later fills of the same event, as an order swept several price levels.
- **Ordering.** Event timestamps never went backward in file order.

## Storage

**Decision: Databento's DBN files are the permanent tick archive, and PostgreSQL
holds everything derived from them from the start.** There is no intermediate
Parquet or DuckDB layer.

| Storage for ticks                  | One sample day | 6 years, upper bound |
| ---------------------------------- | -------------- | -------------------- |
| DBN uncompressed (Databento bills) | 17.5 MB        | ≈ 27 GB              |
| DBN with zstd                      | 4.6 MB         | ≈ 7 GB               |
| Lean PostgreSQL table, measured    | 39 MB          | ≈ 60 GB              |

The upper bound assumes every session is as busy as the sample; earlier years were
quieter. The purchased files must be kept anyway as the original record, and
loading ticks into PostgreSQL would create a second copy at about 8.5 times the
size. Every tick consumer reads whole days in order: the bar builder, tick-level
metrics, the fill simulator, and a "show trades in this candle" inspector. Reading
the day's DBN file serves all of them. If a real need to query ticks appears later,
load a date range into PostgreSQL then.

PostgreSQL stores instruments and contracts, the dataset and file catalog with
checksums, coverage and closures, the roll schedule, base bars, and later rolling
candles, metrics, runs, features, models, predictions, and live decisions. One-minute
base bars for two contracts over 6 years are about 4.2 million rows.

## Ingestion pipeline

Each stage reads the output of the one before and can be rerun.

1. **Register.** Verify each file against `manifest.json`. Record the job, query,
   and files in `market.dataset` and `market.source_file`. Dates whose
   `condition.json` entry is not `available` become `missing` coverage.
2. **Contracts.** Load `definition` records into `market.instrument`, one row per
   contract, with expiration, tick size, multiplier, and session calendar.
3. **Calendar.** Generate scheduled-open minutes from a CME Globex metals calendar
   in `pandas_market_calendars`, such as `CMEGlobex_Gold`. Report any trade during a
   scheduled closure and any unusually long silence during open hours.
4. **Rolls.** Count each outright's volume per session. The research series follows
   the front contract: the outright with the most volume in the previous session,
   switching at the session open. Store the schedule.
5. **Base bars.** Stream each day's DBN file once. For the front and next contracts,
   write one `market.base_bar` row per scheduled-open minute with status
   `observed`, `no_trades`, or `missing`.
6. **Quality report.** Per session: trades, volume, unknown-side share, missing
   minutes, trades during closures, and sweep fills.

Changing the builder writes a new derived dataset; runs keep the bars they used.

### Base bar fields

Each 1-minute base bar stores OHLC and when the high and low occurred; volume split
into buy, sell, and unknown aggressor side; trade count; and the price × size sum
for VWAP. It also stores `delta_high` and `delta_low`: the highest and lowest
running buy − sell volume within the minute, measured from its start. Together with
the minute's net delta, these reproduce the exact CVD open, high, low, and close of
any window, clock-aligned or rolling, without rereading ticks.

CVD adds buyer-initiated volume and subtracts seller-initiated volume from an
explicit origin, such as the session open. Unknown-side volume is excluded and
reported separately; in MGC it is mostly spread legs. Classifying it from the
pre-trade bid and ask would be a separately named metric, not part of CVD.

Spread, sweep, and displayed-size fields come later, when a metric needs them, by
rerunning the builder over the DBN files.

## Changes this requires

The current code cannot ingest this data:

- The importer reads CSV only, and your files are DBN.
- It expects one contract per manifest. `MGC.FUT` has 21 instruments, so it stops at
  the first trade from another contract.
- It has no contract definitions, rolls, session calendar, empty minutes, or side
  volumes.
- It re-parses every file into memory on each run. Six years must be ingested once
  into PostgreSQL instead.

Planned changes:

- **Dependencies:** `databento` to decode DBN, `psycopg` for PostgreSQL, and
  `pandas_market_calendars`, declared in the Python `pyproject.toml` files.
- **Schema:** remove `market.trade` and `market.quote`. Add the file's schema, date
  range, and job ID to `market.source_file`, and `delta_high` and `delta_low` to
  `market.base_bar`. Add a roll-schedule table.
- **Database:** a local PostgreSQL 17 database, with its connection string in the
  environment (for example `DATABASE_URL` in the gitignored `.secrets.sh`). The
  `AGENTS.md` rule that defers database setup changes when this plan is approved.
- **Commands:** `ingest` runs the pipeline stages for a job folder; the existing
  `analyze` and `run` read bars from PostgreSQL.
- **Tests:** small hand-built fixtures, so tests never need purchased data. The
  sample day serves as an end-to-end check against its JSON copy.

## Open decisions

1. **One-second base bars.** One row per open second is about 127 million rows per
   contract for 6 years, as many as the ticks. Build them from the DBN files when
   `1m@1s` work starts, and decide then whether to persist them.
2. **Roll rule.** Previous-session volume is the default. Open interest requires the
   `statistics` schema; a fixed number of days before expiry needs only definitions.
3. **Optional schemas.** Whether to buy `statistics` and `status`.

## Current importer

`python3 scripts/research.py analyze --dataset ID` and `run --dataset ID --config
PATH` read a single-contract Databento TBBO CSV export (decimal prices, UTC ISO 8601
timestamps, symbols mapped) described by a JSON manifest in `data/manifests/`. They
build clock-aligned minute bars from trades, omit minutes without trades, and do not
use the bid and ask. The planned pipeline replaces this path.

References: [TBBO fields](https://databento.com/docs/schemas-and-data-formats/tbbo),
[batch download options](https://databento.com/docs/portal/batch-download), and
[DBN encoding](https://databento.com/docs/standards-and-conventions/databento-binary-encoding).
