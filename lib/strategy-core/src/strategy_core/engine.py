"""Small research simulator, separate from a brokerage execution adapter."""
from dataclasses import asdict, dataclass
from math import ceil, floor, isfinite
from .models import Bar, Instrument
from .strategies import MovingAverageCross, RsiReversion, Strategy


@dataclass(frozen=True)
class Config:
    strategy: str = "sma_cross"
    fast: int = 10
    slow: int = 30
    initial_cash: float = 100000
    quantity: float = 1
    fee_bps: float = 5
    fee_per_unit: float = 0
    slippage_bps: float = 1
    max_drawdown_pct: float = 10
    allow_short: bool = False

    def __post_init__(self):
        if self.strategy not in ("sma_cross", "rsi_reversion"):
            raise ValueError("Unknown strategy")
        if type(self.fast) is not int or type(self.slow) is not int or not 1 <= self.fast < self.slow <= 10000:
            raise ValueError("Require integer windows: 1 <= fast < slow <= 10000")
        if type(self.allow_short) is not bool:
            raise ValueError("allow_short must be boolean")
        for name in ("initial_cash", "quantity", "fee_bps", "fee_per_unit", "slippage_bps", "max_drawdown_pct"):
            value = getattr(self, name)
            if type(value) not in (int, float) or not isfinite(value) or value < 0:
                raise ValueError(f"{name} must be a finite nonnegative number")
        if self.initial_cash <= 0 or self.quantity <= 0 or not 0 < self.max_drawdown_pct <= 100:
            raise ValueError("Cash and quantity must be positive; drawdown must be in (0, 100]")
        if max(self.fee_bps, self.slippage_bps) > 1000:
            raise ValueError("Costs must be <= 1000 basis points")


class Replay:
    """One on_bar transition for batch and sequential feeds. Persisted live recovery is future work."""
    def __init__(self, config: Config, instrument: Instrument, strategy: Strategy | None = None):
        if instrument.asset == "crypto" and config.allow_short:
            raise ValueError("Spot crypto shorts require a borrowing model; unsupported")
        if instrument.asset == "future" and not float(config.quantity).is_integer():
            raise ValueError("Futures quantity must be whole contracts")
        self.config, self.instrument = config, instrument
        self.strategy = strategy or (MovingAverageCross(config.fast, config.slow, config.allow_short) if config.strategy == "sma_cross" else RsiReversion(config.fast, config.allow_short))
        self.cash = self.peak = config.initial_cash
        self.position = 0.0
        self.previous: Bar | None = None
        self.pending: tuple[float, int] | None = None
        self.halted = False
        self.fills: list[dict] = []
        self.decisions: list[dict] = []
        self.equity: list[dict] = []
        self.max_drawdown = 0.0

    def _fill(self, bar: Bar):
        if self.pending is None:
            return
        target, decision_time = self.pending
        self.pending = None
        delta = target - self.position
        if not delta or bar.volume == 0:
            return
        c, i = self.config, self.instrument
        if bar.open <= 0:
            raise ValueError("This prototype does not model nonpositive trade prices")
        raw = bar.open * (1 + (1 if delta > 0 else -1) * c.slippage_bps / 10000)
        # Adverse tick rounding; fees charged on turnover, including both legs of reversals.
        price = (ceil(raw / i.tick_size - 1e-9) if delta > 0 else floor(raw / i.tick_size + 1e-9)) * i.tick_size
        fee = abs(delta) * (abs(price) * i.multiplier * c.fee_bps / 10000 + c.fee_per_unit)
        equity_at_open = self.cash + self.position * bar.open * i.multiplier
        # Fully collateralized model, including futures. No implied leverage/margin realism.
        equity_after_fill = equity_at_open + delta * (bar.open - price) * i.multiplier - fee
        if target != 0 and abs(target * bar.open * i.multiplier) > equity_after_fill:
            self.decisions.append({"time": bar.time, "target": target, "reason": "insufficient_collateral"})
            return
        self.cash -= delta * price * i.multiplier + fee
        self.position = target
        self.fills.append({"time": bar.time, "decision_time": decision_time, "quantity": delta, "price": price, "fee": fee, "position": target})

    def on_bar(self, bar: Bar):
        if self.previous and bar.time <= self.previous.time:
            raise ValueError("Duplicate or out-of-order bars")
        if bar.low <= 0:
            raise ValueError("This prototype supports positive prices only")
        self._fill(bar)
        equity = self.cash + self.position * bar.close * self.instrument.multiplier
        self.peak = max(self.peak, equity)
        drawdown = (self.peak - equity) / self.peak * 100
        self.max_drawdown = max(self.max_drawdown, drawdown)
        self.equity.append({"time": bar.time + 60, "value": equity, "drawdown_pct": drawdown, "position": self.position})
        if drawdown >= self.config.max_drawdown_pct:
            self.halted = True
        direction = self.strategy.on_bar(bar)
        if len(self.equity) < self.config.slow:
            direction = None
        target = 0.0 if self.halted else None if direction is None else direction * self.config.quantity
        if target is not None and target != self.position:
            self.pending = (target, bar.time + 60)
            self.decisions.append({"time": bar.time + 60, "target": target, "reason": "drawdown_halt" if self.halted else self.config.strategy})
        self.previous = bar

    def result(self) -> dict:
        ending = self.equity[-1]["value"] if self.equity else self.config.initial_cash
        return {"config": asdict(self.config), "instrument": asdict(self.instrument), "fills": self.fills, "decisions": self.decisions, "equity": self.equity,
                "metrics": {"initial_equity": self.config.initial_cash, "ending_equity": ending, "net_pnl": ending - self.config.initial_cash,
                            "return_pct": (ending / self.config.initial_cash - 1) * 100, "max_drawdown_pct": self.max_drawdown,
                            "fees": sum(f["fee"] for f in self.fills), "fill_count": len(self.fills), "open_position": self.position, "halted": self.halted},
                "pending_target": self.pending[0] if self.pending else None}


def run_backtest(bars: list[Bar], config: Config, instrument: Instrument) -> dict:
    if len(bars) <= config.slow:
        raise ValueError("Dataset must contain more bars than the slow warmup window")
    replay = Replay(config, instrument)
    for bar in bars:
        replay.on_bar(bar)
    return replay.result()
