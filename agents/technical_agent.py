import numpy as np
import pandas as pd
import requests
import ta
from ta.momentum import RSIIndicator
from ta.trend import MACD
from ta.volatility import BollingerBands


def fetch_ohlcv():
    """Fetch last 200h BTCUSDT OHLCV from Binance."""
    url = "https://api.binance.com/api/v3/klines"
    params = {
        "symbol":   "BTCUSDT",
        "interval": "1h",
        "limit":    200
    }
    resp = requests.get(url, params=params, timeout=10)
    resp.raise_for_status()

    df = pd.DataFrame(resp.json(), columns=[
        'timestamp', 'open', 'high', 'low', 'close',
        'volume', 'close_time', 'quote_vol', 'trades',
        'taker_base', 'taker_quote', 'ignore'
    ])
    df['timestamp'] = pd.to_datetime(
        df['timestamp'], unit='ms'
    )
    for col in ['open', 'high', 'low', 'close', 'volume']:
        df[col] = df[col].astype(float)
    return df


def compute_indicators(df):
    """Compute RSI, MACD, and Bollinger Bands."""

    # ── RSI (14) ──────────────────────────────────────
    rsi = RSIIndicator(close=df['close'], window=14)
    df['rsi'] = rsi.rsi()

    # ── MACD ──────────────────────────────────────────
    macd = MACD(
        close=df['close'],
        window_slow=26,
        window_fast=12,
        window_sign=9
    )
    df['macd']        = macd.macd()
    df['macd_signal'] = macd.macd_signal()
    df['macd_diff']   = macd.macd_diff()

    # ── Bollinger Bands ───────────────────────────────
    bb = BollingerBands(
        close=df['close'], window=20, window_dev=2
    )
    df['bb_upper']  = bb.bollinger_hband()
    df['bb_middle'] = bb.bollinger_mavg()
    df['bb_lower']  = bb.bollinger_lband()
    df['bb_width']  = bb.bollinger_wband()

    return df.dropna()


def interpret_signals(df):
    """Interpret technical indicators into signals."""
    latest = df.iloc[-1]
    signals = []

    # ── RSI interpretation ────────────────────────────
    rsi_val = latest['rsi']
    if rsi_val > 70:
        rsi_signal = 'OVERBOUGHT'
        signals.append('SELL')
    elif rsi_val < 30:
        rsi_signal = 'OVERSOLD'
        signals.append('BUY')
    else:
        rsi_signal = 'NEUTRAL'
        signals.append('HOLD')

    # ── MACD interpretation ───────────────────────────
    macd_diff = latest['macd_diff']
    prev_diff = df.iloc[-2]['macd_diff']

    if macd_diff > 0 and prev_diff <= 0:
        macd_signal = 'BULLISH CROSSOVER'
        signals.append('BUY')
    elif macd_diff < 0 and prev_diff >= 0:
        macd_signal = 'BEARISH CROSSOVER'
        signals.append('SELL')
    elif macd_diff > 0:
        macd_signal = 'BULLISH'
        signals.append('BUY')
    else:
        macd_signal = 'BEARISH'
        signals.append('SELL')

    # ── Bollinger Bands interpretation ────────────────
    close     = latest['close']
    bb_upper  = latest['bb_upper']
    bb_lower  = latest['bb_lower']
    bb_middle = latest['bb_middle']

    if close > bb_upper:
        bb_signal = 'ABOVE UPPER BAND — overbought'
        signals.append('SELL')
    elif close < bb_lower:
        bb_signal = 'BELOW LOWER BAND — oversold'
        signals.append('BUY')
    elif close > bb_middle:
        bb_signal = 'ABOVE MIDDLE — bullish'
        signals.append('BUY')
    else:
        bb_signal = 'BELOW MIDDLE — bearish'
        signals.append('SELL')

    # ── Overall signal ────────────────────────────────
    buy_count  = signals.count('BUY')
    sell_count = signals.count('SELL')
    hold_count = signals.count('HOLD')

    if buy_count > sell_count:
        overall = 'BUY'
    elif sell_count > buy_count:
        overall = 'SELL'
    else:
        overall = 'HOLD'

    return {
        'rsi':        round(rsi_val, 2),
        'rsi_signal': rsi_signal,
        'macd':       round(latest['macd'], 2),
        'macd_signal': macd_signal,
        'bb_upper':   round(bb_upper, 2),
        'bb_lower':   round(bb_lower, 2),
        'bb_signal':  bb_signal,
        'overall':    overall,
        'buy_signals':  buy_count,
        'sell_signals': sell_count,
        'hold_signals': hold_count
    }


def run_technical_agent():
    """Compute technical indicators and signals."""
    print("=" * 50)
    print("TECHNICAL AGENT")
    print("=" * 50)

    # ── Fetch data ────────────────────────────────────
    print("Fetching OHLCV data...")
    df = fetch_ohlcv()
    print(f"Fetched {len(df)} rows")

    # ── Compute indicators ────────────────────────────
    df = compute_indicators(df)
    print("Indicators computed OK")

    # ── Interpret signals ─────────────────────────────
    signals = interpret_signals(df)

    print("\n" + "=" * 50)
    print("TECHNICAL ANALYSIS")
    print("=" * 50)
    print(f"RSI (14):      {signals['rsi']} "
          f"→ {signals['rsi_signal']}")
    print(f"MACD:          {signals['macd']} "
          f"→ {signals['macd_signal']}")
    print(f"Bollinger:     {signals['bb_signal']}")
    print(f"BB Upper:      ${signals['bb_upper']:,.2f}")
    print(f"BB Lower:      ${signals['bb_lower']:,.2f}")
    print("-" * 50)
    print(f"BUY signals:   {signals['buy_signals']}/3")
    print(f"SELL signals:  {signals['sell_signals']}/3")
    print(f"HOLD signals:  {signals['hold_signals']}/3")
    print("-" * 50)
    print(f"OVERALL:       {signals['overall']}")
    print("=" * 50)

    return signals


if __name__ == '__main__':
    result = run_technical_agent()
    print("\nResult:", result)