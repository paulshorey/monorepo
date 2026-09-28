# Research storage contract

Status: proposed PostgreSQL 17+ schema, not applied to a database. No database
connection or application adapter is included. Metric definitions and settings
remain developer-authored Python; database metadata records their snapshots.

[Schema](schema.sql) · [Partition example](partitions.example.sql) ·
[Feature inspection query](queries/inspect_features.sql) ·
[Phase history query](queries/phase_history.sql) ·
[App architecture](../../docs/project/metric-explorer.md) ·
[Sliding-window concept](../../docs/sliding-windows/README.md) ·
[Engineering design](../../docs/sliding-windows/design.md)

## Storage model

| Layer            | Tables                                                     | Responsibility                                                                 |
| ---------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Source identity  | `market.instrument`, `dataset`, `source_file`              | Contract, venue, session calendar, provenance, checksums, availability policy  |
| Atomic inputs    | `market.trade`, `quote`, `base_bar`, `coverage`            | Normalized observations, disjoint base bars, closure and missing-data evidence |
| Rolling candles  | `research.window_spec`, `run`, `rolling_bar`               | Window definitions and versioned, overlapping candles in trading time          |
| Metrics          | `research.metric_series`, `metric_value`, `checkpoint`     | Typed outputs, quality and availability, resumable state references            |
| Feature contract | `ml.feature_set`, `feature_column`                         | Ordered model columns, causal eligibility, freshness and encoding policies     |
| Training         | `ml.label_spec`, `label_value`, `training_export`, `model` | Separate forward targets, reproducible Parquet datasets, fitted artifacts      |
| Inference        | `ml.prediction`                                            | Model and feature-contract match, with actual input and output snapshots       |

One `rolling_bar` table holds every window spec; there is no table per timeframe
and no column per metric. Each named metric output is a series whose values use
exactly one float, boolean, or category column, so new metrics need no migration.

## Candles in trading time

The [sliding-window design](../../docs/sliding-windows/design.md) defines these
rules; the schema stores their results.

- **Session calendar.** Each instrument names the exchange calendar that decides
  which steps are scheduled open (`session_calendar`). The run's `pipeline` records
  the calendar library and version. `coverage` rows with status `closed` record the
  closures used, and `missing` rows record evidence of absent data.
- **Base bars** are disjoint `[start_ns, end_ns)` bars built from trades, one row per
  scheduled-open step: `observed`, `no_trades`, or `missing`. Closed steps have no
  row. They hold OHLC with the times of the high and low, volume, buy, sell, and
  unknown-side volume, trade count, and the price × size sum for VWAP.
- **Window specs** are code-defined snapshots such as `1h@1m` and `1m@1s`, with a
  duration and a step. A candle holds the last `duration / step` base bars of
  resolution `step`.
- **Rolling candles** store `start_ns` explicitly: the start of the oldest slot. A
  candle that spans a closure satisfies
  `end_ns − start_ns = slot_count × step + closed_ns` and has `spans_closure`. Status
  is `warmup` (fewer slots than the window holds), `gap` (any missing slot),
  `empty` (no trades), or `complete`. `irregular_closure` marks a candle separated
  from its previous same-phase candle by a closure that is not a whole number of
  periods, such as a 12:15 CT early close.
- **Phases.** `phase_index` and `period_ordinal` are generated from `end_ns`, so
  phase 0 matches standard session-chart candles. Same-phase candles are one period
  of open market apart; a closure skips ordinals. The index on
  `(…, phase_index, end_ns DESC)` reads a phase series without scanning other
  phases. Because end times skip closures, the [phase history query](queries/phase_history.sql)
  takes the oldest expected end time from the caller, who derives expected times from
  the session calendar and treats any absent row as a missing slot.

Never sum overlapping rolling volumes; aggregate base bars or trades once per window.

## Time, numbers, and identity

