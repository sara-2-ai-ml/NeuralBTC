"""
Train GRU price model and MinMaxScaler, save to models/.
Run once: python train_model.py
"""
import os
import numpy as np
import pandas as pd
import requests
import joblib
import tensorflow as tf
from sklearn.preprocessing import MinMaxScaler

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "models")
MODEL_PATH = os.path.join(MODEL_DIR, "final_model.keras")
SCALER_PATH = os.path.join(MODEL_DIR, "scaler.pkl")

WINDOW_SIZE = 168
FEATURES = [
    "close", "log_volume", "returns", "volatility_24h", "ma_24", "ma_168",
    "hour_sin", "hour_cos", "dow_sin", "dow_cos",
]


def fetch_history(limit=1000):
    url = "https://api.binance.com/api/v3/klines"
    params = {"symbol": "BTCUSDT", "interval": "1h", "limit": limit}
    resp = requests.get(url, params=params, timeout=15)
    resp.raise_for_status()
    df = pd.DataFrame(resp.json(), columns=[
        "timestamp", "open", "high", "low", "close",
        "volume", "close_time", "quote_vol", "trades",
        "taker_base", "taker_quote", "ignore",
    ])
    df["timestamp"] = pd.to_datetime(df["timestamp"], unit="ms")
    df["close"] = df["close"].astype(float)
    df["volume"] = df["volume"].astype(float)
    return df


def engineer_features(df):
    df = df.copy()
    df["log_volume"] = np.log1p(df["volume"])
    df["returns"] = df["close"].pct_change()
    df["volatility_24h"] = df["returns"].rolling(24).std()
    df["ma_24"] = df["close"].rolling(24).mean()
    df["ma_168"] = df["close"].rolling(168).mean()
    df["hour_sin"] = np.sin(2 * np.pi * df["timestamp"].dt.hour / 24)
    df["hour_cos"] = np.cos(2 * np.pi * df["timestamp"].dt.hour / 24)
    df["dow_sin"] = np.sin(2 * np.pi * df["timestamp"].dt.dayofweek / 7)
    df["dow_cos"] = np.cos(2 * np.pi * df["timestamp"].dt.dayofweek / 7)
    return df.dropna()


def build_sequences(df, scaler):
    data = scaler.transform(df[FEATURES].values)
    X, y = [], []
    for i in range(WINDOW_SIZE, len(data)):
        X.append(data[i - WINDOW_SIZE:i])
        y.append(data[i, 0])  # scaled close at t+1
    return np.array(X), np.array(y)


def build_model():
    model = tf.keras.Sequential([
        tf.keras.layers.Input(shape=(WINDOW_SIZE, len(FEATURES))),
        tf.keras.layers.GRU(64, return_sequences=True),
        tf.keras.layers.Dropout(0.2),
        tf.keras.layers.GRU(32),
        tf.keras.layers.Dropout(0.2),
        tf.keras.layers.Dense(16, activation="relu"),
        tf.keras.layers.Dense(1),
    ])
    model.compile(optimizer="adam", loss="mse")
    return model


def main():
    os.makedirs(MODEL_DIR, exist_ok=True)

    print("Fetching Binance history...")
    df = engineer_features(fetch_history(1000))
    print(f"Training rows: {len(df)}")

    scaler = MinMaxScaler()
    scaler.fit(df[FEATURES].values)

    X, y = build_sequences(df, scaler)
    print(f"Sequences: {X.shape}, targets: {y.shape}")

    split = int(len(X) * 0.85)
    X_train, X_val = X[:split], X[split:]
    y_train, y_val = y[:split], y[split:]

    model = build_model()
    model.fit(
        X_train, y_train,
        validation_data=(X_val, y_val),
        epochs=15,
        batch_size=32,
        verbose=1,
    )

    joblib.dump(scaler, SCALER_PATH)
    model.save(MODEL_PATH)
    print(f"Saved scaler -> {SCALER_PATH}")
    print(f"Saved model  -> {MODEL_PATH}")


if __name__ == "__main__":
    main()
