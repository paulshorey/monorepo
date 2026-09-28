# Historical metric explorer architecture

Status: proposed architecture. The SQL contract is written but unapplied; the app,
rolling engine, and storage adapters described here are not implemented yet.

Build one developer inspection app from the useful parts of archived `view-next`.
Edit metrics, parameters, feature selection, and experiment settings in the IDE.
The UI browses saved results, compares metrics, and inspects exact model inputs;
it does not author formulas, edit algorithm parameters, or train models interactively.

## Boundaries

```text
Databento TBBO → normalized trades/quotes → rolling windows → same-phase history → metrics
                                                  ↓
                                    versioned, typed observations
                                      ↙          ↓          ↘
                              chart API     backtest     ML export
```

Python owns all calculations. Batch replay and eventual live ingestion call the
same incremental engine. The database stores inputs and results, not executable
metric definitions. React owns rendering and navigation, with no second indicator
implementation in JavaScript or workers.

Use the existing runner/API and reusable chart library. Restore `apps/view-next`
with one historical page, copying selected components rather than restoring its
entire dependency graph. Keep `research-web` working until its useful results views
can move into this app, then consolidate. No live feed, database connection, or
broker adapter is needed for the first milestone.

## Proposed files

```text
apps/view-next/
  app/layout.tsx
  app/history/page.tsx             # thin page composition
  config/chart-layout.ts          # code-defined panes, colors, renderers
  features/history/
    HistoryExplorer.tsx           # dataset/run/range selection
    useHistoryRange.ts            # pagination, cancellation, stale-response guard
  features/inspection/
    MetricList.tsx                # visibility and comparison, not authoring
    PointInspector.tsx            # exact values, timing, quality, provenance
  lib/api/
    client.ts                     # typed Python API client; bigint strings
    contracts.ts
apps/backtest-runner/src/backtest_runner/
  profiles/
    research.py                   # code-defined datasets, windows, metric instances
  application/
    compute_research.py            # run identity, initialization, artifact lifecycle
    read_history.py                # bounded viewport and exact-point queries
    export_features.py             # ordered columns, labels, chronological splits
  storage/
    contracts.py                  # input/result reader and writer protocols
    files.py                      # first implementation; local TBBO inputs
    postgres.py                   # later, after database setup
  api/history.py                  # read-only datasets/runs/series/range/point routes
lib/strategy-core/src/strategy_core/
  market/
    events.py                     # trades, quotes, base bars, coverage
    timing.py                     # event time, availability, sequence, boundaries
    calendar.py                   # scheduled-open steps from each exchange calendar
  windows/
    spec.py                       # duration and step, e.g. 1h@1m and 1m@1s
    engine.py                     # shared incremental trailing-window engine
    state.py                      # ring buffers, sums, extrema, checkpoints
  history/
    contracts.py                  # exact period-spaced OHLCV history, validity masks
    phase.py                      # phase index, ordinal, expected slots, alignment
    provider.py                   # uniform file/SQL/in-memory history abstraction
  metrics/
    contracts.py                  # typed outputs, dependencies, warmup, causality
    registry.py                   # explicit function registration
    runner.py                     # independent indicator state per phase/instance
    price.py                      # returns, range, extrema
    momentum.py                   # RSI, EMA, phase/observation semantics
    volume.py                     # volume and supported order-flow metrics
    structure.py                  # causal HH/HL/LH/LL events
  features/
    contracts.py                  # ordered columns, age/missing/encoding policies
    research.py                   # developer-authored feature sets
  replay/
    scheduler.py                  # causal input/fill/feature/decision ordering
    execution.py                  # atomic market inputs, never overlapping windows
    portfolio.py                  # one shared account and order lifecycle
lib/research-charts/src/
  MetricChart.tsx                  # stable chart lifecycle and shared time axis
  renderers/                      # scalar, histogram, marker, region, band
  sampling.ts                     # display-only reduction; never model inputs
lib/db-research/
  schema.sql                      # proposed PostgreSQL contract
  partitions.example.sql
  queries/inspect_features.sql
  queries/phase_history.sql
  README.md
```

Add these modules as their milestone requires them, not as empty abstractions.
Keep existing CLI/API entry points while extracting responsibilities. Start with an
explicit registry and small storage protocols; no plugin framework, expression
language, message broker, or separate service per metric.

## Developer workflow

A metric is a pure function when stateless, or a small deterministic state machine
with `update`, snapshot, and restore when incremental. Its declaration contains:

- Stable function/version identity, parameters, required inputs and dependencies.
- Window and phase, smoothing/initialization, warmup, and gap policy.
- Named float, boolean, or categorical outputs with units and availability rules.
- Whether each output is causal and eligible for model input.

Define instances such as `rsi_14_phase_1m` in the Python research profile and select
outputs in a feature set. Display metadata belongs in the frontend layout file;
visibility never changes the feature set. Validate dependencies and reject cycles.

