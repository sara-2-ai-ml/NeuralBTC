"use client"

interface TechnicalDetailsProps {
  bollingerUpper: number
  bollingerLower: number
  bbSignal: string
  buySignals: number
  sellSignals: number
  holdSignals: number
  modelWindow: string
  features: number
}

export function TechnicalDetails({
  bollingerUpper,
  bollingerLower,
  bbSignal,
  buySignals,
  sellSignals,
  holdSignals,
  modelWindow,
  features,
}: TechnicalDetailsProps) {
  const metrics = [
    { label: "Bollinger Upper", value: `$${bollingerUpper.toLocaleString()}` },
    { label: "Bollinger Lower", value: `$${bollingerLower.toLocaleString()}` },
    { label: "BB Signal",       value: bbSignal, color: "#ef5350" },
    { label: "Buy Signals",     value: `${buySignals}/3`, color: buySignals > 0 ? "#26a69a" : "#ffffff" },
    { label: "Sell Signals",    value: `${sellSignals}/3`, color: sellSignals > 0 ? "#ef5350" : "#ffffff" },
    { label: "Hold Signals",    value: `${holdSignals}/3`, color: holdSignals > 0 ? "#f7931a" : "#ffffff" },
    { label: "Model Window",    value: modelWindow },
    { label: "Features",        value: `${features} engineered` },
  ]

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
          Technical Details
        </h3>

        <div style={{
          background: "#111111",
          border: "1px solid #2a2a2a",
          borderRadius: 12,
          padding: "20px 24px",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "20px 16px",
        }}>
          {metrics.map((metric, index) => (
            <div key={index}>
              <p style={{
                fontSize: 11,
                color: "#9b9b9b",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: 6
              }}>
                {metric.label}
              </p>
              <p style={{
                fontSize: 16,
                fontWeight: 600,
                fontFamily: "monospace",
                color: metric.color || "#ffffff"
              }}>
                {metric.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}