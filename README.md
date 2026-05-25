# NeuralBTC — Multi-Agent AI System for Real-Time Bitcoin Forecasting

> Three independent agents. One unified decision.

**NeuralBTC** is a production-grade, full-stack Bitcoin forecasting system that combines deep learning price prediction, NLP-based news sentiment analysis, and real-time technical analysis into a single, unified trading signal.

---

## Live Demo

Deploy link: https://neural-btc-sj2z.vercel.app/

---
## Screenshots

![Hero](Screenshot 2026-05-25 015733.png)
![How it works](Screenshot 2026-05-25 015748.png)
![Chart](Screenshot 2026-05-25 015807.png)
![Analysis](Screenshot 2026-05-25 015839.png)
![Decision](Screenshot 2026-05-25 015849.png)

## Training Notebook

The full model training pipeline is available in
 https://colab.research.google.com/drive/1BV4sp8s01M6wvDXR65AvvvNR0fVADX_u#scrollTo=I6b_v3NPVnYU

The notebook covers the complete journey from raw Binance data to a production-ready model:

- Data collection and preprocessing (55,457 hourly candles, Jan 2020 → Apr 2026)
- Feature engineering (12 engineered features including cyclical time encoding)
- Baseline GRU model achieving 98% accuracy
- Step-by-step improvements: RobustScaler, log-return target, MAPE-Huber loss
- Final model: **MAPE 0.30% — Accuracy 99.70% — MAE $276.93**
- Architecture experiments: GRU v2 with Residual Connections + MultiHeadAttention

## Overview

The system is built around a **multi-agent architecture** where three independent agents analyze the market from different perspectives, and an AI orchestrator (Claude Sonnet) synthesizes their signals into a final BUY / SELL / HOLD decision with confidence scoring and risk assessment.

```
┌─────────────────────────────────────────────────────┐
│                   NeuralBTC System                  │
├──────────────┬──────────────────┬───────────────────┤
│  Price Agent │   News Agent     │ Technical Agent   │
│  GRU Model   │   NLP Sentiment  │ RSI · MACD · BB   │
│  99.7% acc.  │   NewsAPI        │ Binance live data │
└──────┬───────┴────────┬─────────┴──────────┬────────┘
       │                │                    │
       └────────────────┼────────────────────┘
                        │
              ┌─────────▼──────────┐
              │  Claude Sonnet     │
              │  AI Orchestrator   │
              │  BUY / SELL / HOLD │
              └────────────────────┘
```

---

## Model Performance

The GRU forecasting model was trained on **55,457 hourly OHLCV candles** from Binance (January 2020 → April 2026).

| Metric | Value |
|--------|-------|
| MAPE | **0.30%** |
| Accuracy | **99.70%** |
| MAE (USD) | **$276.93** |
| Test MSE | 0.000507 |
| Price range tested | $62,900 → $126,011 |

### Training Pipeline

The model went through a rigorous engineering process across multiple phases:

**Phase 1 — Data Engineering**
- Source: Binance Public API (`BTCUSDT`, `1h` interval)
- Period: January 2020 → April 2026
- Total rows: 55,457 hourly candles
- 12 engineered features: `close`, `log_volume`, `returns`, `volatility_24h`, `ma_24`, `ma_168`, `price_vs_ma168`, `volume_vs_ma`, `hour_sin`, `hour_cos`, `dow_sin`, `dow_cos`

**Phase 2 — Preprocessing**
- `RobustScaler` for price features — handles outliers from crypto volatility
- `StandardScaler` for momentum features
- Log-return target instead of raw price — removes non-stationarity
- Walk-forward train/validation/test split (no data leakage)

**Phase 3 — Architecture**

The baseline GRU model:
```
Input (24, 12)
→ GRU(128) → Dropout(0.3)
→ GRU(64)  → Dropout(0.3)
→ Dense(32, relu)
→ Dense(1)
```

**Phase 4 — Loss Function**

Custom MAPE-Huber hybrid loss function:
```python
loss = 0.6 * MAPE + 0.4 * Huber(delta=0.001)
```
This balances percentage accuracy with robustness to outliers — critical for crypto markets.

**Phase 5 — Results**

| Model | MAPE | MAE (USD) | Accuracy |
|-------|------|-----------|----------|
| Baseline GRU v1 | 2.00% | — | 98.00% |
| GRU + RobustScaler | 0.45% | — | 99.55% |
| GRU + Log-return target | 0.35% | — | 99.65% |
| GRU + MAPE-Huber loss | **0.30%** | **$276.93** | **99.70%** |

**Phase 6 — Architecture Experiments**

A GRU v2 with Residual Connections + MultiHeadAttention was tested:
- Residual connections: skip connections between GRU layers
- LayerNormalization after each GRU block
- MultiHeadAttention (4 heads, key_dim=16) over the 24h sequence
- Warmup + Cosine Decay learning rate schedule

