-- $1 run_id, $2 instrument_id, $3 window_spec_id, $4 anchor_end_ns,
-- $5 candle_count (positive, includes the anchor), $6 earliest_end_ns, $7 knowledge_ns.
-- Returns the anchor's phase series oldest first, as input to a standard indicator.
-- Trading time: same-phase candles are one period of open market apart, so their
-- end times skip scheduled closures and are not a fixed stride. The caller derives
-- the expected end times from the instrument's session calendar, passes the oldest
-- as $6 (bounding the scan and enabling partition pruning), and compares them with
-- the returned rows. A missing row is a missing slot: never replace it with an
-- older candle. This query supplies candles, not all initialization an indicator needs.
WITH spec AS (
    SELECT duration_ns, step_ns FROM research.window_spec WHERE id = $3
), history AS (
    SELECT b.end_ns, b.start_ns, b.phase_index, b.period_ordinal, b.available_ns,
           b.status, b.spans_closure, b.irregular_closure,
           b.open, b.high, b.low, b.close, b.volume,
           (b.status = 'complete' AND b.available_ns <= $7) AS usable
    FROM research.rolling_bar b CROSS JOIN spec s
    WHERE b.run_id = $1 AND b.instrument_id = $2 AND b.window_spec_id = $3
      AND $4 % s.step_ns = 0
      AND b.phase_index = ($4 % s.duration_ns) / s.step_ns
      AND b.end_ns <= $4
      AND b.end_ns >= $6
    ORDER BY b.end_ns DESC
    LIMIT $5
)
SELECT end_ns, start_ns, phase_index, period_ordinal, available_ns,
       status, spans_closure, irregular_closure, usable,
       CASE WHEN usable THEN open END AS open,
       CASE WHEN usable THEN high END AS high,
       CASE WHEN usable THEN low END AS low,
       CASE WHEN usable THEN close END AS close,
       CASE WHEN usable THEN volume END AS volume
FROM history ORDER BY end_ns;