Market timestamps are UTC integer Unix nanoseconds (`bigint`, range here 1970–2262).
PostgreSQL timestamps have [microsecond resolution](https://www.postgresql.org/docs/current/datatype-datetime.html),
so nanoseconds are kept explicitly. Administrative created/completed times use
`timestamptz`. API IDs and nanoseconds cross JSON as decimal strings; convert to
chart coordinates only in the presentation adapter.

`event_ns` is source event time; `available_ns` is when an input or result could be
used. For files without arrival history, record a simulated policy such as bar end
plus a configured delay, not the time the file was downloaded. `event_seq` and
`asof_seq` give stable ordering at equal timestamps. The adapter defines one
sequence space across event types, keeps provider IDs and order in provenance, and
records consumed cursors in checkpoints. Exact live reconstruction uses persisted
prediction input snapshots, not an after-the-fact timestamp join.

Price and size use fixed `numeric(30,12)`; metrics use finite float64 for Python ML.
Negative prices are permitted for futures and spreads. Reject unsupported source
precision rather than rounding it. Values the source cannot supply, such as side
volume from vendor OHLCV, remain NULL. Instruments are actual venue contracts, not
just `BTC` or `ES`; version changed specifications instead of rewriting an identity
used by old runs. Normalize source timezone, timestamp convention, scale, and
contract mapping from the import manifest before insert.

## Validity and reproducibility

No-trade, missing, closed, and warming-up are distinct conditions. Missing values
are NULL with a status or reason; zero and false remain valid observations. Partial
candles may keep OHLC, but their status must prevent accidental use as complete
features. Each metric declares whether it accepts non-`complete` input.

`asof_ns` is when a value is evaluated or confirmed. An earlier pivot anchor belongs
in `origin_ns`, never in a backdated row. Outputs record their earliest required
input time; recursive state also records its initialization and checkpoints.
Retrospective annotations may be stored but cannot enter a feature set.

Seal datasets with manifests and hashes. A run captures source code (including
uncommitted edits), configuration, initialization, session calendar version,
availability, smoothing, gap and lateness rules, and persistence policy. New
definitions or corrected inputs create new runs or datasets. Completed results and
ready exports are immutable by application convention; the DDL does not enforce it.

## ML export and inference

Long typed rows support sparse, mixed experimental metrics. Training reads an
immutable, wide [Parquet artifact](https://arrow.apache.org/docs/python/parquet.html)
with ordered columns, values and missing masks, instrument and decision keys,
targets, and a split manifest. Keep large files and models outside Postgres with
URI and checksum references.

`feature_column.max_age_ns = 0` requires an observation at the decision time; a
positive value explicitly permits older observations. The example query selects
the latest available observation first, then checks age and validity; it never
skips a missing observation to reuse an older valid one. Batch export should merge
ordered streams rather than run a lateral query per decision.

Feature hashes describe column order, definitions, timing, missing rules, and
encoding independently of run IDs. Foreign keys require inference to use the trained
model's feature contract, even on a new live dataset. Save fitted scaling and
encoding with the model, its training cutoff, and evaluation. Prediction snapshots
are a small audit trail, not metric-history storage.

Labels remain separate, with target end and availability time; `crosses_closure`
flags horizons that include a scheduled closure. Exporters purge targets crossing
chronological splits and record any embargo. Never report decisions before a
model's training cutoff as out-of-sample results.

## SQL constraints and writer responsibilities

SQL enforces keys, references, typed and finite values, OHLC bounds, base-bar status
rules, candle slot and span arithmetic, candle status rules, extremum times inside
the candle, causal feature eligibility, and feature-contract matches. Partitioned
primary keys include their partition key, as [PostgreSQL requires](https://www.postgresql.org/docs/current/ddl-partitioning.html).

The future importer, window engine, and exporter must also validate:

- Base bars exist for every scheduled-open step and none for closed steps; coverage
  intervals do not overlap; precision, ordering, and manifests are complete.
- Candle contents match their slots, phases match the calendar's expected end times,
  and `irregular_closure` is set where required.
- Run ranges, dependencies, provenance, hashes, replay equivalence, and checkpoint
  durability.
- Contiguous feature-column positions, valid label horizons, training cutoffs and
  splits, and preprocessing fitted on training data only.
- Sealed inputs and complete runs before ready exports; ready exports before model
  registration.

Add database integration tests when implementing the adapter.

## Partitioning and capacity

`schema.sql` is a one-time initial schema for an empty database, not a migration;
it does not drop existing objects. Its seven large tables need range partitions
before ingestion. The example creates September 2026 partitions only; provision
every month your data and outputs cover. Consider daily partitions for high-volume
ticks after measuring the workload.

Primary-key B-trees serve series and instrument range reads. Time BRIN indexes may
help coarse scans when rows arrive in time order; benchmark with actual ingestion
([BRIN documentation](https://www.postgresql.org/docs/current/brin.html)). Start
with plain PostgreSQL; extensions are optional future decisions.

At 100 metrics every second, one instrument produces 8.64 million metric rows per
24-hour day. Compute in memory, batch writes, choose retained series and cadence in
code, and save every actual decision's inputs. Keep cold history and training
matrices in checksummed columnar files; Postgres serves actively inspected ranges
and the catalog.
