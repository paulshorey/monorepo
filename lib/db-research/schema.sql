-- Proposed initial schema for PostgreSQL 17+. Not applied to any database.
-- No extensions, connections, migration runner, or runtime adapter are required.
-- Apply once to an empty database when ready; this is not an upgrade migration.
-- Market time is signed BIGINT Unix nanoseconds, UTC (1970..2262 in this design).
-- In JSON, serialize bigint IDs and timestamps as decimal strings, not JS numbers.
-- High-volume tables require explicit range partitions before loading data.
-- Candle rules follow docs/sliding-windows/design.md (trading time, per-phase history).
BEGIN;
CREATE SCHEMA market;
CREATE SCHEMA research;
CREATE SCHEMA ml;

CREATE DOMAIN research.sha256 AS text CHECK (VALUE ~ '^[0-9a-f]{64}$');
CREATE DOMAIN research.finite_float AS double precision
    CHECK (VALUE > '-Infinity'::double precision AND VALUE < 'Infinity'::double precision);
CREATE DOMAIN market.decimal_value AS numeric(30, 12) CHECK (VALUE <> 'NaN'::numeric);

-- A futures contract is an instrument. A root ticker or continuous series is NOT a
-- tradable instrument; explicit mapping/roll research belongs in its own pipeline.
-- session_calendar names the exchange calendar that defines scheduled-open steps,
-- e.g. pandas_market_calendars 'CME Globex Equity', or '24/7' for spot crypto.
CREATE TABLE market.instrument (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    instrument_key text NOT NULL UNIQUE,
    asset_class text NOT NULL CHECK (asset_class IN ('future', 'crypto_spot', 'crypto_perpetual')),
    venue text NOT NULL,
    symbol text NOT NULL,
    root_symbol text,
    expiry date,
    quote_currency text NOT NULL,
    price_tick market.decimal_value NOT NULL CHECK (price_tick > 0),
    quantity_step market.decimal_value NOT NULL CHECK (quantity_step > 0),
    contract_multiplier market.decimal_value NOT NULL CHECK (contract_multiplier > 0),
    exchange_timezone text NOT NULL,
    session_calendar text NOT NULL,
    metadata jsonb NOT NULL DEFAULT '{}' CHECK (jsonb_typeof(metadata) = 'object'),
    CHECK (asset_class <> 'future' OR expiry IS NOT NULL)
);

-- Open datasets may append live inputs. Sealed datasets are immutable snapshots.
-- Corrections create a new dataset/run; never overwrite already-used history.
CREATE TABLE market.dataset (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    dataset_key text NOT NULL UNIQUE,
    provider text NOT NULL,
    availability_basis text NOT NULL CHECK (availability_basis IN ('recorded', 'simulated')),
    availability_policy jsonb NOT NULL CHECK (jsonb_typeof(availability_policy) = 'object'),
    state text NOT NULL DEFAULT 'open' CHECK (state IN ('open', 'sealed')),
    manifest_sha256 research.sha256,
    parent_dataset_id bigint REFERENCES market.dataset(id),
    metadata jsonb NOT NULL DEFAULT '{}' CHECK (jsonb_typeof(metadata) = 'object'),
    created_at timestamptz NOT NULL DEFAULT now(),
    sealed_at timestamptz,
    CHECK ((state = 'sealed' AND manifest_sha256 IS NOT NULL AND sealed_at IS NOT NULL)
        OR (state = 'open' AND manifest_sha256 IS NULL AND sealed_at IS NULL))
);
CREATE TABLE market.source_file (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    dataset_id bigint NOT NULL REFERENCES market.dataset(id),
    uri text NOT NULL,
    sha256 research.sha256 NOT NULL,
    byte_count bigint NOT NULL CHECK (byte_count >= 0),
    parser_version text NOT NULL,
    metadata jsonb NOT NULL DEFAULT '{}' CHECK (jsonb_typeof(metadata) = 'object'),
    UNIQUE (dataset_id, uri)
);