Result: GRU v2 matched GRU v1 at 0.30% MAPE. With a 24h lookback window, the sequence is not long enough for attention to provide meaningful gains. The simpler model was retained for production.

---

## System Architecture

### Backend — Python / FastAPI

```
BTC_AGENT/
├── agents/
│   ├── price_agent.py       # GRU inference on live Binance data
│   ├── news_agent.py        # NLP sentiment from NewsAPI
│   ├── technical_agent.py   # RSI, MACD, Bollinger Bands
│   └── orchestrator.py      # Claude Sonnet decision synthesis
├── models/
│   ├── final_model.keras    # Trained GRU model
│   ├── scaler.pkl           # Fitted RobustScaler + StandardScaler
│   └── train_timestamps.npy # Training period timestamps
├── api.py                   # FastAPI endpoints
└── main.py
```

**API Endpoints:**

| Endpoint | Description |
|----------|-------------|
| `GET /health` | Health check |
| `GET /api/candles` | Last 200 hourly OHLCV candles from Binance |
| `GET /api/prediction` | GRU model inference — predicted price t+1h |
| `GET /api/analyze` | Full multi-agent analysis + Claude decision |

### Frontend — Next.js / TypeScript

```
front_end/
├── app/
│   └── page.tsx             # Main dashboard
├── components/
│   ├── BTCChart.tsx         # TradingView lightweight-charts
│   └── dashboard/
│       ├── agent-signals.tsx
│       ├── final-decision.tsx
│       ├── fear-greed-widget.tsx
│       ├── btc-dominance-widget.tsx
│       └── ...
```

**Charts — lightweight-charts (TradingView):**
- Candlestick chart with GRU prediction overlay
- Volume bars (green/red based on direction)
- RSI(14) panel with overbought/oversold zones
- MACD(12,26,9) histogram + signal line

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| ML Model | TensorFlow / Keras — GRU |
| Backend | Python, FastAPI, Uvicorn |
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Charts | lightweight-charts (TradingView) |
| Price Data | Binance Public API |
| News Sentiment | NewsAPI + NLP |
| Market Data | CoinGecko API (Fear & Greed, BTC Dominance) |
| AI Orchestrator | Claude Sonnet (Anthropic) |
| Deployment | Vercel (frontend), local/cloud (backend) |

---

## Installation

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm or pnpm

### Backend Setup

```bash
cd BTC_AGENT
pip install -r requirements.txt
```

Create a `.env` file:
```env
ANTHROPIC_API_KEY=your_anthropic_key
NEWS_API_KEY=your_newsapi_key
```

Start the backend:
```bash
uvicorn api:app --reload --port 8000
```

### Frontend Setup

```bash
cd BTC_AGENT/front_end
npm install
npm run dev
```

Open `http://localhost:3000`

---

## How It Works

**Step 1 — Price Agent**

Fetches the last 400 hourly candles from Binance, engineers 12 features, scales them using the fitted scaler, and runs inference through the GRU model. Returns predicted price for t+1h.

**Step 2 — News Agent**

Fetches recent Bitcoin-related news from NewsAPI, applies NLP sentiment analysis, and returns a sentiment score from -1 (bearish) to +1 (bullish) with key themes.

**Step 3 — Technical Agent**

Calculates RSI(14), MACD(12,26,9), and Bollinger Bands from live Binance data. Generates buy/sell/hold signals for each indicator.

**Step 4 — AI Orchestrator**

All three signals are passed to Claude Sonnet with a structured prompt. Claude synthesizes the signals, resolves conflicts, and returns a final decision with confidence %, risk level, and detailed reasoning.

---

## Key Design Decisions

**Why GRU over LSTM?**
With a 24h lookback window, GRU and LSTM perform equivalently. GRU has fewer parameters (~94K vs ~130K), trains 25% faster, and has lower overfitting risk. The simpler architecture generalizes better on financial time series.

**Why log-returns instead of raw price?**
Raw BTC prices are non-stationary — the model would overfit to the price level seen during training. Log-returns are stationary, scale-invariant, and directly interpretable as percentage changes.

**Why MAPE-Huber loss?**
Pure MSE penalizes large errors quadratically, which can destabilize training during high-volatility periods. Pure MAPE is undefined at zero. The hybrid loss combines percentage accuracy (MAPE) with robustness to outliers (Huber).

**Why Claude over smaller models for orchestration?**
The orchestrator needs to reason about conflicting signals — for example, a bullish price forecast but bearish technical indicators. Claude's reasoning quality produces coherent, nuanced decisions that smaller models fail to handle consistently.

---

## Disclaimer

This project is for educational and research purposes only. It does not constitute financial advice. Cryptocurrency markets are highly volatile and unpredictable. Never make investment decisions based solely on automated systems.

---

## Author

Built by Sara Resulaj — connecting deep learning, financial engineering, and modern full-stack development.

*If you found this project interesting, feel free to connect on LinkedIn.*

Not financial advice. Educational purposes only.
