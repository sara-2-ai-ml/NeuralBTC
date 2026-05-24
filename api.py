import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from agents.orchestrator import run_orchestrator
from agents.price_agent import run_price_agent
from datetime import datetime, timezone
import requests as _requests

app = FastAPI(title="BTC Multi-Agent API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok", "message": "BTC Agent API running"}


@app.get("/api/candles")
def candles():
    try:
        url = "https://api.binance.com/api/v3/klines"
        params = {"symbol": "BTCUSDT", "interval": "1h", "limit": 200}
        resp = _requests.get(url, params=params, timeout=10)
        resp.raise_for_status()
        raw = resp.json()
        return [
            {
                "time":   int(row[0]) // 1000,
                "open":   float(row[1]),
                "high":   float(row[2]),
                "low":    float(row[3]),
                "close":  float(row[4]),
                "volume": float(row[5]),
            }
            for row in raw
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/prediction")
def prediction():
    try:
        result = run_price_agent()
        ts = datetime.fromisoformat(result["timestamp"])
        if ts.tzinfo is None:
            ts = ts.replace(tzinfo=timezone.utc)
        last_candle_time = int(ts.timestamp())
        return {
            "time":  last_candle_time + 3600,
            "value": result["predicted_price"],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/analyze")
def analyze():
    try:
        result = run_orchestrator()

        confidence_raw = result['decision']['confidence']
        if isinstance(confidence_raw, str):
            confidence = int(
                confidence_raw.replace('%', '').strip()
            )
        else:
            confidence = int(confidence_raw)

        return {
            "currentPrice":   result['price']['current_price'],
            "predictedPrice": result['price']['predicted_price'],
            "changePercent":  result['price']['change_pct'],
            "direction":      result['price']['direction'],
            "lastUpdated":    result['price']['timestamp'],

            "gruModel": {
                "currentPrice":   result['price']['current_price'],
                "predictedPrice": result['price']['predicted_price'],
                "expectedChange": result['price']['change_pct'],
                "model":          "GRU Neural Network (24h window)",
                "accuracy":       99.70,
                "status": "BEARISH"
                          if result['price']['change_pct'] < 0
                          else "BULLISH"
            },

            "newsSentiment": {
                "sentiment":  result['news']['sentiment'],
                "score":      result['news']['score'],
                "confidence": result['news']['confidence'],
                "themes":     result['news']['themes'],
                "summary":    result['news']['summary']
            },

            "technicalAnalysis": {
                "rsi": {
                    "value":  result['technical']['rsi'],
                    "signal": result['technical']['rsi_signal']
                },
                "macd": {
                    "value":  result['technical']['macd'],
                    "signal": result['technical']['macd_signal']
                },
                "bollinger": {
                    "position": result['technical']['bb_signal'],
                    "signal":   result['technical']['macd_signal']
                },
                "buySignals":  result['technical']['buy_signals'],
                "sellSignals": result['technical']['sell_signals'],
                "overall":     result['technical']['overall']
            },

            "finalDecision": {
                "decision":   result['decision']['decision'],
                "confidence": confidence,
                "riskLevel":  result['decision']['risk'],
                "reasoning":  result['decision']['reasoning'],
                "warning":    result['decision']['warnings']
            },

            "technicalDetails": {
                "bollingerUpper": result['technical']['bb_upper'],
                "bollingerLower": result['technical']['bb_lower'],
                "bbSignal":       result['technical']['bb_signal'],
                "buySignals":     result['technical']['buy_signals'],
                "sellSignals":    result['technical']['sell_signals'],
                "holdSignals":    result['technical']['hold_signals'],
                "modelWindow":    "24h",
                "features":       12
            }
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )