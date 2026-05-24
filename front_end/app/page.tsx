"use client"

import { useState } from "react"
import { Header } from "@/components/dashboard/header"
import { Hero } from "@/components/dashboard/hero"
import { PriceMetrics } from "@/components/dashboard/price-metrics"
import { BTCChart } from "@/components/BTCChart"
import { FearGreedWidget } from "@/components/dashboard/FearGreedWidget"
import { BTCDominanceWidget } from "@/components/dashboard/BTCDominanceWidget"
import { AgentSignals } from "@/components/dashboard/agent-signals"
import { FinalDecision } from "@/components/dashboard/final-decision"
import { HowItWorks } from "@/components/dashboard/how-it-works"
import { TechnicalDetails } from "@/components/dashboard/technical-details"
import { Footer } from "@/components/dashboard/footer"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"

const initialData = {
  currentPrice: 0,
  predictedPrice: 0,
  changePercent: 0,
  direction: "DOWN" as const,
  lastUpdated: "Click Run Analysis to load data",
  gruModel: {
    currentPrice: 0,
    predictedPrice: 0,
    expectedChange: 0,
    model: "GRU Neural Network (24h window)",
    accuracy: 99.70,
    status: "BEARISH" as const,
  },
  newsSentiment: {
    sentiment: "NEUTRAL" as const,
    score: 0,
    confidence: "MEDIUM" as const,
    themes: [],
    summary: "Run analysis to load sentiment",
  },
  technicalAnalysis: {
    rsi: { value: 0, signal: "NEUTRAL" as const },
    macd: { value: 0, signal: "BEARISH" as const },
    bollinger: { position: "—", signal: "BEARISH" as const },
    buySignals: 0,
    sellSignals: 0,
    overall: "HOLD" as const,
  },
  finalDecision: {
    decision: "HOLD" as const,
    confidence: 0,
    riskLevel: "MEDIUM" as const,
    reasoning: "Run analysis to get AI decision",
    warning: "",
  },
  technicalDetails: {
    bollingerUpper: 0,
    bollingerLower: 0,
    bbSignal: "—",
    buySignals: 0,
    sellSignals: 0,
    holdSignals: 0,
    modelWindow: "24h",
    features: 12,
  },
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [dashboardData, setDashboardData] = useState(initialData)
  const [error, setError] = useState<string | null>(null)

  const handleRunAnalysis = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE}/api/analyze`)
      if (!response.ok) throw new Error(`API error: ${response.status}`)
      const data = await response.json()
      setDashboardData(data)
    } catch (err) {
      setError("Failed to connect to API. Make sure the backend is running.")
      console.error('Error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen gradient-bg">
      <Header />
      <Hero onRunAnalysis={handleRunAnalysis} isLoading={isLoading} />

      {error && (
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      )}

      <HowItWorks />

      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <button
          onClick={handleRunAnalysis}
          disabled={isLoading}
          style={{
            background: "#ffffff",
            color: "#000000",
            fontWeight: 600,
            fontSize: 15,
            padding: "12px 28px",
            borderRadius: 4,
            border: "1px solid rgba(255,255,255,0.3)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            cursor: isLoading ? "not-allowed" : "pointer",
            opacity: isLoading ? 0.85 : 1,
          }}
        >
          {isLoading ? "Analyzing..." : "Run Analysis"}
        </button>
      </div>

      <PriceMetrics
        currentPrice={dashboardData.currentPrice}
        predictedPrice={dashboardData.predictedPrice}
        changePercent={dashboardData.changePercent}
        direction={dashboardData.direction}
      />

      <BTCChart />

      <AgentSignals
        gruModel={dashboardData.gruModel}
        newsSentiment={dashboardData.newsSentiment}
        technicalAnalysis={dashboardData.technicalAnalysis}
      />

      <div
        className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-4"
        style={{ marginTop: 24, marginBottom: 24 }}
      >
        <FearGreedWidget />
        <BTCDominanceWidget />
      </div>

      <FinalDecision {...dashboardData.finalDecision} />
      <TechnicalDetails {...dashboardData.technicalDetails} />
      <Footer />
    </main>
  )
}