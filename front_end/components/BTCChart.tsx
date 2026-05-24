"use client"

import { useEffect, useRef, useState } from "react"
import {
  createChart,
  CrosshairMode,
  LineStyle,
  CandlestickSeries,
  HistogramSeries,
  LineSeries,
  createTextWatermark,
} from "lightweight-charts"

// ─── Types ───────────────────────────────────────────────────────────────────

interface Candle {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface Prediction {
  time: number
  value: number
}

// ─── Constants ────────────────────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
const BG         = "#0d0d0d"
const GRID       = "#1a1a1a"
const TEXT       = "#9b9b9b"
const UP         = "#26a69a"
const DOWN       = "#ef5350"
const RSI_COLOR  = "#7b68ee"
const SIG_COLOR  = "#ff6b6b"

// ─── Indicator helpers ────────────────────────────────────────────────────────

function calcRSI(closes: number[], times: number[], period = 14) {
  if (closes.length < period + 1) return []
  let avgGain = 0
  let avgLoss = 0
  for (let i = 1; i <= period; i++) {
    const d = closes[i] - closes[i - 1]
    if (d > 0) avgGain += d; else avgLoss -= d
  }
  avgGain /= period
  avgLoss /= period
  const out: { time: number; value: number }[] = []
  out.push({
    time: times[period],
    value: avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss),
  })
  for (let i = period + 1; i < closes.length; i++) {
    const d = closes[i] - closes[i - 1]
    avgGain = (avgGain * (period - 1) + (d > 0 ? d : 0)) / period
    avgLoss = (avgLoss * (period - 1) + (d < 0 ? -d : 0)) / period
    out.push({
      time: times[i],
      value: avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss),
    })
  }
  return out
}

function emaArr(data: number[], period: number) {
  const k = 2 / (period + 1)
  const out = [data[0]]
  for (let i = 1; i < data.length; i++) out.push(data[i] * k + out[i - 1] * (1 - k))
  return out
}

