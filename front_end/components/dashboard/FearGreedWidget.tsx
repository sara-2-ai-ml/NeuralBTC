"use client"

import { useEffect, useState } from "react"

const MUTED = "#9b9b9b"
const CARD = "#1a1a1a"

const ZONES = [
  { max: 25, color: "#ef5350", label: "Extreme Fear" },
  { max: 45, color: "#ff7043", label: "Fear" },
  { max: 55, color: "#f7931a", label: "Neutral" },
  { max: 75, color: "#66bb6a", label: "Greed" },
  { max: 100, color: "#26a69a", label: "Extreme Greed" },
]

const CX = 100
const CY = 100
const R = 72
const STROKE = 14

function polar(deg: number) {
  const rad = (deg * Math.PI) / 180
  return {
    x: CX + R * Math.cos(rad),
    y: CY - R * Math.sin(rad),
  }
}

function arcPath(startDeg: number, endDeg: number) {
  const start = polar(startDeg)
  const end = polar(endDeg)
  const sweep = startDeg - endDeg
  const large = sweep > 180 ? 1 : 0
  return `M ${start.x} ${start.y} A ${R} ${R} 0 ${large} 1 ${end.x} ${end.y}`
}

function zoneColor(value: number) {
  for (const z of ZONES) {
    if (value <= z.max) return z.color
  }
  return ZONES[ZONES.length - 1].color
}

function zoneArcs() {
  const paths: { d: string; color: string }[] = []
  let prev = 0
  for (const z of ZONES) {
    const startDeg = 180 - (prev / 100) * 180
    const endDeg = 180 - (z.max / 100) * 180
    paths.push({ d: arcPath(startDeg, endDeg), color: z.color })
    prev = z.max
  }
  return paths
}

function needleTip(value: number) {
  const angle = 180 - (value / 100) * 180
  const rad = (angle * Math.PI) / 180
  const len = R - 12
  return {
    x: CX + len * Math.cos(rad),
    y: CY - len * Math.sin(rad),
  }
}

export function FearGreedWidget() {
  const [value, setValue] = useState(0)
  const [classification, setClassification] = useState("—")

  useEffect(() => {
    async function fetchFng() {
      try {
        const res = await fetch("https://api.alternative.me/fng/")
        if (!res.ok) return
        const json = await res.json()
        const item = json.data?.[0]
        if (item) {
          setValue(Number(item.value) || 0)
          setClassification(item.value_classification ?? "—")
        }
      } catch {
        /* keep last values */
      }
    }

    fetchFng()
    const id = setInterval(fetchFng, 5 * 60 * 1000)
    return () => clearInterval(id)
  }, [])

  const arcs = zoneArcs()
  const tip = needleTip(value)
  const color = zoneColor(value)

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
      <p
        style={{
          color: MUTED,
          fontSize: 13,
          margin: 0,
          marginBottom: 8,
          textAlign: "left",
        }}
      >
        Fear &amp; Greed Index
      </p>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          viewBox="0 0 200 120"
          width="100%"
          style={{ maxWidth: 280, display: "block" }}
          aria-hidden
        >
          {arcs.map((a, i) => (
            <path
              key={i}
              d={a.d}
              fill="none"
              stroke={a.color}
              strokeWidth={STROKE}
              strokeLinecap="butt"
            />
          ))}

          <line
            x1={CX}
            y1={CY}
            x2={tip.x}
            y2={tip.y}
            stroke="#ffffff"
            strokeWidth={2.5}
            strokeLinecap="round"
          />
          <circle cx={CX} cy={CY} r={5} fill="#ffffff" />
        </svg>

        <p
          style={{
            color,
            fontSize: 36,
            fontWeight: 800,
            fontFamily: "monospace",
            margin: "4px 0 0",
            lineHeight: 1,
          }}
        >
          {value}
        </p>
        <p
          style={{
            color,
            fontSize: 14,
            margin: "8px 0 0",
            fontWeight: 500,
          }}
        >
          {classification}
        </p>
      </div>
    </div>
  )
}