-- event_seq is a stable adapter-assigned tie breaker for events at the same ns;
-- preserve source sequence and receipt time when available. No floating timestamps.
-- available_ns is when the normalized input could be used, NOT download wall time.
CREATE TABLE market.trade (
    dataset_id bigint NOT NULL REFERENCES market.dataset(id),
    instrument_id bigint NOT NULL REFERENCES market.instrument(id),
    event_ns bigint NOT NULL CHECK (event_ns >= 0),
    event_seq bigint NOT NULL CHECK (event_seq >= 0),
    available_ns bigint NOT NULL CHECK (available_ns >= event_ns),
    received_ns bigint CHECK (received_ns >= 0),
    source_event_id text,
    price market.decimal_value NOT NULL,
    size market.decimal_value NOT NULL CHECK (size > 0),
    aggressor_side smallint NOT NULL DEFAULT 0 CHECK (aggressor_side IN (-1, 0, 1)),
    flags jsonb NOT NULL DEFAULT '{}' CHECK (jsonb_typeof(flags) = 'object'),
    PRIMARY KEY (dataset_id, instrument_id, event_ns, event_seq)
) PARTITION BY RANGE (event_ns);

-- Top-of-book only; full depth requires a separate adapter/storage contract later.
-- Retain crossed quotes with source flags rather than silently rewriting them.
CREATE TABLE market.quote (
    dataset_id bigint NOT NULL REFERENCES market.dataset(id),
    instrument_id bigint NOT NULL REFERENCES market.instrument(id),
    event_ns bigint NOT NULL CHECK (event_ns >= 0),
    event_seq bigint NOT NULL CHECK (event_seq >= 0),
    available_ns bigint NOT NULL CHECK (available_ns >= event_ns),
    received_ns bigint CHECK (received_ns >= 0),
    bid_price market.decimal_value NOT NULL,
    ask_price market.decimal_value NOT NULL,
    bid_size market.decimal_value NOT NULL CHECK (bid_size >= 0),
    ask_size market.decimal_value NOT NULL CHECK (ask_size >= 0),
    flags jsonb NOT NULL DEFAULT '{}' CHECK (jsonb_typeof(flags) = 'object'),
    PRIMARY KEY (dataset_id, instrument_id, event_ns, event_seq)
) PARTITION BY RANGE (event_ns);

-- Disjoint base bars [start_ns, end_ns) built from trades; these are the slots of
-- rolling windows. One row per step when the market is scheduled open, including
-- steps without trades ('no_trades') or with missing data ('missing'). Scheduled
-- closures have no rows. Unsupported detail, such as side volume, stays NULL.
CREATE TABLE market.base_bar (
    dataset_id bigint NOT NULL REFERENCES market.dataset(id),
    instrument_id bigint NOT NULL REFERENCES market.instrument(id),
    resolution_ns bigint NOT NULL CHECK (resolution_ns > 0),
    end_ns bigint NOT NULL,
    start_ns bigint GENERATED ALWAYS AS (end_ns - resolution_ns) STORED,
    available_ns bigint NOT NULL CHECK (available_ns >= end_ns),
    status text NOT NULL CHECK (status IN ('observed', 'no_trades', 'missing')),
    open market.decimal_value,
    high market.decimal_value,
    low market.decimal_value,
    close market.decimal_value,
    high_at_ns bigint,
    low_at_ns bigint,
    volume market.decimal_value CHECK (volume >= 0),
    buy_volume market.decimal_value CHECK (buy_volume >= 0),
    sell_volume market.decimal_value CHECK (sell_volume >= 0),
    unknown_side_volume market.decimal_value CHECK (unknown_side_volume >= 0),
    trade_count bigint CHECK (trade_count >= 0),
    price_volume_sum market.decimal_value,
    PRIMARY KEY (dataset_id, instrument_id, resolution_ns, end_ns),
    CHECK (end_ns >= resolution_ns AND end_ns % resolution_ns = 0),
    CHECK (num_nonnulls(open, high, low, close) = CASE WHEN status = 'observed' THEN 4 ELSE 0 END),
    CHECK (open IS NULL OR (low <= least(open, close) AND high >= greatest(open, close))),
    CHECK ((status = 'observed' AND volume > 0 AND (trade_count IS NULL OR trade_count > 0))
        OR (status = 'no_trades' AND volume = 0 AND coalesce(trade_count, 0) = 0
            AND coalesce(price_volume_sum, 0) = 0)
        OR (status = 'missing' AND num_nonnulls(volume, buy_volume, sell_volume,
            unknown_side_volume, trade_count, price_volume_sum) = 0)),
    CHECK (num_nonnulls(buy_volume, sell_volume, unknown_side_volume) IN (0, 3)),
    CHECK (buy_volume IS NULL OR buy_volume + sell_volume + unknown_side_volume = volume),
    CHECK (high_at_ns IS NULL OR (high IS NOT NULL
        AND high_at_ns >= end_ns - resolution_ns AND high_at_ns < end_ns)),
    CHECK (low_at_ns IS NULL OR (low IS NOT NULL
        AND low_at_ns >= end_ns - resolution_ns AND low_at_ns < end_ns))
) PARTITION BY RANGE (end_ns);

