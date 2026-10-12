from dataclasses import replace
import hashlib
import json
from pathlib import Path
import tempfile
import threading
import unittest
from unittest.mock import patch
from urllib.error import HTTPError
from urllib.request import Request, urlopen
from http.server import ThreadingHTTPServer
from strategy_core import Bar, Config, Instrument, Replay, run_backtest
from strategy_core.order_flow import book_imbalance, divergence, infer_side
from strategy_core.strategies import RsiReversion
from backtest_runner.data import parse_csv, quality, validate_id
from backtest_runner.server import Handler
from backtest_runner import service, data


def bars(prices):
    return [Bar(i * 60, p, p + 1, p - 1, p, 10) for i, p in enumerate(prices)]


HEADER = 'ts_event,ts_recv,instrument_id,symbol,action,side,price,size,bid_px_00,ask_px_00,bid_sz_00,ask_sz_00\n'


def trade(time, price, size=1, symbol='MGCZ6'):
    return f'{time},{time},123,{symbol},T,B,{price},{size},100,101,2,3\n'


class DataTests(unittest.TestCase):
    def test_manifest_loads_verified_tbbo_export(self):
        content = (HEADER + trade('2026-09-25T00:00:01.000000001+00:00', '100.1', 2)).encode()
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            cache = root / 'databento'
            manifests = root / 'manifests'
            cache.mkdir()
            manifests.mkdir()
            (cache / 'ticks.csv').write_bytes(content)
            metadata = {'id': 'fixture', 'provider': 'databento', 'dataset': 'GLBX.MDP3',
                        'schema': 'tbbo', 'encoding': 'csv', 'price_format': 'decimal',
                        'timestamp_format': 'iso8601_utc', 'asset': 'future', 'symbol': 'MGCZ6',
                        'contract': 'MGCZ6', 'multiplier': 10, 'tick_size': .1,
                        'files': [{'path': 'ticks.csv', 'sha256': hashlib.sha256(content).hexdigest()}]}
            (manifests / 'fixture.json').write_text(json.dumps(metadata))
            with patch.object(data, 'CACHE', cache), patch.object(data, 'MANIFESTS', manifests):
                loaded, result = data.load('fixture')
        self.assertEqual(loaded['dataset'], 'GLBX.MDP3')
        self.assertEqual((len(result), result[0].volume), (1, 2))

    def test_tbbo_trades_aggregate_observed_minutes(self):
        content = HEADER + trade('2026-09-25T00:00:01+00:00', '100.1', 2) + trade('2026-09-25T00:00:02+00:00', '99.9', 3) + trade('2026-09-25T00:02:00+00:00', '100.2', 1)
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp, 'ticks.csv')
            path.write_text(content)
            result = parse_csv(path, 'MGCZ6')
        self.assertEqual(len(result), 2)
        self.assertEqual((result[0].open, result[0].high, result[0].low, result[0].close, result[0].volume),
                         (100.1, 100.1, 99.9, 99.9, 5))
        self.assertEqual(result[1].time - result[0].time, 120)

    def test_reject_wrong_symbol_nonfinite_and_out_of_order_trades(self):
        first = trade('2026-09-25T00:00:02+00:00', '100')
        bad = [first + trade('2026-09-25T00:00:01+00:00', '101'),
               trade('2026-09-25T00:00:01+00:00', 'NaN'),
               trade('2026-09-25T00:00:01+00:00', '100', symbol='ESZ6'),
               trade('2026-09-25T00:00:01+00:00', '100', size=0),
               trade('2026-09-25T00:00:00.000000002+00:00', '100') + trade('2026-09-25T00:00:00.000000001+00:00', '101')]
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp, 'ticks.csv')
            for content in bad:
                with self.subTest(content=content), self.assertRaises(ValueError):
                    path.write_text(HEADER + content)
                    parse_csv(path, 'MGCZ6')

    def test_gaps_preserved(self):
        source = bars([10, 11, 12])
        source[-1] = replace(source[-1], time=240)
        report = quality({'id': 'test'}, source)
        self.assertEqual(report['bars'], 3)
        self.assertEqual(report['unobserved_minutes'], 2)

    def test_checksum_mismatch_is_rejected(self):
        with tempfile.TemporaryDirectory() as tmp, patch.object(data, "CACHE", Path(tmp)):
            Path(tmp, "data.csv").write_bytes(b"altered")
            with self.assertRaisesRegex(ValueError, "Checksum mismatch"):
                data.verified_path({"path": "data.csv", "sha256": "0" * 64})

    def test_path_traversal_rejected(self):
        for value in ['../x', '/tmp/x', 'a/b', '', None]:
            with self.assertRaises(ValueError):
                validate_id(value)


