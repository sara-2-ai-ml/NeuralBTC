"use client"

import { Brain, Newspaper, TrendingUp } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface GRUModelData {
  currentPrice: number
  predictedPrice: number
  expectedChange: number
  model: string
  accuracy: number
  status: "BULLISH" | "BEARISH" | "NEUTRAL"
}

interface NewsSentimentData {
  sentiment: "BULLISH" | "BEARISH" | "NEUTRAL"
  score: number
  confidence: "HIGH" | "MEDIUM" | "LOW"
  themes: string[]
  summary: string
}

interface TechnicalAnalysisData {
  rsi: { value: number; signal: "BULLISH" | "BEARISH" | "NEUTRAL" }
  macd: { value: number; signal: "BULLISH" | "BEARISH" | "NEUTRAL" }
  bollinger: { position: string; signal: "BULLISH" | "BEARISH" | "NEUTRAL" }
  buySignals: number
  sellSignals: number
  overall: "BUY" | "SELL" | "HOLD"
}

interface AgentSignalsProps {
  gruModel: GRUModelData
  newsSentiment: NewsSentimentData
  technicalAnalysis: TechnicalAnalysisData
}

function SignalBadge({ signal }: { signal: "BULLISH" | "BEARISH" | "NEUTRAL" | "BUY" | "SELL" | "HOLD" }) {
  const styles = {
    BULLISH: "bg-[#00ff88]/20 text-[#00ff88] glow-green",
    BUY: "bg-[#00ff88]/20 text-[#00ff88] glow-green",
    BEARISH: "bg-[#ff4444]/20 text-[#ff4444] glow-red",
    SELL: "bg-[#ff4444]/20 text-[#ff4444] glow-red",
    NEUTRAL: "bg-[#ffff00]/20 text-[#ffff00] glow-yellow",
    HOLD: "bg-[#ffff00]/20 text-[#ffff00] glow-yellow",
  }
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${styles[signal]}`}>
      {signal}
    </span>
  )
}

export function AgentSignals({ gruModel, newsSentiment, technicalAnalysis }: AgentSignalsProps) {
  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <h3 className="text-2xl font-bold text-foreground mb-6">Agent Signals</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* GRU Price Model */}
          <div className="bg-card border border-border rounded-xl p-6 glow-red transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-[#ff4444]/20">
                <Brain className="h-6 w-6 text-[#ff4444]" />
              </div>
              <div>
                <h4 className="font-bold text-foreground">GRU Price Model</h4>
                <p className="text-sm text-muted-foreground">Deep Learning Forecast</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Price</span>
                <span className="font-mono text-foreground">${gruModel.currentPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Predicted t+1h</span>
                <span className="font-mono text-[#ff4444]">${gruModel.predictedPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Expected change</span>
                <span className="font-mono text-[#ff4444]">{gruModel.expectedChange}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Model</span>
                <span className="text-sm text-foreground">{gruModel.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Accuracy</span>
                <span className="font-mono text-[#00ff88]">{gruModel.accuracy}%</span>
              </div>
              <div className="pt-2 border-t border-border flex justify-between items-center">
                <span className="text-muted-foreground">Status</span>
                <SignalBadge signal={gruModel.status} />
              </div>
            </div>
          </div>

          {/* News Sentiment Agent */}
          <div className="bg-card border border-border rounded-xl p-6 glow-green transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-[#00ff88]/20">
                <Newspaper className="h-6 w-6 text-[#00ff88]" />
              </div>
              <div>
                <h4 className="font-bold text-foreground">News Sentiment Agent</h4>
                <p className="text-sm text-muted-foreground">NLP Market Intelligence</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Sentiment</span>
                <SignalBadge signal={newsSentiment.sentiment} />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-muted-foreground">Score</span>
                  <span className="font-mono text-[#00ff88]">+{newsSentiment.score} / 1.0</span>
                </div>
                <Progress value={newsSentiment.score * 100} className="h-2 bg-secondary [&>div]:bg-[#00ff88]" />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Confidence</span>
                <span className="text-foreground font-medium">{newsSentiment.confidence}</span>
              </div>
              <div>
                <span className="text-muted-foreground text-sm">Key themes:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {newsSentiment.themes.map((theme, i) => (
                    <span key={i} className="text-xs bg-secondary px-2 py-1 rounded text-foreground">
                      {theme}
                    </span>
                  ))}
                </div>
              </div>
              <div className="pt-2 border-t border-border">
                <p className="text-sm text-muted-foreground italic">{`"${newsSentiment.summary}"`}</p>
              </div>
            </div>
          </div>

          {/* Technical Analysis Agent */}
          <div className="bg-card border border-border rounded-xl p-6 glow-red transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-[#ff4444]/20">
                <TrendingUp className="h-6 w-6 text-[#ff4444]" />
              </div>
              <div>
                <h4 className="font-bold text-foreground">Technical Analysis Agent</h4>
                <p className="text-sm text-muted-foreground">Market Indicators</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">RSI (14)</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-foreground">{technicalAnalysis.rsi.value}</span>
                  <SignalBadge signal={technicalAnalysis.rsi.signal} />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">MACD</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-foreground">{technicalAnalysis.macd.value}</span>
                  <SignalBadge signal={technicalAnalysis.macd.signal} />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Bollinger</span>
                <span className="text-sm text-[#ff4444]">{technicalAnalysis.bollinger.position}</span>
              </div>
              <div className="pt-2 border-t border-border space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Buy signals</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-foreground">{technicalAnalysis.buySignals}/3</span>
                    <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#00ff88]" 
                        style={{ width: `${(technicalAnalysis.buySignals / 3) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sell signals</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-foreground">{technicalAnalysis.sellSignals}/3</span>
                    <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#ff4444]" 
                        style={{ width: `${(technicalAnalysis.sellSignals / 3) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-border flex justify-between items-center">
                <span className="text-muted-foreground">Overall</span>
                <SignalBadge signal={technicalAnalysis.overall} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