-- Evidence about input intervals, independent of rows. 'closed' spans come from the
-- instrument's session calendar; rolling windows skip them. 'missing' spans (vendor
-- dataset condition, file gaps, validation findings) are never skipped.
-- Importers validate that coverage intervals do not overlap.
CREATE TABLE market.coverage (
    dataset_id bigint NOT NULL REFERENCES market.dataset(id),
    instrument_id bigint NOT NULL REFERENCES market.instrument(id),
    input_kind text NOT NULL CHECK (input_kind IN ('trade', 'quote', 'bar')),
    resolution_ns bigint NOT NULL CHECK (resolution_ns >= 0),
    start_ns bigint NOT NULL CHECK (start_ns >= 0),
    end_ns bigint NOT NULL CHECK (end_ns > start_ns),
    status text NOT NULL CHECK (status IN ('observed', 'no_trades', 'closed', 'missing')),
    evidence jsonb NOT NULL CHECK (jsonb_typeof(evidence) = 'object'),
    PRIMARY KEY (dataset_id, instrument_id, input_kind, resolution_ns, start_ns),
    CHECK ((input_kind = 'bar' AND resolution_ns > 0) OR (input_kind <> 'bar' AND resolution_ns = 0))
);

-- Snapshot of a code-defined window such as '1h@1m' or '1m@1s'. Windows use trading
-- time: a candle holds the last duration/step base bars (resolution = step) from
-- steps when the market was scheduled open, so a candle after a closure spans it.
CREATE TABLE research.window_spec (
    id text PRIMARY KEY,
    definition_sha256 research.sha256 NOT NULL UNIQUE,
    duration_ns bigint NOT NULL CHECK (duration_ns > 0),
    step_ns bigint NOT NULL CHECK (step_ns > 0),
    UNIQUE (id, duration_ns, step_ns),
    CHECK (duration_ns > step_ns AND duration_ns % step_ns = 0)
);

-- pipeline snapshots metric functions, parameters, dependencies, gap policies,
-- smoothing, CVD origin/reset, initialization, lateness rules, and the session
-- calendar library and version used to decide scheduled-open steps.
CREATE TABLE research.run (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    run_key research.sha256 NOT NULL UNIQUE,
    dataset_id bigint NOT NULL REFERENCES market.dataset(id),
    mode text NOT NULL CHECK (mode IN ('historical', 'live')),
    status text NOT NULL CHECK (status IN ('building', 'complete', 'failed')),
    code_sha256 research.sha256 NOT NULL,
    pipeline jsonb NOT NULL CHECK (jsonb_typeof(pipeline) = 'object'),
    initialization_ns bigint NOT NULL CHECK (initialization_ns >= 0),
    output_start_ns bigint NOT NULL CHECK (output_start_ns >= initialization_ns),
    output_end_ns bigint CHECK (output_end_ns > output_start_ns),
    persistence_policy jsonb NOT NULL CHECK (jsonb_typeof(persistence_policy) = 'object'),
    started_at timestamptz NOT NULL DEFAULT now(),
    completed_at timestamptz,
    UNIQUE (id, dataset_id),
    CHECK (mode <> 'historical' OR output_end_ns IS NOT NULL),
    CHECK ((status = 'building' AND completed_at IS NULL)
        OR (status <> 'building' AND completed_at IS NOT NULL))
);

