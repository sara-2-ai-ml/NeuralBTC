"use client"

import { useEffect, useRef, useState } from "react"
import { createChart, LineSeries, type UTCTimestamp } from "lightweight-charts"

const MUTED = "#9b9b9b"
const CARD = "#1a1a1a"
const GOLD = "#f7931a"
const GRID = "#2a2a2a"

const CHART_URL =
  "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=30"
const GLOBAL_URL = "https://api.coingecko.com/api/v3/global"

type CapPoint = [number, number]

function downsampleDaily(caps: CapPoint[]): CapPoint[] {
  const byDay = new Map<string, CapPoint>()
  for (const [ts, cap] of caps) {
    const day = new Date(ts).toISOString().slice(0, 10)
    byDay.set(day, [ts, cap])
  }
  return Array.from(byDay.values()).sort((a, b) => a[0] - b[0])
}

function buildDominanceSeries(
  caps: CapPoint[],
  totalMarketCap: number,
): { time: UTCTimestamp; value: number }[] {
  if (!caps.length || totalMarketCap <= 0) return []

  const btcNow = caps[caps.length - 1][1]
  const otherCap = Math.max(totalMarketCap - btcNow, 0)

  const points = downsampleDaily(caps).map(([ts, btc]) => {
    const total = btc + otherCap
    const pct = total > 0 ? (btc / total) * 100 : 0
    return {
      time: Math.floor(ts / 1000) as UTCTimestamp,
      value: Math.round(pct * 10) / 10,
    }
  })

  const unique = new Map<number, { time: UTCTimestamp; value: number }>()
  for (const p of points) unique.set(p.time as number, p)
  return Array.from(unique.values()).sort((a, b) => (a.time as number) - (b.time as number))
}

export function BTCDominanceWidget() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentPct, setCurrentPct] = useState(0)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const chart = createChart(container, {
      width: container.clientWidth || 300,
      height: 180,
      layout: { background: { color: CARD }, textColor: MUTED },
      grid: { vertLines: { color: GRID }, horzLines: { color: GRID } },
      rightPriceScale: { borderColor: GRID },
      timeScale: { borderColor: GRID, timeVisible: true, secondsVisible: false },
      crosshair: { vertLine: { color: GRID }, horzLine: { color: GRID } },
    })

    const series = chart.addSeries(LineSeries, {
      color: GOLD,
      lineWidth: 2,
      priceFormat: { type: "price", precision: 1, minMove: 0.1 },
    })

    const ro = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect
      if (width > 0) chart.applyOptions({ width, height: 180 })
    })
    ro.observe(container)

    async function fetchData() {
      try {
        const [chartRes, globalRes] = await Promise.all([
          fetch(CHART_URL),
          fetch(GLOBAL_URL),
        ])
        if (!chartRes.ok || !globalRes.ok) return

        const chartJson = await chartRes.json()
        const globalJson = await globalRes.json()

        if (chartJson.status?.error_code || globalJson.status?.error_code) return

        const caps: CapPoint[] = chartJson.market_caps ?? []
        const dom = globalJson.data?.market_cap_percentage?.btc ?? 0
        const totalCap = globalJson.data?.total_market_cap?.usd ?? 0
        const rounded = Math.round(dom * 10) / 10

        setCurrentPct(rounded)

        const seriesData = buildDominanceSeries(caps, totalCap)
        if (seriesData.length) {
          series.setData(seriesData)
          chart.timeScale().fitContent()
        }
      } catch {
        /* keep last values */
      }
    }

    fetchData()
    const id = setInterval(fetchData, 5 * 60 * 1000)

    return () => {
      clearInterval(id)
      ro.disconnect()
      chart.remove()
    }
  }, [])

  return (
    <div
      style={{
        background: CARD,
        borderRadius: 12,
        padding: 24,
        height: "100%",
        minHeight: 280,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 8,
        }}
      >
        <p style={{ color: MUTED, fontSize: 13, margin: 0 }}>BTC Dominance</p>
        <span
          style={{
            color: GOLD,
            fontSize: 18,
            fontWeight: 800,
            fontFamily: "monospace",
          }}
        >
          {currentPct.toFixed(1)}%
        </span>
      </div>

      <div ref={containerRef} style={{ height: 180, width: "100%" }} />
    </div>
  )
}
