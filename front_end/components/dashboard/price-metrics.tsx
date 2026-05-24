"use client"

import { ArrowDown, TrendingDown } from "lucide-react"

interface PriceMetricsProps {
  currentPrice: number
  predictedPrice: number
  changePercent: number
  direction: "UP" | "DOWN" | "NEUTRAL"
}

export function PriceMetrics({ 
  currentPrice, 
  predictedPrice, 
  changePercent, 
  direction 
}: PriceMetricsProps) {
  const metrics = [
    {
      label: "Current Price",
      value: `$${currentPrice.toLocaleString()}`,
      glowClass: "glow-white",
      textClass: "text-foreground",
    },
    {
      label: "Predicted t+1h",
      value: `$${predictedPrice.toLocaleString()}`,
      icon: <ArrowDown className="h-5 w-5" />,
      glowClass: "glow-red",
      textClass: "text-[#ff4444]",
    },
    {
      label: "Change",
      value: `${changePercent}%`,
      glowClass: "glow-red",
      textClass: "text-[#ff4444]",
      animate: true,
    },
    {
      label: "Direction",
      value: direction,
      icon: <TrendingDown className="h-5 w-5" />,
      glowClass: "glow-red",
      textClass: "text-[#ff4444]",
      badge: true,
    },
  ]

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className={`bg-card border border-border rounded-xl p-6 ${metric.glowClass} transition-all duration-300 hover:scale-105`}
            >
              <p className="text-sm text-muted-foreground mb-2">{metric.label}</p>
              <div className={`flex items-center gap-2 ${metric.textClass}`}>
                {metric.badge ? (
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff4444]/20 text-[#ff4444] font-bold text-lg">
                    {metric.icon}
                    {metric.value}
                  </span>
                ) : (
                  <>
                    <span className={`text-2xl md:text-3xl font-bold font-mono ${metric.animate ? 'animate-pulse' : ''}`}>
                      {metric.value}
                    </span>
                    {metric.icon}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