-- One rolling candle per open-market step and window spec, completed at end_ns.
-- Phase and ordinal come from the clock, so phase 0 matches standard session-chart
-- candles. Same-phase candles are one period of open market apart; a closure skips
-- ordinals. start_ns is the start of the oldest slot: end_ns - start_ns exceeds the
-- duration by closed_ns when the window spans a closure. irregular_closure marks a
-- candle separated from its previous same-phase candle by a closure that is not a
-- whole number of periods (e.g. a 12:15 CT early close), so the two overlap or leave
-- a gap. Spec fields are repeated for the composite FK and generated columns.
CREATE TABLE research.rolling_bar (
    run_id bigint NOT NULL REFERENCES research.run(id),
    instrument_id bigint NOT NULL REFERENCES market.instrument(id),
    window_spec_id text NOT NULL,
    duration_ns bigint NOT NULL,
    step_ns bigint NOT NULL,
    end_ns bigint NOT NULL,
    start_ns bigint NOT NULL,
    phase_index bigint GENERATED ALWAYS AS ((end_ns % duration_ns) / step_ns) STORED,
    period_ordinal bigint GENERATED ALWAYS AS (end_ns / duration_ns) STORED,
    available_ns bigint NOT NULL CHECK (available_ns >= end_ns),
    status text NOT NULL CHECK (status IN ('complete', 'empty', 'gap', 'warmup')),
    slot_count integer NOT NULL CHECK (slot_count > 0),
    missing_slots integer NOT NULL DEFAULT 0 CHECK (missing_slots >= 0),
    traded_slots integer NOT NULL CHECK (traded_slots >= 0),
    closed_ns bigint NOT NULL DEFAULT 0 CHECK (closed_ns >= 0),
    spans_closure boolean GENERATED ALWAYS AS (closed_ns > 0) STORED,
    irregular_closure boolean NOT NULL DEFAULT false,
    open market.decimal_value,
    high market.decimal_value,
    low market.decimal_value,
    close market.decimal_value,
    high_at_ns bigint,
    low_at_ns bigint,
    volume market.decimal_value CHECK (volume >= 0),
    buy_volume market.decimal_value CHECK (buy_volume >= 0),
    sell_volume market.decimal_value CHECK (sell_volume >= 0),
    unknown_side_volume market.decimal_value CHECK (unknown_side_volume >= 0),
    trade_count bigint CHECK (trade_count >= 0),
    price_volume_sum market.decimal_value,
    PRIMARY KEY (run_id, instrument_id, window_spec_id, end_ns),
    FOREIGN KEY (window_spec_id, duration_ns, step_ns)
        REFERENCES research.window_spec(id, duration_ns, step_ns),
    CHECK (start_ns >= 0 AND end_ns % step_ns = 0 AND start_ns % step_ns = 0),
    CHECK (end_ns - start_ns = slot_count * step_ns + closed_ns),
    CHECK (slot_count <= duration_ns / step_ns),
    CHECK ((status = 'warmup') = (slot_count < duration_ns / step_ns)),
    CHECK (missing_slots + traded_slots <= slot_count),
    CHECK (status <> 'gap' OR missing_slots > 0),
    CHECK (status NOT IN ('complete', 'empty') OR missing_slots = 0),
    CHECK (status <> 'complete' OR (traded_slots > 0 AND volume IS NOT NULL)),
    CHECK (status <> 'empty' OR (traded_slots = 0 AND volume = 0)),
    CHECK (num_nonnulls(open, high, low, close) = CASE WHEN traded_slots > 0 THEN 4 ELSE 0 END),
    CHECK (open IS NULL OR (low <= least(open, close) AND high >= greatest(open, close))),
    CHECK (num_nonnulls(buy_volume, sell_volume, unknown_side_volume) IN (0, 3)),
    CHECK (buy_volume IS NULL OR buy_volume + sell_volume + unknown_side_volume = volume),
    CHECK (trade_count IS NULL OR trade_count >= traded_slots),
    CHECK (high_at_ns IS NULL OR (high IS NOT NULL AND high_at_ns >= start_ns AND high_at_ns < end_ns)),
    CHECK (low_at_ns IS NULL OR (low IS NOT NULL AND low_at_ns >= start_ns AND low_at_ns < end_ns))
) PARTITION BY RANGE (end_ns);

