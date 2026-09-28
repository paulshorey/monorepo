# CVD from TBBO trades

The pipeline derives cumulative volume delta (CVD) directly from classified
TBBO trades.

This is part of the canonical timeseries dataset written by
`write-node`. Downstream apps can build further CVD-derived features on
top of these persisted rows.

## Per-trade contribution

For each trade:

- ask-aggressor trade -> `+size`
- bid-aggressor trade -> `-size`
- unknown side -> `0` for CVD, while the volume is still tracked in
  `unknown_volume`

That signed contribution is the trade's delta.

## Per-second handling

Trades are first aggregated into a 1-second candle. During that second:

- `ask_volume` and `bid_volume` accumulate
- `vd` becomes `ask_volume - bid_volume`
- CVD OHLC is updated as the running total changes trade by trade

Only CVD keeps OHLC tracking because it is a cumulative value that meaningfully
changes within the second and within the final rolling 1-minute row.

## Rolling 1-minute row

When the trailing 60-second window is assembled:

- `cvd_open` comes from the first second in the window
- `cvd_close` comes from the last second in the window
- `cvd_high` and `cvd_low` are the extrema reached anywhere inside the window

This preserves the shape of the cumulative flow, not just the ending value.

## Restart continuity

On startup, both live and historical ingest seed the rolling engine from the
latest stored `cvd_close` per ticker. That keeps CVD continuous across:

- live restarts
- historical backfill continuation
- mixed live/backfill workflows

If no prior row exists, CVD starts at `0`.
