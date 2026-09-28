# ARCHIVED — historical reference only

This code is retired, excluded from the active workspace, and must not be deployed.
The instructions below describe the former architecture and do not govern active code.

## TBBO data

A file like this is processed by `scripts/tbbo-1m-1s.ts`.

Important details:

- the file is JSONL, not a single JSON array
- real files are large, so the script reads them line-by-line
- each line is one trade record
- spread contracts such as `ESZ5-ESH6` are skipped
- the batch script should stay behaviorally aligned with the live stream path
- the batch script is part of the canonical source-of-truth writer pipeline
- after `tbbo-1m-1s.ts` fills `candles_1m_1s`, `candles-1h-1m.ts` can rebuild `candles_1h_1m`

```
{"ts_recv":"2025-11-30T23:00:00.039353882Z","hd":{"ts_event":"2025-11-30T23:00:00.000000000Z","rtype":1,"publisher_id":1,"instrument_id":42140878},"action":"T","side":"N","depth":0,"price":"6913.500000000","size":1,"flags":0,"ts_in_delta":13803,"sequence":3353,"levels":[{"bid_px":"6915.750000000","ask_px":"6913.000000000","bid_sz":1,"ask_sz":1,"bid_ct":1,"ask_ct":1}],"symbol":"ESH6"}
{"ts_recv":"2025-11-30T23:00:00.039411041Z","hd":{"ts_event":"2025-11-30T23:00:00.000000000Z","rtype":1,"publisher_id":1,"instrument_id":294973},"action":"T","side":"N","depth":0,"price":"6854.750000000","size":84,"flags":0,"ts_in_delta":14448,"sequence":3354,"levels":[{"bid_px":"6875.000000000","ask_px":"6820.000000000","bid_sz":9,"ask_sz":8,"bid_ct":1,"ask_ct":1}],"symbol":"ESZ5"}
{"ts_recv":"2025-11-30T23:00:00.041192999Z","hd":{"ts_event":"2025-11-30T23:00:00.000000000Z","rtype":1,"publisher_id":1,"instrument_id":42007065},"action":"T","side":"N","depth":0,"price":"58.750000000","size":1,"flags":0,"ts_in_delta":13932,"sequence":3355,"levels":[{"bid_px":"58.750000000","ask_px":"58.750000000","bid_sz":1,"ask_sz":1,"bid_ct":1,"ask_ct":1}],"symbol":"ESZ5-ESH6"}
```