To add a metric, implement/register it, add an instance and a focused fixture, then
rerun the profile. Existing output types need no React changes or SQL migrations.
Bands and metric OHLC use named scalar outputs grouped by instance. Add a renderer
only for a genuinely new visual type. Remove instances from profiles and feature
sets without deleting prior runs.

Hash the source implementation, profile, input dataset, initialization policy, and
output contract. Parameter or code changes create a new run. Compute from a fixed
origin or validated checkpoint before cropping the requested viewport; panning must
never restart RSI, EMA, CVD, or other stateful calculations.

## Sliding-window dependency

The separate [sliding-window concept](../sliding-windows/README.md) and
[engineering design](../sliding-windows/design.md) define candle timing,
same-phase indicator inputs, execution, and ML evaluation. This app reads their
versioned outputs and displays each value with its source phase and availability.

The current importer derives observed minute bars from TBBO CSV. Tick-level and
second-level windows require additional implementation and validation before
attempting `1m@1s`. Do not interpolate missing price paths or order flow.

## Inspection and API

The UI selects a saved run, instrument/contract, predefined window/profile, and date
range. It supports pan/zoom, visibility toggles, pane ordering, and crosshair/point
inspection. Algorithm settings are displayed as read-only provenance.

Use Lightweight Charts with shared-time panes and independent scales. Start with
lines/histograms; add confirmed event markers, categories/regions, and multi-output
bands as needed. Preserve the mounted chart and viewport when series change.

Provide bounded read endpoints for run metadata, series descriptors, range data,
and exact point inspection. Range responses declare any display downsampling;
point inspection returns canonical values, window boundaries, input resolution,
availability, metric version, and missing/warmup reasons. Never choose a future
point merely because it is closest to the cursor. Cancel obsolete range requests.

Nanosecond timestamps and bigint IDs cross JSON as decimal strings. The chart
adapter maps second-level observations to chart time. For multiple ticks within
the same chart timestamp, render explicit display buckets and expose original ticks
in the inspector; never invent timestamps to make the chart accept duplicates.

## Storage and ML

Use [the PostgreSQL design](../../lib/db-research/README.md) as the future storage
contract. File adapters remain sufficient while the database is being prepared.
Store atomic source bars separately from overlapping rolling results and typed
metric observations. Persist only the configured cadence plus exact decision
inputs; evaluation frequency does not mandate writing every metric on every tick.

Export a versioned wide Parquet matrix with ordered feature columns, masks, and a
chronological split manifest. Chart inspection, backtesting, training, and later
inference resolve the same canonical metric outputs. Fitted scaling/encoding belongs
to the model artifact, fitted only on training data. Keep forward labels separate.

## What to reuse and correct

The archived `SERIES` registry, synchronized chart navigation, and exact-point
inspection are useful patterns. Separate their calculation, formatting, and render
responsibilities. Remove live polling, database-specific route logic, duplicate
worker calculations, and CSS/event scaling patches.

Resolve these archived semantics explicitly when porting:

- `atr` currently calls true range; `volume` calculates volume RSI. Name outputs
  after the calculation they actually perform.
- CVD display inversion is presentation metadata, not a change to training values.
- RSI computed independently from price O/H/L/C is not the observed RSI path's OHLC.
- Retrospective pivots become available at confirmation, with a separate origin time;
  never backdate a model input to the earlier pivot.
- CVD and book metrics require actual supported inputs; OHLCV alone cannot supply them.
- Archived windows skip scheduled closures. New windows keep that rule, taking
  closures from an exchange calendar and never skipping missing data; see
  [closures and data gaps](../sliding-windows/design.md#7-closures-and-data-gaps).

## Implementation order and acceptance

1. Implement/test the session calendar, timing, and window contracts with tiny
   hand-checked fixtures. Cover exact endpoints, phase, gaps, closures, expiry of
   extrema, disjoint volume, duplicate timestamps, and chunked replay versus
   incremental updates.
2. Implement the history abstraction, per-phase indicator runner, and code profiles
   with RSI, EMA, true range, and causal price-structure events. Compare every phase
   against the same standard implementation on independently constructed candles.
   Test initialization, same-phase dependencies, missing slots, and checkpoint recovery.
   Appending future data must not revise past available features within a run.
3. Restore the historical app using file-backed API reads and shared chart panes.
   Demonstrate `1h@1m` on imported data; accept `1m@1s` only with suitable input.
   Adding a scalar metric should need registration/configuration only.
4. Add exact inspection, display sampling, artifact caching, and Parquet export.
   Prove the same observation has identical canonical values in the inspector,
   backtest, and exported feature column, regardless of viewport or pagination.
5. After database setup, implement the Postgres adapter and exercise constraints,
   partition provisioning, ingestion throughput, and query plans on representative data.
6. Add ML training/evaluation, then paper/live adapters reusing the same engine.
   Test checkpoint recovery, arrival ordering, and decision reproducibility before
   allowing continuous execution.

UI formula/parameter editors are outside this app's scope. Live controls are a
separate future stage; they do not need to shape the historical page now.