-- One row per output of a configured metric function: scalar, bool, or category.
-- An envelope/OHLC metric has multiple named series sharing instance_key.
CREATE TABLE research.metric_series (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    run_id bigint NOT NULL REFERENCES research.run(id),
    instance_key text NOT NULL,
    output_key text NOT NULL,
    function_key text NOT NULL,
    definition_sha256 research.sha256 NOT NULL,
    value_type text NOT NULL CHECK (value_type IN ('float', 'bool', 'category')),
    unit text NOT NULL,
    parameters jsonb NOT NULL CHECK (jsonb_typeof(parameters) = 'object'),
    input_contract jsonb NOT NULL CHECK (jsonb_typeof(input_contract) = 'object'),
    is_causal boolean NOT NULL,
    feature_eligible boolean NOT NULL DEFAULT false,
    UNIQUE (run_id, instance_key, output_key),
    UNIQUE (id, run_id, value_type),
    UNIQUE (id, run_id, feature_eligible),
    CHECK (NOT feature_eligible OR is_causal)
);
CREATE TABLE research.metric_value (
    series_id bigint NOT NULL,
    run_id bigint NOT NULL,
    instrument_id bigint NOT NULL REFERENCES market.instrument(id),
    asof_ns bigint NOT NULL CHECK (asof_ns >= 0),
    asof_seq bigint NOT NULL DEFAULT 0 CHECK (asof_seq >= 0),
    available_ns bigint NOT NULL CHECK (available_ns >= asof_ns),
    input_start_ns bigint NOT NULL CHECK (input_start_ns >= 0 AND input_start_ns <= asof_ns),
    origin_ns bigint CHECK (origin_ns >= 0 AND origin_ns <= asof_ns),
    value_type text NOT NULL,
    status text NOT NULL CHECK (status IN ('valid', 'warmup', 'missing', 'unsupported')),
    value_float research.finite_float,
    value_bool boolean,
    value_category text,
    reason text,
    PRIMARY KEY (series_id, instrument_id, asof_ns, asof_seq),
    FOREIGN KEY (series_id, run_id, value_type) REFERENCES research.metric_series(id, run_id, value_type),
    CHECK ((status <> 'valid' AND num_nonnulls(value_float, value_bool, value_category) = 0 AND reason IS NOT NULL)
        OR (status = 'valid' AND num_nonnulls(value_float, value_bool, value_category) = 1
            AND ((value_type = 'float' AND value_float IS NOT NULL)
              OR (value_type = 'bool' AND value_bool IS NOT NULL)
              OR (value_type = 'category' AND value_category IS NOT NULL))))
) PARTITION BY RANGE (asof_ns);