function calcMACD(closes: number[], times: number[], fast = 12, slow = 26, sig = 9) {
  if (closes.length < slow + sig) return { hist: [] as any[], signal: [] as any[] }
  const ef = emaArr(closes, fast)
  const es = emaArr(closes, slow)
  const macdLine = closes.map((_, i) => ef[i] - es[i])
  const sigLine  = emaArr(macdLine.slice(slow - 1), sig)
  const hist: { time: number; value: number; color: string }[] = []
  const signal: { time: number; value: number }[] = []
  for (let i = sig - 1; i < sigLine.length; i++) {
    const t = times[slow - 1 + i]
    const h = macdLine[slow - 1 + i] - sigLine[i]
    hist.push({ time: t, value: h, color: h >= 0 ? UP : DOWN })
    signal.push({ time: t, value: sigLine[i] })
  }
  return { hist, signal }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BTCChart() {
  const containerRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const seriesRef = useRef<{
    candle: any; vol: any; rsi: any; macdHist: any; macdSig: any; predLine: any
  } | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chartRef = useRef<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // ── Create chart ──────────────────────────────────────────────────────────
    const chart = createChart(containerRef.current, {
      autoSize: true,
      layout: { background: { color: BG }, textColor: TEXT },
      grid: { vertLines: { color: GRID }, horzLines: { color: GRID } },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { borderColor: GRID },
      timeScale: { borderColor: GRID, timeVisible: true, secondsVisible: false },
    })
    chartRef.current = chart

    // ── Add panes 1-3 (pane 0 already exists) ────────────────────────────────
    const pane1 = chart.addPane()
    const pane2 = chart.addPane()
    const pane3 = chart.addPane()

    // Heights: 60 / 15 / 12 / 13 of ~575 usable px (600 minus time scale)
    chart.panes()[0].setHeight(345)
    pane1.setHeight(86)
    pane2.setHeight(69)
    pane3.setHeight(75)

    // ── Pane 0 — Candlestick ──────────────────────────────────────────────────
    const candleSeries = chart.addSeries(
      CandlestickSeries,
      {
        upColor: UP, downColor: DOWN,
        borderUpColor: UP, borderDownColor: DOWN,
        wickUpColor: UP, wickDownColor: DOWN,
        priceFormat: { type: "price", precision: 0, minMove: 1 },
      },
      0,
    )

    // ── Pane 1 — Volume ───────────────────────────────────────────────────────
    const volSeries = chart.addSeries(
      HistogramSeries,
      { priceFormat: { type: "volume" } },
      1,
    )
    chart.priceScale("right", 1).applyOptions({ scaleMargins: { top: 0.1, bottom: 0 } })

    // ── Pane 2 — RSI ──────────────────────────────────────────────────────────
    const rsiSeries = chart.addSeries(
      LineSeries,
      { color: RSI_COLOR, lineWidth: 1 },
      2,
    )
    chart.priceScale("right", 2).applyOptions({ scaleMargins: { top: 0.1, bottom: 0.1 } })
    rsiSeries.createPriceLine({
      price: 70, color: DOWN, lineWidth: 1,
      lineStyle: LineStyle.Dashed, axisLabelVisible: false, title: "",
    })
    rsiSeries.createPriceLine({
      price: 30, color: UP, lineWidth: 1,
      lineStyle: LineStyle.Dashed, axisLabelVisible: false, title: "",
    })
    createTextWatermark(pane2, {
      horzAlign: "left", vertAlign: "top",
      lines: [{ text: "RSI", color: TEXT, fontSize: 11, fontStyle: "normal" }],
    })

    // ── Pane 3 — MACD ─────────────────────────────────────────────────────────
    const macdHistSeries = chart.addSeries(HistogramSeries, {}, 3)
    const macdSigSeries  = chart.addSeries(
      LineSeries,
      { color: SIG_COLOR, lineWidth: 1 },
      3,
    )
    chart.priceScale("right", 3).applyOptions({ scaleMargins: { top: 0.15, bottom: 0.15 } })
    createTextWatermark(pane3, {
      horzAlign: "left", vertAlign: "top",
      lines: [{ text: "MACD", color: TEXT, fontSize: 11, fontStyle: "normal" }],
    })

    seriesRef.current = {
      candle: candleSeries, vol: volSeries,
      rsi: rsiSeries, macdHist: macdHistSeries,
      macdSig: macdSigSeries, predLine: null,
    }

    // ── Fetch & update ────────────────────────────────────────────────────────
    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        const [candleRes, predRes] = await Promise.all([
          fetch(`${API_BASE}/api/candles`),
          fetch(`${API_BASE}/api/prediction`).catch(() => null),
        ])
        if (!candleRes.ok) throw new Error(`Candles API returned ${candleRes.status}`)
        const candles: Candle[]        = await candleRes.json()
        const pred: Prediction | null  = predRes?.ok ? await predRes.json() : null

        const s = seriesRef.current
        if (!s) return

        const closes = candles.map((c) => c.close)
        const times  = candles.map((c) => c.time)

        s.candle.setData(
          candles.map(({ time, open, high, low, close }) => ({ time, open, high, low, close })),
        )

        s.vol.setData(
          candles.map(({ time, volume, open, close }) => ({
            time, value: volume, color: close >= open ? UP : DOWN,
          })),
        )

        s.rsi.setData(calcRSI(closes, times))

        const { hist, signal } = calcMACD(closes, times)
        s.macdHist.setData(hist)
        s.macdSig.setData(signal)

        if (pred) {
          if (s.predLine) s.candle.removePriceLine(s.predLine)
          const label = `$${Math.round(pred.value).toLocaleString("en-US")}`
          s.predLine = s.candle.createPriceLine({
            price: pred.value,
            color: "orange",
            lineWidth: 1,
            lineStyle: LineStyle.Dashed,
            axisLabelVisible: true,
            title: label,
          })
        }

        chart.timeScale().fitContent()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 60_000)

    return () => {
      clearInterval(interval)
      chart.remove()
    }
  }, [])

  return (
    <section className="max-w-7xl mx-auto px-4 py-4">
      <div
        className="rounded-xl overflow-hidden border border-[#1a1a1a]"
        style={{ background: BG }}
      >
        {/* Header bar */}
        <div className="px-4 py-3 border-b border-[#1a1a1a] flex items-center justify-between">
          <span className="text-sm font-semibold" style={{ color: TEXT }}>
            BTC / USDT &mdash; 1H
          </span>
          <div className="flex gap-5 text-xs" style={{ color: TEXT }}>
            <span>
              <span style={{ color: UP }}>■</span> Bullish
            </span>
            <span>
              <span style={{ color: DOWN }}>■</span> Bearish
            </span>
            <span>
              <span style={{ color: "orange" }}>- -</span> GRU Prediction
            </span>
          </div>
        </div>

        {/* Chart area */}
        <div className="relative" style={{ height: 600 }}>
          {/* Loading overlay */}
          {loading && (
            <div
              className="absolute inset-0 z-10 flex items-center justify-center"
              style={{ background: `${BG}cc` }}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-[#F0B90B] border-t-transparent rounded-full animate-spin" />
                <span className="text-xs" style={{ color: TEXT }}>
                  Loading chart…
                </span>
              </div>
            </div>
          )}

          {/* Error overlay */}
          {error && !loading && (
            <div
              className="absolute inset-0 z-10 flex items-center justify-center"
              style={{ background: `${BG}cc` }}
            >
              <div className="text-center px-6">
                <p className="text-red-400 text-sm font-medium">⚠ {error}</p>
                <p className="text-xs mt-1" style={{ color: TEXT }}>
                  Make sure the backend is running on port 8000
                </p>
              </div>
            </div>
          )}

          {/* Chart container — autoSize matches this div */}
          <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
        </div>
      </div>
    </section>
  )
}
