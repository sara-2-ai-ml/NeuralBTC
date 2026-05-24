"use client"

import { Linkedin } from "lucide-react"

export function Footer() {
  return (
    <footer style={{
      borderTop: "1px solid #2a2a2a",
      padding: "40px 24px",
      marginTop: 24
    }}>
      <div style={{
        maxWidth: 1280,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12
      }}>

        <p style={{ fontSize: 14, fontWeight: 700, color: "#ffffff" }}>
          Neural<span style={{ color: "#f7931a" }}>BTC</span>
        </p>

        <p style={{ fontSize: 12, color: "#9b9b9b" }}>
          AI-Powered Bitcoin Intelligence
        </p>

        <a href="#" style={{ color: "#9b9b9b" }}>
          <Linkedin size={16} />
        </a>

        <p style={{ fontSize: 11, color: "#555555" }}>
          Not financial advice. Educational purposes only.
        </p>

        <p style={{ fontSize: 11, color: "#555555" }}>
          © {new Date().getFullYear()} NeuralBTC
        </p>

      </div>
    </footer>
  )
}