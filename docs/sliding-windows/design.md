# Sliding-window engineering design

Status: planned, not implemented. This page turns the [concept](README.md) into
rules for code in `lib/strategy-core`. Window specifications, metrics, and their
parameters are defined in Python code; the UI only displays results.

## Terms

| Term           | Meaning                                                                   |
| -------------- | ------------------------------------------------------------------------- |
| Window `W`     | Candle duration: 60 minutes for `1h@1m`, 60 seconds for `1m@1s`.          |
| Step `S`       | Time between candles: 1 minute or 1 second. Both specs have `W/S = 60`.   |
| Base bar       | A disjoint `S`-long bar built directly from trades; one window slot.      |
| Trading time   | Steps when the market is scheduled open. Closed steps add no slot.        |
| Rolling candle | The last 60 open-market slots, completed at `T`. Usually `[T−W, T)`.      |
| Phase          | `(T mod W) / S`: minute of the hour or second of the minute.              |
| Phase series   | Candles of one phase, one period apart. The input to standard indicators. |
| Rolling stream | One output per step, cycling through phases. Read by charts and strategy. |

## 1. Base bars

Build 1-second and 1-minute base bars from Databento TBBO trades. The current
importer already builds minute bars; seconds use the same aggregation.

- Use integer UTC nanoseconds. A bar covers `[start, end)`; a trade exactly at a
  boundary belongs to the later bar. Assign trades by `ts_event` and keep `ts_recv`
  to model when data became available.
- Store open, high, low, and close (first, maximum, minimum, and last trade price),
  the times of the high and low, volume, trade count, the price × size sum for VWAP,
  and buy, sell, and unknown-side volume from the TBBO `side` field.