-- Durable state (including each phase's indicator state) is external to the UI.
-- Commit checkpoint metadata only after its input cursor and output batch are
-- durable; URI data is content-addressed.
CREATE TABLE research.checkpoint (
    run_id bigint NOT NULL REFERENCES research.run(id),
    instrument_id bigint NOT NULL REFERENCES market.instrument(id),
    asof_ns bigint NOT NULL CHECK (asof_ns >= 0),
    asof_seq bigint NOT NULL CHECK (asof_seq >= 0),
    input_cursor jsonb NOT NULL CHECK (jsonb_typeof(input_cursor) = 'object'),
    state_uri text NOT NULL,
    state_sha256 research.sha256 NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (run_id, instrument_id, asof_ns, asof_seq)
);

-- The feature contract hash covers ordered columns, definitions, parameters,
-- timing/alignment, missing-value rules and encoding. Excludes dataset/run IDs so
-- future live runs can reproduce the same contract with new data.
CREATE TABLE ml.feature_set (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    run_id bigint NOT NULL REFERENCES research.run(id),
    name text NOT NULL,
    contract_sha256 research.sha256 NOT NULL,
    contract jsonb NOT NULL CHECK (jsonb_typeof(contract) = 'object'),
    UNIQUE (run_id, name),
    UNIQUE (id, run_id),
    UNIQUE (id, run_id, contract_sha256)
);
CREATE TABLE ml.feature_column (
    feature_set_id bigint NOT NULL,
    run_id bigint NOT NULL,
    position integer NOT NULL CHECK (position >= 0),
    name text NOT NULL,
    series_id bigint NOT NULL,
    feature_eligible boolean NOT NULL DEFAULT true CHECK (feature_eligible),
    max_age_ns bigint NOT NULL DEFAULT 0 CHECK (max_age_ns >= 0),
    encoding jsonb NOT NULL DEFAULT '{}' CHECK (jsonb_typeof(encoding) = 'object'),
    PRIMARY KEY (feature_set_id, position),
    UNIQUE (feature_set_id, name),
    FOREIGN KEY (feature_set_id, run_id) REFERENCES ml.feature_set(id, run_id),
    FOREIGN KEY (series_id, run_id, feature_eligible) REFERENCES research.metric_series(id, run_id, feature_eligible)
);

-- Forward targets are stored separately and become available only after maturity.
-- horizon_ns is clock time after the decision; crosses_closure flags targets whose
-- horizon includes a scheduled closure.
CREATE TABLE ml.label_spec (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    run_id bigint NOT NULL REFERENCES research.run(id),
    name text NOT NULL,
    definition_sha256 research.sha256 NOT NULL,
    horizon_ns bigint NOT NULL CHECK (horizon_ns > 0),
    parameters jsonb NOT NULL CHECK (jsonb_typeof(parameters) = 'object'),
    UNIQUE (run_id, name),
    UNIQUE (id, run_id)
);
CREATE TABLE ml.label_value (
    label_spec_id bigint NOT NULL REFERENCES ml.label_spec(id),
    instrument_id bigint NOT NULL REFERENCES market.instrument(id),
    decision_ns bigint NOT NULL CHECK (decision_ns >= 0),
    decision_seq bigint NOT NULL DEFAULT 0 CHECK (decision_seq >= 0),
    target_end_ns bigint NOT NULL CHECK (target_end_ns > decision_ns),
    available_ns bigint NOT NULL CHECK (available_ns >= target_end_ns),
    crosses_closure boolean NOT NULL DEFAULT false,
    status text NOT NULL CHECK (status IN ('valid', 'missing')),
    value_float research.finite_float,
    value_category text,
    reason text,
    PRIMARY KEY (label_spec_id, instrument_id, decision_ns, decision_seq),
    CHECK ((status = 'valid' AND num_nonnulls(value_float, value_category) = 1)
        OR (status = 'missing' AND num_nonnulls(value_float, value_category) = 0 AND reason IS NOT NULL))
) PARTITION BY RANGE (decision_ns);

-- One immutable ready export = selected instruments + decision grid + exact
-- feature/label definitions + purged chronological split manifest + Parquet hash.
CREATE TABLE ml.training_export (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    run_id bigint NOT NULL REFERENCES research.run(id),
    feature_set_id bigint NOT NULL,
    feature_contract_sha256 research.sha256 NOT NULL,
    label_spec_id bigint NOT NULL,
    status text NOT NULL CHECK (status IN ('building', 'ready', 'failed')),
    selection jsonb NOT NULL CHECK (jsonb_typeof(selection) = 'object'),
    split_manifest jsonb NOT NULL CHECK (jsonb_typeof(split_manifest) = 'object'),
    artifact_uri text,
    artifact_sha256 research.sha256,
    created_at timestamptz NOT NULL DEFAULT now(),
    FOREIGN KEY (feature_set_id, run_id, feature_contract_sha256)
        REFERENCES ml.feature_set(id, run_id, contract_sha256),
    FOREIGN KEY (label_spec_id, run_id) REFERENCES ml.label_spec(id, run_id),
    UNIQUE (id, feature_contract_sha256),
    CHECK (status <> 'ready' OR (artifact_uri IS NOT NULL AND artifact_sha256 IS NOT NULL)),
    CHECK ((artifact_uri IS NULL) = (artifact_sha256 IS NULL))
);
CREATE TABLE ml.model (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name text NOT NULL,
    version text NOT NULL,
    training_export_id bigint NOT NULL,
    feature_contract_sha256 research.sha256 NOT NULL,
    training_cutoff_ns bigint NOT NULL CHECK (training_cutoff_ns >= 0),
    code_sha256 research.sha256 NOT NULL,
    parameters jsonb NOT NULL CHECK (jsonb_typeof(parameters) = 'object'),
    evaluation jsonb NOT NULL CHECK (jsonb_typeof(evaluation) = 'object'),
    artifact_uri text NOT NULL,
    artifact_sha256 research.sha256 NOT NULL,
    preprocessing_uri text,
    preprocessing_sha256 research.sha256,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (name, version),
    UNIQUE (id, feature_contract_sha256),
    FOREIGN KEY (training_export_id, feature_contract_sha256)
        REFERENCES ml.training_export(id, feature_contract_sha256),
    CHECK ((preprocessing_uri IS NULL) = (preprocessing_sha256 IS NULL))
);
CREATE TABLE ml.prediction (
    model_id bigint NOT NULL,
    run_id bigint NOT NULL,
    feature_set_id bigint NOT NULL,
    feature_contract_sha256 research.sha256 NOT NULL,
    instrument_id bigint NOT NULL REFERENCES market.instrument(id),
    asof_ns bigint NOT NULL CHECK (asof_ns >= 0),
    asof_seq bigint NOT NULL DEFAULT 0 CHECK (asof_seq >= 0),
    available_ns bigint NOT NULL CHECK (available_ns >= asof_ns),
    input_snapshot jsonb NOT NULL CHECK (jsonb_typeof(input_snapshot) = 'object'),
    output jsonb NOT NULL CHECK (jsonb_typeof(output) = 'object'),
    PRIMARY KEY (model_id, run_id, instrument_id, asof_ns, asof_seq),
    FOREIGN KEY (model_id, feature_contract_sha256) REFERENCES ml.model(id, feature_contract_sha256),
    FOREIGN KEY (feature_set_id, run_id, feature_contract_sha256)
        REFERENCES ml.feature_set(id, run_id, contract_sha256)
) PARTITION BY RANGE (asof_ns);

-- B-tree PKs serve instrument/series range reads. BRIN supports coarse time scans
-- when append order is time-correlated; benchmark with the actual ingest ordering.
CREATE INDEX trade_time_brin ON market.trade USING brin(event_ns);
CREATE INDEX quote_time_brin ON market.quote USING brin(event_ns);
CREATE INDEX base_bar_time_brin ON market.base_bar USING brin(end_ns);
CREATE INDEX rolling_bar_time_brin ON research.rolling_bar USING brin(end_ns);
-- Same phase + descending time reads a phase series (e.g. 15 or 500 candles)
-- without scanning the other phases. Time bounds allow range-partition pruning.
CREATE INDEX rolling_bar_phase_history ON research.rolling_bar
    (run_id, instrument_id, window_spec_id, phase_index, end_ns DESC);
CREATE INDEX metric_value_time_brin ON research.metric_value USING brin(asof_ns);
CREATE INDEX label_value_time_brin ON ml.label_value USING brin(decision_ns);
CREATE INDEX prediction_time_brin ON ml.prediction USING brin(asof_ns);
COMMIT;
