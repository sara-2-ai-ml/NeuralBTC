"use client"

import { Sparkles, Radio, Bot } from "lucide-react"

const steps = [
  {
    icon: Sparkles,
    title: "GRU Model",
    description: "Deep learning model predicts BTC price 1 hour ahead using 7-day historical data window",
    color: "text-[#F0B90B]",
    bg: "bg-[#F0B90B]/20",
  },
  {
    icon: Radio,
    title: "3 Agents Analyze",
    description: "Price prediction, news sentiment, and technical indicators are analyzed independently",
    color: "text-[#00ff88]",
    bg: "bg-[#00ff88]/20",
  },
  {
    icon: Bot,
    title: "AI Orchestrator",
    description: "LLM synthesizes all signals to make a final unified BUY/SELL/HOLD decision",
    color: "text-[#ff4444]",
    bg: "bg-[#ff4444]/20",
  },
]

export function HowItWorks() {
  return (
    <section id="about" className="py-16">
      <div className="container mx-auto px-4">
        <h3 className="text-2xl font-bold text-foreground mb-8 text-center">How It Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div 
              key={index}
              className="text-center group"
            >
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${step.bg} mb-4 transition-all duration-300 group-hover:scale-110`}>
                <step.icon className={`h-8 w-8 ${step.color}`} />
              </div>
              <div className="text-sm text-muted-foreground mb-2">Step {index + 1}</div>
              <h4 className="text-lg font-bold text-foreground mb-2">{step.title}</h4>
              <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