class ReplayTests(unittest.TestCase):
    def setUp(self):
        self.config = Config(fast=1, slow=2, fee_bps=0, slippage_bps=0, quantity=1)
        self.instrument = Instrument('BTCUSD', 'crypto')

    def test_next_bar_open_and_terminal_mark_to_market(self):
        source = bars([100, 110, 120, 130])
        result = run_backtest(source, self.config, self.instrument)
        self.assertEqual(result['fills'], [{'time': 120, 'decision_time': 120, 'quantity': 1., 'price': 120., 'fee': 0., 'position': 1.}])
        self.assertEqual(result['metrics']['net_pnl'], 10)
        self.assertEqual(result['metrics']['open_position'], 1)

    def test_batch_stream_and_prefix_invariance(self):
        source = bars([100, 101, 104, 102, 98, 110, 99, 100])
        batch = run_backtest(source, self.config, self.instrument)
        replay = Replay(self.config, self.instrument)
        for bar in source:
            replay.on_bar(bar)
        self.assertEqual(batch, replay.result())
        prefix = run_backtest(source[:5], self.config, self.instrument)
        self.assertEqual(prefix['equity'], batch['equity'][:5])
        self.assertEqual(prefix['fills'], [f for f in batch['fills'] if f['time'] <= source[4].time])

    def test_costs_and_future_multiplier(self):
        c = replace(self.config, fee_per_unit=2.5, initial_cash=100000)
        result = run_backtest(bars([100, 101, 102, 104]), c, Instrument('ES-201312', 'future', 50, .25))
        self.assertEqual(result['metrics']['net_pnl'], 97.5)
        self.assertEqual(result['metrics']['fees'], 2.5)

    def test_short_pnl_and_round_trip_costs(self):
        c = replace(self.config, allow_short=True, fee_per_unit=2.5)
        result = run_backtest(bars([105, 104, 103, 102]), c, Instrument('ES', 'future', 50, .25))
        self.assertEqual(result['metrics']['net_pnl'], 47.5)
        self.assertEqual(result['metrics']['open_position'], -1)

    def test_reversal_charges_both_contract_legs(self):
        c = replace(self.config, allow_short=True, fee_per_unit=2.5)
        result = run_backtest(bars([100, 101, 99, 98]), c, Instrument("ES", "future", 50, .25))
        self.assertEqual([f["quantity"] for f in result["fills"]], [1, -2])
        self.assertEqual(result["metrics"]["fees"], 7.5)
        self.assertEqual(result["metrics"]["net_pnl"], -57.5)

    def test_slippage_rounds_against_trader(self):
        c = replace(self.config, slippage_bps=1)
        result = run_backtest(bars([100, 101, 102, 103]), c, Instrument('ES', 'future', 50, .25))
        self.assertEqual(result['fills'][0]['price'], 102.25)

    def test_drawdown_halt_exits_on_following_bar(self):
        c = replace(self.config, initial_cash=1000, max_drawdown_pct=1)
        result = run_backtest(bars([100, 101, 102, 50, 49, 60]), c, self.instrument)
        self.assertTrue(result['metrics']['halted'])
        self.assertEqual(result['metrics']['open_position'], 0)
        self.assertEqual(result['fills'][-1]['time'], 240)
        self.assertEqual(result['fills'][-1]['price'], 49)

    def test_insufficient_collateral_rejects_entry(self):
        c = replace(self.config, initial_cash=100)
        result = run_backtest(bars([100, 101, 102, 103]), c, self.instrument)
        self.assertFalse(result['fills'])
        self.assertIn('insufficient_collateral', [d['reason'] for d in result['decisions']])

    def test_last_signal_is_pending_not_same_bar_fill(self):
        result = run_backtest(bars([100, 99, 101]), self.config, self.instrument)
        self.assertEqual(result['metrics']['fill_count'], 0)
        self.assertEqual(result['pending_target'], 1)

    def test_rsi_honors_global_warmup(self):
        c = replace(self.config, strategy="rsi_reversion", fast=1, slow=4)
        result = run_backtest(bars([100, 99, 98, 97, 96, 95]), c, self.instrument)
        self.assertEqual(result["fills"][0]["time"], 240)

    def test_zero_volume_has_no_fill(self):
        source = bars([100, 101, 102, 103])
        source[2] = replace(source[2], volume=0)
        result = run_backtest(source, self.config, self.instrument)
        self.assertEqual(result['fills'][0]['time'], 180)

    def test_invalid_config_and_instrument(self):
        for options in [{'fast': 2, 'slow': 2}, {'quantity': float('nan')}, {'allow_short': 'yes'}, {'initial_cash': -1}, {'fee_bps': True}, {'slow': 2.2}]:
            with self.subTest(options=options), self.assertRaises(ValueError):
                Config(**options)
        with self.assertRaises(ValueError):
            Replay(replace(self.config, quantity=.5), Instrument('ES', 'future'))
        with self.assertRaises(ValueError):
            Replay(replace(self.config, allow_short=True), self.instrument)

    def test_out_of_order_rejected(self):
        replay = Replay(self.config, self.instrument)
        replay.on_bar(bars([100])[0])
        with self.assertRaises(ValueError):
            replay.on_bar(bars([100])[0])

    def test_rsi_warmup_and_reversion(self):
        strategy = RsiReversion(2, False)
        outputs = [strategy.on_bar(b) for b in bars([100, 99, 98, 110])]
        self.assertEqual(outputs, [None, None, 1, 0])


