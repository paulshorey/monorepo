# Sliding-window candles

Status: planned research design, not implemented. See [Status](#status).

At every refresh, build a **complete** candle from the most recent full duration,
instead of a partial candle that began at the top of the hour. Indicators then
compare a full current candle with full earlier candles, and hourly signals can
update every minute. The project plans two windows:

| Name    | Each candle covers  | New candle every | Built from         |
| ------- | ------------------- | ---------------- | ------------------ |
| `1h@1m` | the last 60 minutes | minute           | 1-minute base bars |
| `1m@1s` | the last 60 seconds | second           | 1-second base bars |

## The problem with clock-aligned candles

A standard 1-hour candle covers 13:00–14:00. At 13:07 a strategy must choose
between two imperfect inputs:

| At 13:07, use…            | It covers   | Drawback                                                             |
| ------------------------- | ----------- | -------------------------------------------------------------------- |
| The forming candle        | 13:00–13:07 | Only 7 minutes, compared with 60-minute history.                     |
| The last completed candle | 12:00–13:00 | A full hour, but 7 minutes old. Hourly signals change once per hour. |

This causes three problems:

1. **Unequal comparisons.** A forming candle's range, volume, and last price change
   grow with the minute of the hour. Features look different at 13:02 and 13:58 in
   the same market, so a model must learn the minute of the hour just to read them.
2. **Arbitrary alignment.** Hourly candles could equally run 13:07–14:07. Starting
   at :00 is one of 60 valid choices, and results can depend on that choice.
3. **Delayed decisions.** Using only completed candles, an hourly signal waits up
   to 59 minutes for the next close.

## The idea

When each minute ends, build a candle from the 60 minutes that just ended:

```text
              12:05   12:06   12:07  ...  13:05   13:06   13:07
13:05 candle  ├─────── 60 minutes ────────┤
13:06 candle          ├─────── 60 minutes ────────┤
13:07 candle                  ├─────── 60 minutes ────────┤
```

The 13:07 candle covers `[12:07, 13:07)`: the start is included and the end is
excluded, so a trade at exactly 13:07:00 belongs to the next minute. Its open is
the first trade in the window, its close is the last, and its high, low, and volume
cover all 60 minutes.

Keep 60 one-minute slots. When a minute ends, drop the oldest slot, add the new one,
and recompute the candle. A quiet minute without trades still occupies a slot. A
minute when the market is closed does not, so every candle holds exactly 60 minutes
of open market. After a closure, candles combine the last minutes before it with
the first minutes after it. `1m@1s` works the same way with 60 one-second slots.

## Indicators run on one phase at a time

**Do not feed consecutive rolling candles into an indicator.** The 13:06 and 13:07
candles share 59 minutes, and their closes are just prices one minute apart. RSI(14)
over consecutive rolling closes is simply a 1-minute RSI.

Instead, an indicator reads candles one full hour apart. The candle ending at 13:07
is compared with those ending at 12:07, 11:07, 10:07, and so on. That is an ordinary
sequence of non-overlapping hourly candles that starts at :07 instead of :00. Its
**phase** is 7, the minute of the hour at which its candles end.

| Time  | Phase | RSI(14) reads hourly candles ending at |
| ----- | ----- | -------------------------------------- |
| 13:06 | 6     | 13:06, 12:06, 11:06, …                 |
| 13:07 | 7     | 13:07, 12:07, 11:07, …                 |
| 13:08 | 8     | 13:08, 12:08, 11:08, …                 |

`1h@1m` has 60 phases (minute of the hour); `1m@1s` has 60 (second of the minute).
Each phase keeps its own indicator state, and only the phase ending now advances.
RSI, EMA, ATR, and other formulas are unchanged; only their input sequence differs.
Phase 0 reproduces standard clock-aligned candles, which gives a built-in check.

## What a strategy sees

Each minute, the strategy and ML model receive the hourly candle that just completed
and the standard hourly indicators of its phase. Read in time order, these outputs
form a **rolling stream**: hourly RSI, ATR, and so on, updated every minute.

Code must say which "previous value" it means:

- **Previous period:** the same phase one hour earlier. Standard crossovers, higher
  highs, divergences, and pivots use this.
- **Previous step:** the previous minute's output, from a different phase. This
  measures how the hourly picture changed in the last minute.

## What this gains

- **Like-for-like comparisons.** Every decision uses a complete candle compared with
  complete candles of the same length. Features mean the same thing at every minute.
- **Earlier hourly signals.** An hourly crossover, breakout, or pivot confirmation is
  seen in the minute it happens. Logic that waits for clock candles can see it up to
  59 minutes later.
- **No arbitrary alignment.** All 60 alignments are computed. Running a strategy on
  each phase alone measures how much its results depend on timing luck. In portfolio
  research, the equivalent choice of rebalance date often changed returns by more
  than 1% a year.
- **Minute-precise extremes.** Each candle records when its high and low occurred.

## What it does not do

- **It adds no new information.** Rolling hourly candles come from the same minute
  bars as clock-aligned hours. Whether the high came before the low is still visible
  only in minute bars and trades, which the model can also use directly.
- **It does not remove lag.** Each candle spans 60 minutes, and RSI(14) still spans
  14 hours. The rolling stream removes the wait for a candle to close, not the lag of
  a trailing window. For example, a 60-minute average is centered 30 minutes ago.
- **It is not 60 times the data.** Adjacent candles share 59 of 60 minutes.
  Backtests and ML evaluation must treat each hour's 60 values as strongly related,
  not as 60 independent samples.
- **It is not automatically smoother or more accurate.** Each phase's RSI is an
  ordinary hourly RSI on a shifted grid. A step in the rolling stream can come from
  a minute dropping out of the window, not only from the newest minute.
- **Phase 0 may be special.** Many traders act on clock-aligned candles, so the top
  of the hour may behave differently. Test phases rather than assume they are
  equivalent.

Whether this improves decisions after costs is a research question. The
[design](design.md#11-validation) lists the comparisons that answer it.

## Scope

Only `1h@1m` and `1m@1s` are planned. Daily candles, other durations, and windows
anchored to each tick are out of scope. Windows count only time when the market is
scheduled open, using an exchange calendar; see
[closures and data gaps](design.md#7-closures-and-data-gaps).

## Status

Nothing on this page is implemented. The current importer builds clock-aligned
minute bars from Databento TBBO CSV and omits minutes without trades; the baseline
backtest uses those bars directly. `1m@1s` first needs a 1-second trade aggregation.
The [PostgreSQL schema](../../lib/db-research/README.md) is proposed and unapplied.

## Further reading

- [Engineering design](design.md): data rules, window engine, per-phase indicators,
  closures, backtesting, ML, and validation.
- [Background and sources](sources.md): where the idea came from, what the archived
  implementation did, and supporting research.
- [Metric explorer plan](../project/metric-explorer.md): the UI that inspects these
  outputs.