- Give every step when the market is scheduled open a slot, with one status:
  `observed` (at least one trade), `no_trades` (feed healthy, no trades), or
  `missing` (feed gap or unknown). Scheduled closures get no slot; see
  [section 7](#7-closures-and-data-gaps). The current importer omits no-trade
  minutes, so the window engine must insert empty slots.

Build hourly candles from 1-minute base bars. Adding up overlapping `1m@1s` volumes
would count each trade up to 60 times.

## 2. Window engine

Each spec and instrument keeps a ring buffer of 60 slots. Steps during a scheduled
closure do nothing. When an open-market step ending at `T` closes:

1. Append the base bar for `[T−S, T)` and drop the oldest slot.
2. Compute the candle: open from the earliest slot with trades, close from the
   latest, high and low (with their times) over all slots, and sums of volume, trade
   count, price × size, and side volumes. Recalculate VWAP from the sums; never
   average ratios.
3. Assign a status, attach the phase index, and pass the candle to the indicator
   runner.

Recomputing a maximum and sums over 60 slots is cheap and avoids floating-point
drift. Running sums or a monotonic deque ([Lemire](https://arxiv.org/abs/cs/0610046))
are optimizations to add only if profiling shows a need.

| Candle status | Condition                                                         |
| ------------- | ----------------------------------------------------------------- |
| `complete`    | Every slot is `observed` or `no_trades`, with at least one trade. |
| `empty`       | Every slot is `no_trades`. No price; volume is zero.              |
| `gap`         | Any slot is `missing`.                                            |
| `warmup`      | Fewer than 60 open-market slots exist since data began.           |

A candle whose slots straddle a scheduled closure also carries a `spans_closure`
flag. By default only `complete` candles feed indicators and model features. A
chart may carry the last price forward with a visible marker; training never treats
it as a trade.

## 3. Phases

For a candle completed at `T` (UTC nanoseconds since the epoch):

```text
phase_index    = (T mod W) / S
period_ordinal = T div W
```

| Spec    | Candle completed | Phase | Previous same-phase candle |
| ------- | ---------------- | ----- | -------------------------- |
| `1h@1m` | 10:23:00         | 23    | 09:23:00                   |
| `1m@1s` | 10:15:23         | 23    | 10:14:23                   |

Within a phase, consecutive candles are adjacent, non-overlapping periods of open
market. A closure skips ordinals: after the daily halt, phase 30's candle at 17:30
follows the one at 15:30. Phase 0 equals standard session-chart candles, and phase
`k` equals those candles shifted by `k` steps; both are test targets. Closures that
are not whole periods are the one exception, described in
[section 7](#7-closures-and-data-gaps).

## 4. Indicators per phase

Each indicator instance, such as RSI(14) on `1h@1m` closes, has 60 independent
states. At `T` only the state for `phase(T)` advances, and it receives the candle
ending at `T`.

- **Reference parity.** Pin a reference implementation for each indicator,
  including its smoothing and seed. Phase `k`'s output must equal that reference run
  on phase `k`'s series.
- **Warmup per phase.** Wilder RSI(14) needs 15 closes: 15 hours for `1h@1m`, 15
  minutes for `1m@1s`. Phases become usable one step apart. Recursive indicators
  also depend on how far back they started (TA-Lib's
  [unstable period](https://ta-lib.org/api/unstable-period)). Run them from a fixed
  origin or a saved checkpoint rather than refetching the last N candles.
- **Composites stay in phase.** MACD, RSI of an EMA, and divergences use the same
  phase at every level.
- **Missing candles stay missing.** A missing candle leaves an empty slot in the
  phase series; never pull an older candle forward to fill it. Each indicator
  declares whether to hold or reset its state over the gap. Closed periods are not
  missing: they do not exist in trading time, so state simply continues.
- **Cost.** Memory is `60 × indicator instances × instruments` small states.

A history lookup returns one slot per expected end time, oldest first. The session
calendar supplies the expected times, skipping closures:

```python
phase_history(instrument, spec="1h@1m", end=T, count=15)
# the 15 most recent open-market candles of T's phase, each with its status
```

Lag is typed. `previous_period()` moves back `W` within a phase; `previous_step()`
moves back `S` in the rolling stream. A plain `.shift(1)` on an interleaved table is
a step lag, so it must not feed standard indicators.

## 5. Highs, lows, and pivots

- A rolling candle's high is the highest trade in its 60 slots. It changes when a
  new extreme enters or when the old one drops out 60 slots later, so a falling
  rolling high can mean the old high expired, not that price fell.
- A standard pivot, such as a high above the N candles on each side, runs on the
  phase series and is confirmed N periods later. With 60 phases, confirmation can
  happen at any minute instead of only at the top of the hour.
- A minute-precise swing high is a base-bar high with no higher high in the 60
  slots before or after it, confirmed 60 slots later. The window's high and its
  time are enough to detect it. Ties resolve to the earliest occurrence.
- Every pivot keeps its origin time and its confirmation time. Features use it only
  after confirmation.
- Indicator extremes, such as RSI highs, come from the computed indicator series,
  not from RSI calculated on candle highs.

## 6. Combining timeframes

At 10:23:23 the latest `1m@1s` candle ends at 10:23:23, but the latest `1h@1m`
candle ends at 10:23:00. Record each feature's age, and never use a candle that ends
after the decision time. An hourly candle every second would be a separate
`1h@1s` spec with 3,600 phases and is out of scope.

## 7. Closures and data gaps

**Decision: trading time.** A window holds the last 60 steps when the market was
scheduled open. Steps during a scheduled closure add no slot and produce no candle.
After CME Globex's 16:00–17:00 CT daily halt, the 17:30 candle covers
`[15:30, 16:00)` plus `[17:00, 17:30)`. Spot crypto trades continuously; CME crypto
futures follow the Globex schedule.

Every candle is built the same way from 60 open-market slots. Indicators, features,
and models never handle partial candles, and indicator state continues across
closures without special cases. The archived writer used the same rule. The
alternative, elapsed time, builds windows without a calendar, but a candle that
overlaps a closure is incomplete. Every consumer would then have to handle an hour
of unusable candles after each reopen.

### Session calendar

Trading time concentrates the complexity in one component: a calendar that says
whether each step was scheduled open. It is defined in exchange time, including
daylight saving, holidays, and early closes. Errors in it change candle contents, so
it needs its own tests. [pandas_market_calendars](https://github.com/rsheftel/pandas_market_calendars)
provides CME Globex calendars for equity index (ES, MES) and metals (MGC) futures,
including the daily break, holidays, and early closes. Databento's `status` schema
could cross-check it, if the dataset provides it.

| Calendar | Trades seen        | Result                                           |
| -------- | ------------------ | ------------------------------------------------ |
| Closed   | none               | No slot; the window does not move.               |
| Open     | yes                | `observed` slot.                                 |
| Open     | none, feed healthy | `no_trades` slot.                                |
| Open     | none, feed missing | `missing` slot; the candle is `gap`.             |
| Closed   | yes                | Report a data-quality error; check the calendar. |

Never infer a closure from absent data. Treating a feed outage as a closure would
silently join candles across missing data. Evidence of missing data comes from
Databento's per-date dataset condition, file coverage, or a validation report of
unusual silence during open hours.

### Candles that span a closure

These candles carry `spans_closure`. Their range includes any price gap across the
closure, such as a weekend gap. Standard ATR includes the same gap through the
previous close, but features and the inspector should still be able to see it.

Phase stays tied to the clock so that phase 0 remains the standard hourly candle.
The daily halt and weekend last whole hours, so same-phase candles stay exactly 60
open minutes apart. An early close such as 12:15 CT does not: across that closure,
each `1h@1m` phase series has a single gap or overlap shorter than an hour. Flag
those candles with `irregular_closure`. This affects a few holidays a year and never
`1m@1s`, whose closures are whole minutes.

### Other rules

- A `missing` slot makes the candle `gap`. Unscheduled gaps are never skipped.
- Resetting indicators at each daily halt would make hourly RSI(14) unavailable for
  the first 15 hours of every session; trading time avoids this.
- Futures keep actual contract identities. Warm up a new contract's states before
  trading it, or reset them explicitly at the roll.

## 8. Backtesting

- Use one chronological replay with one portfolio, one set of orders, and one set of
  risk limits for all phases.
- Neighboring phases usually report the same event; a crossover at phase 7 is likely
  at phases 8 and 9 too. Strategies set a target position, so repeated signals do
  not add positions. Use hysteresis or a cooldown where phases disagree.
- A decision at `T` uses only candles completed and available by `T`. Fill at the
  next observed trade after the decision plus modeled latency, never at a price from
  the window that produced the decision.

## 9. Machine learning

- Train one model, not 60. Each decision row holds the current phase's features,
  their statuses, and their ages. Store the phase as provenance; using it as an
  input is a separate experiment.
- Rows one minute apart share 59 of 60 minutes of hourly input, and their labels
  overlap. Split chronologically, keep each time block in one fold, purge training
  rows whose labels reach into validation, and add an embargo.
- The effective sample size of hourly features is much closer to the number of hours
  than minutes. Compare training on every step, every 60th step, and rotating phases.
- Define targets by time, such as five minutes after entry, not by row count. Flag
  targets that cross a closure. Fit scaling and encoding on training data only.

## 10. Storage

Compute in memory. Persist candles and features for inspection, plus the exact
inputs of every decision. The [proposed PostgreSQL contract](../../lib/db-research/README.md)
stores one base bar per scheduled-open step and all rolling candles in one table.
Each candle records its status, slot counts, closed time, `spans_closure`,
`irregular_closure`, and generated `phase_index` and `period_ordinal`. The
[phase history query](../../lib/db-research/queries/phase_history.sql) uses an index
on `phase_index, end_ns DESC`; benchmark it after database setup.

Code modules follow the [metric explorer plan](../project/metric-explorer.md):
`strategy_core/market/calendar.py` for scheduled-open steps, `strategy_core/windows/`
for specs and the engine, `strategy_core/history/` for phase arithmetic and lookups,
and `strategy_core/metrics/runner.py` for per-phase state. Add each module when its
milestone needs it.

## 11. Validation

Build in this order. Each step's tests must pass before the next step starts.

1. **Base bars.** Hand-checked fixtures cover a trade exactly on a boundary, empty
   steps, missing data, and duplicate timestamps.
2. **Session calendar.** Fixtures cover the daily halt in summer and winter (its UTC
   time shifts with daylight saving), a weekend, a holiday, a 12:15 CT early close,
   a feed outage during open hours (flagged, not skipped), and trades during a
   scheduled closure (reported).
3. **Window engine.** Each rolling candle equals a brute-force aggregation of trades
   over its 60 open-market steps. Batch, incremental, and chunked replays produce
   identical output.
4. **Phases.** Phase 0 equals standard session-chart candles; phase `k` equals those
   candles offset by `k` steps. Only flagged irregular-closure candles may differ.
5. **Indicators.** Each phase's SMA, RSI, EMA, ATR, and MACD equal the pinned
   reference on that phase's series. A restored checkpoint matches an uninterrupted
   run.
6. **Causality.** Appending later data never changes earlier outputs, and no feature
   uses a candle that ends after its decision time.
7. **Research comparison.** Use the same data, costs, targets, and holdout for:
   - standard clock candles with decisions only at candle close;
   - standard candles including the forming candle, with decisions every minute;
   - each single phase alone, where the spread across 60 phases measures timing
     luck;
   - the full rolling system;
   - the same model given minute bars without phases, which tests whether the
     representation adds value beyond the raw data.

   Report after-cost returns, drawdown, turnover, and variation across phases and
   time blocks.

## Open decisions

1. Decision cadence for each strategy: every step or every Nth step.
2. Whether to add features that combine phases, such as the median RSI of the last
   60 phases. These reduce alignment noise but add lag.
