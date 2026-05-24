import React from "react"

export default function Logo() {
  return (
    <div className="flex items-center gap-3 select-none">
      {/* 40x40px Logo Icon */}
      <div className="relative flex items-center justify-center w-10 h-10">
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Background optional, keeping transparent as requested */}
          
          {/* The letter "N" */}
          <path
            d="M10 30V10H16L24 24V10H30V30H24L16 16V30H10Z"
            fill="#f7931a"
          />
          
          {/* Small candlestick/wave line inside/over the N */}
          <path
            d="M12 25 L18 18 L22 22 L28 12"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-md"
          />
          
          {/* Candlestick wicks (optional, to mimic the chart) */}
          <line x1="18" y1="16" x2="18" y2="20" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
          <line x1="28" y1="10" x2="28" y2="14" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>

      {/* Brand Text */}
      <div className="text-[18px] font-bold tracking-tight">
        <span className="text-white">Neural</span>
        <span className="text-[#f7931a]">BTC</span>
      </div>
    </div>
  )
}
