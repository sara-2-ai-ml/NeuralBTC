import numpy as np
import pandas as pd
import requests
import joblib
import tensorflow as tf
from datetime import datetime, timezone
import os


BASE_DIR    = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH  = os.path.join(BASE_DIR, 'models', 'final_model.keras')
SCALER_PATH = os.path.join(BASE_DIR, 'models', 'scaler.pkl')
WINDOW_SIZE = 168
FEATURES    = ['close', 'log_volume', 'returns',
               'volatility_24h', 'ma_24', 'ma_168',
               'hour_sin', 'hour_cos', 'dow_sin', 'dow_cos']


def fetch_live_data():
    """Fetch last 400h of BTCUSDT from Binance."""
    url = "https://api.binance.com/api/v3/klines"
    params = {
        "symbol":   "BTCUSDT",
        "interval": "1h",
        "limit":    400
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
    df['close']  = df['close'].astype(float)
    df['volume'] = df['volume'].astype(float)
    return df


def engineer_features(df):
    """Apply same feature engineering as training."""
    df = df.copy()
    df['log_volume']     = np.log1p(df['volume'])
    df['returns']        = df['close'].pct_change()
    df['volatility_24h'] = df['returns'].rolling(24).std()
    df['ma_24']          = df['close'].rolling(24).mean()
    df['ma_168']         = df['close'].rolling(168).mean()
    df['hour_sin'] = np.sin(
        2 * np.pi * df['timestamp'].dt.hour / 24
    )
    df['hour_cos'] = np.cos(
        2 * np.pi * df['timestamp'].dt.hour / 24
    )
    df['dow_sin'] = np.sin(
        2 * np.pi * df['timestamp'].dt.dayofweek / 7
    )
    df['dow_cos'] = np.cos(
        2 * np.pi * df['timestamp'].dt.dayofweek / 7
    )
    df = df.dropna()
    return df


def run_price_agent():
    """
    Fetch live BTC data, preprocess, and predict
    the closing price 1 hour ahead.
    """
    print("=" * 50)
    print("PRICE AGENT")
    print("=" * 50)

    # ── Fetch live data ───────────────────────────────
    print("Fetching live BTCUSDT data...")
    df = fetch_live_data()
    print(f"Fetched {len(df)} rows")
    print(f"Latest timestamp: {df['timestamp'].iloc[-1]}")

    current_price = df['close'].iloc[-1]
    print(f"Current BTC price: ${current_price:,.2f}")

    # ── Feature engineering ───────────────────────────
    df = engineer_features(df)
    print(f"After engineering: {len(df)} rows")

    if len(df) < WINDOW_SIZE:
        raise ValueError(
            f"Not enough data: {len(df)} < {WINDOW_SIZE}"
        )

    # ── Load scaler + model ───────────────────────────
    scaler = joblib.load(SCALER_PATH)
    model  = tf.keras.models.load_model(MODEL_PATH)
    print("Model and scaler loaded OK")

    # ── Scale ─────────────────────────────────────────
    window_data   = df[FEATURES].iloc[-WINDOW_SIZE:].values
    window_scaled = scaler.transform(window_data)

    # ── Predict ───────────────────────────────────────
    X = window_scaled.reshape(
        1, WINDOW_SIZE, len(FEATURES)
    )
    pred_scaled = model.predict(X, verbose=0)[0, 0]

    # ── Inverse transform — close only ───────────────
    close_min = scaler.data_min_[0]
    close_max = scaler.data_max_[0]
    pred_usd  = pred_scaled * (close_max - close_min) \
                + close_min

    print(f"\nScaler close range: "
          f"${close_min:,.2f} → ${close_max:,.2f}")
    print(f"Predicted scaled:   {pred_scaled:.6f}")
    print(f"Predicted USD:      ${pred_usd:,.2f}")

    change_pct = (pred_usd - current_price) / \
                 current_price * 100

    result = {
        'current_price':   round(current_price, 2),
        'predicted_price': round(pred_usd, 2),
        'change_pct':      round(change_pct, 4),
        'timestamp':       df['timestamp'].iloc[-1].isoformat(),
        'direction':       'UP' if change_pct > 0 else 'DOWN'
    }

    print(f"\nPredicted price t+1h: ${pred_usd:,.2f}")
    print(f"Expected change:      {change_pct:+.2f}%")
    print(f"Direction:            {result['direction']}")
    print("=" * 50)

    return result


if __name__ == '__main__':
    result = run_price_agent()
    print("\nResult:", result)