class PortedMetricTests(unittest.TestCase):
    def test_missing_book_not_neutral(self):
        self.assertIsNone(book_imbalance(0, 0))
        self.assertAlmostEqual(book_imbalance(30, 10), .5)
        with self.assertRaises(ValueError):
            book_imbalance(-1, 2)

    def test_quote_test_handles_midpoint_and_crossed_quotes(self):
        self.assertEqual(infer_side(101, 99, 101), 'buy')
        self.assertEqual(infer_side(99, 99, 101), 'sell')
        self.assertIsNone(infer_side(100, 99, 101))
        self.assertIsNone(infer_side(100, 101, 99))

    def test_divergence_thresholds(self):
        self.assertEqual(divergence(.5, -.1), 1)
        self.assertEqual(divergence(-.5, .1), -1)
        self.assertEqual(divergence(.49, -.5), 0)


class ApiTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.patches = [patch.object(service, 'RUNS', Path(self.temp.name)),
                        patch.object(service, 'load', return_value=({'id': 'fixture', 'symbol': 'BTCUSD', 'asset': 'crypto', 'multiplier': 1, 'tick_size': .01}, bars([100, 101, 102, 103])))]
        for item in self.patches:
            item.start()
        self.server = ThreadingHTTPServer(('127.0.0.1', 0), Handler)
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()
        self.base = f'http://127.0.0.1:{self.server.server_port}'

    def tearDown(self):
        self.server.shutdown(); self.server.server_close(); self.thread.join()
        for item in self.patches:
            item.stop()
        self.temp.cleanup()

    def test_run_persistence_and_reproducible_identity(self):
        body = json.dumps({'dataset': 'fixture', 'config': {'fast': 1, 'slow': 2}}).encode()
        request = Request(self.base + '/api/runs', data=body, headers={'Content-Type': 'application/json'})
        with urlopen(request) as response:
            result = json.load(response)
        with urlopen(request) as response:
            repeated = json.load(response)
        self.assertEqual(result['id'], repeated['id'])
        with urlopen(self.base + '/api/runs/' + result['id']) as response:
            saved = json.load(response)
        self.assertEqual(saved['fills'], result['fills'])
        with urlopen(self.base + '/api/runs') as response:
            self.assertEqual(len(json.load(response)), 1)

    def test_bad_config_and_cross_origin_rejected(self):
        for config, origin in [({'quantity': 'bad'}, 'http://localhost:4400'), ({}, 'https://example.com')]:
            request = Request(self.base + '/api/runs', data=json.dumps({'dataset': 'fixture', 'config': config}).encode(), headers={'Content-Type': 'application/json', 'Origin': origin})
            with self.assertRaises(HTTPError) as error:
                urlopen(request)
            self.assertEqual(error.exception.code, 400)
            error.exception.close()

    def test_local_ui_origins_match_web_port(self):
        for origin in ('http://localhost:4400', 'http://127.0.0.1:4400',
                       'http://localhost:5173', 'https://example.com'):
            with self.subTest(origin=origin), patch('backtest_runner.server.execute', return_value={'id': 'fixture'}) as execute:
                request = Request(self.base + '/api/runs', data=b'{"dataset":"fixture"}',
                                  headers={'Content-Type': 'application/json', 'Origin': origin})
                if origin in ('http://localhost:4400', 'http://127.0.0.1:4400'):
                    with urlopen(request) as response:
                        self.assertEqual(response.status, 200)
                    execute.assert_called_once_with('fixture', {})
                else:
                    with self.assertRaises(HTTPError) as error:
                        urlopen(request)
                    self.assertEqual(error.exception.code, 400)
                    self.assertEqual(json.load(error.exception)['error'], 'Untrusted browser origin')
                    error.exception.close()
                    execute.assert_not_called()
