"use client"

interface FinalDecisionProps {
  decision: "BUY" | "SELL" | "HOLD"
  confidence: number
  riskLevel: "LOW" | "MEDIUM" | "HIGH"
  reasoning: string
  warning?: string
}

export function FinalDecision({ 
  decision, 
  confidence, 
  riskLevel, 
  reasoning, 
  warning 
}: FinalDecisionProps) {
  const decisionStyles = {
    BUY:  { bg: "#26a69a", color: "#ffffff" },
    SELL: { bg: "#ef5350", color: "#ffffff" },
    HOLD: { bg: "#f7931a", color: "#000000" },
  }

  const riskStyles = {
    LOW:    { bg: "#26a69a22", color: "#26a69a" },
    MEDIUM: { bg: "#f7931a22", color: "#f7931a" },
    HIGH:   { bg: "#ef535022", color: "#ef5350" },
  }

  const ds = decisionStyles[decision]
  const rs = riskStyles[riskLevel]

  return (
    <section style={{ padding: "24px 0" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
        <h3 style={{ 
          fontSize: 13, 
          fontWeight: 600, 
          color: "#9b9b9b", 
          textTransform: "uppercase", 
          letterSpacing: "0.5px",
          marginBottom: 12 
        }}>
          Final Decision
        </h3>

        <div style={{
          background: "#111111",
          border: "1px solid #2a2a2a",
          borderRadius: 12,
          padding: 24,
          display: "grid",
          gridTemplateColumns: "1fr 2fr",
          gap: 32,
        }}>
          {/* Left */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <p style={{ fontSize: 11, color: "#9b9b9b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>
                AI Decision
              </p>
              <span style={{
                background: ds.bg,
                color: ds.color,
                fontSize: 13,
                fontWeight: 700,
                padding: "6px 16px",
                borderRadius: 20,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                display: "inline-block"
              }}>
                {decision}
              </span>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: "#9b9b9b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Confidence</span>
                <span style={{ fontSize: 13, color: "#f7931a", fontWeight: 600, fontFamily: "monospace" }}>{confidence}%</span>
              </div>
              <div style={{ background: "#2a2a2a", borderRadius: 4, height: 6 }}>
                <div style={{ 
                  background: "#f7931a", 
                  width: `${confidence}%`, 
                  height: 4, 
                  borderRadius: 4,
                  transition: "width 0.5s ease"
                }} />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "#9b9b9b", textTransform: "uppercase", letterSpacing: "0.5px" }}>Risk Level</span>
              <span style={{
                background: rs.bg,
                color: rs.color,
                fontSize: 16,
                fontWeight: 700,
                padding: "8px 20px",
                borderRadius: 4,
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}>
                {riskLevel}
              </span>
            </div>
          </div>

          {/* Right */}
          <div>
            <p style={{ fontSize: 11, color: "#9b9b9b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>
              Reasoning
            </p>
            <p style={{ fontSize: 13, color: "#cccccc", lineHeight: 1.7 }}>
              {reasoning}
            </p>
            {warning && (
              <div style={{
                marginTop: 16,
                padding: "10px 14px",
                background: "#f7931a11",
                border: "1px solid #f7931a33",
                borderRadius: 8,
                fontSize: 12,
                color: "#f7931a"
              }}>
                {warning}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}