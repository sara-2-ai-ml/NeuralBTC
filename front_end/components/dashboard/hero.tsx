"use client"

import { Button } from "@/components/ui/button"

interface HeroProps {
  onRunAnalysis: () => void
  isLoading: boolean
}

// Premium 3D Glassmorphism Coin — matches photoreference exactly
const GlassCoin = ({ 
  logo,
  baseColor,      // solid coin color (e.g. '#e8004c')
  glowColor,      // outer glow (e.g. 'rgba(232,0,76,0.7)')
  size, 
  delay, 
  duration,
}: any) => {
  return (
    <div 
      className="absolute top-0 left-0 rounded-full z-20 pointer-events-none"
      style={{
        width: size, height: size,
        // Solid base color with a radial centre-brighten (matches photo's deep vivid body)
        background: `radial-gradient(circle at 38% 35%, ${baseColor}ff 0%, ${baseColor}cc 55%, ${baseColor}88 100%)`,
        boxShadow: `
          /* big specular top-left catch-light */
          inset ${size*0.06}px ${size*0.1}px ${size*0.2}px rgba(255,255,255,0.85),
          /* bottom shadow for depth */
          inset -${size*0.05}px -${size*0.1}px ${size*0.18}px rgba(0,0,0,0.55),
          /* outer drop shadow */
          0 ${size*0.15}px ${size*0.35}px rgba(0,0,0,0.75),
          /* coloured outer glow */
          0 0 ${size*0.4}px ${glowColor}
        `,
        border: '1.5px solid rgba(255,255,255,0.55)',
        animation: `coinPath ${duration}s cubic-bezier(0.3, 0.1, 0.3, 1) infinite`,
        animationDelay: delay,
        opacity: 0,
        transformOrigin: 'center center',
        overflow: 'hidden',
      }}
    >
      {/* Top convex specular streak — the KEY to looking 3D */}
      <div style={{
        position:'absolute',
        top: '5%', left: '12%',
        width: '55%', height: '38%',
        borderRadius: '50%',
        background: 'radial-gradient(ellipse at 40% 30%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.4) 45%, transparent 75%)',
        transform: 'rotate(-20deg)',
        filter: 'blur(2px)',
        pointerEvents: 'none',
      }} />

      {/* Subtle rim inner border */}
      <div style={{
        position:'absolute', inset: 4,
        borderRadius: '50%',
        border: '1px solid rgba(255,255,255,0.25)',
        pointerEvents: 'none',
      }} />

      {/* Logo centered */}
      <div style={{
        position:'absolute', inset:0,
        display:'flex', alignItems:'center', justifyContent:'center',
      }}>
        {logo}
      </div>
    </div>
  )
}

export function Hero({ onRunAnalysis, isLoading }: HeroProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#020202] text-white py-20 font-sans">
      
      <style dangerouslySetInnerHTML={{__html: `
        /* The path perfectly matches the SVG ribbon curve */
        @keyframes coinPath {
          0% { transform: translate(15vw, 15vh) scale(0); opacity: 0; }
          3% { transform: translate(15vw, 15vh) scale(0.5); opacity: 1; }
          /* Drop onto the ribbon */
          18% { transform: translate(25vw, 55vh) scale(0.8) rotate(72deg); opacity: 1; }
          /* Roll into the valley */
          45% { transform: translate(50vw, 63vh) scale(1.1) rotate(180deg); opacity: 1; }
          /* Roll up the hill */
          75% { transform: translate(75vw, 55vh) scale(0.9) rotate(288deg); opacity: 1; }
          /* Roll to the edge */
          90% { transform: translate(90vw, 38vh) scale(0.7) rotate(350deg); opacity: 1; }
          /* Fall off into the abyss */
          100% { transform: translate(100vw, 100vh) scale(0.2) rotate(420deg); opacity: 0; }
        }

        /* The spawner pulsing perfectly synced with coin drops */
        @keyframes spawnerPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 20px rgba(255,255,255,0.2), inset 0 0 20px #000; }
          10% { transform: scale(0.7); box-shadow: 0 0 60px rgba(255,255,255,1), inset 0 0 20px #000; }
          25% { transform: scale(1); box-shadow: 0 0 20px rgba(255,255,255,0.2), inset 0 0 20px #000; }
        }
      `}} />



      {/* SVG Black & White Metallic Ribbon with Texture */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            {/* The dramatic black and white lighting the user mentioned */}
            <linearGradient id="metalTrack" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="10%" stopColor="#888888" />
              <stop offset="30%" stopColor="#050505" />
              <stop offset="60%" stopColor="#333333" />
              <stop offset="90%" stopColor="#000000" />
              <stop offset="100%" stopColor="#aaaaaa" />
            </linearGradient>
            
            {/* Carbon / Mesh dot pattern */}
            <pattern id="trackDots" width="0.2" height="0.4" patternUnits="userSpaceOnUse">
              <circle cx="0.1" cy="0.2" r="0.08" fill="rgba(255,255,255,0.25)" />
            </pattern>
          </defs>

          {/* Main 3D Track Body */}
          <path 
            d="M -10 40 C 25 80, 75 80, 110 40 L 110 50 C 75 90, 25 90, -10 50 Z" 
            fill="url(#metalTrack)" 
          />
          
          {/* Dot Texture Overlay */}
          <path 
            d="M -10 40 C 25 80, 75 80, 110 40 L 110 50 C 75 90, 25 90, -10 50 Z" 
            fill="url(#trackDots)" 
            style={{ mixBlendMode: 'overlay' }}
          />
          
          {/* Top Shiny Edge Highlight */}
          <path 
            d="M -10 40 C 25 80, 75 80, 110 40" 
            fill="none" stroke="#ffffff" strokeWidth="0.3" opacity="0.9"
          />
          
          {/* Bottom Edge Shadow */}
          <path 
            d="M -10 50 C 25 90, 75 90, 110 50" 
            fill="none" stroke="#000000" strokeWidth="0.6"
          />
        </svg>
      </div>

      {/* Interactive Falling Glassmorphism Coins */}
      <div className="absolute inset-0 pointer-events-none" style={{ marginLeft: '-60px', marginTop: '-60px' }}>
        
        {/* ── 1. USDC / Dollar Coin — gold-lime, circular S logo (matches Photo 1) ── */}
        <GlassCoin 
          size={120}
          baseColor="#b8c820"
          glowColor="rgba(200,215,30,0.65)"
          duration={8} delay="-0s"
          logo={
            <svg width="58" height="58" viewBox="0 0 100 100" fill="none">
              {/* outer ring */}
              <circle cx="50" cy="50" r="44" stroke="rgba(255,230,120,0.9)" strokeWidth="5" fill="none" />
              {/* inner ring */}
              <circle cx="50" cy="50" r="33" stroke="rgba(255,230,120,0.6)" strokeWidth="2" fill="none" />
              {/* Dollar S shape */}
              <text x="50" y="63" textAnchor="middle" fontSize="42" fontWeight="bold"
                fill="rgba(255,235,130,0.95)" fontFamily="Georgia,serif">$</text>
            </svg>
          }
        />

        {/* ── 2. Bitcoin Coin — hot magenta/pink, large gold ₿ (matches Photo 2) ── */}
        <GlassCoin 
          size={140}
          baseColor="#e8006a"
          glowColor="rgba(232,0,106,0.7)"
          duration={8} delay="-2s"
          logo={
            <svg width="70" height="70" viewBox="0 0 100 100" fill="none">
              <text x="50" y="72" textAnchor="middle" fontSize="68" fontWeight="900"
                fill="#f5d020" fontFamily="Arial,sans-serif"
                style={{ filter: 'drop-shadow(0 0 8px rgba(245,208,32,0.9))' }}>₿</text>
            </svg>
          }
        />

        {/* ── 3. Ethereum Coin — deep blue/indigo, white ETH diamond ── */}
        <GlassCoin 
          size={150}
          baseColor="#3d2bb5"
          glowColor="rgba(100,80,255,0.65)"
          duration={8} delay="-4s"
          logo={
            <svg width="60" height="60" viewBox="0 0 256 417" fill="none">
              {/* ETH diamond — top half bright, bottom half dimmer */}
              <polygon points="128,6 4,212 128,160" fill="rgba(255,255,255,0.95)" />
              <polygon points="128,6 252,212 128,160" fill="rgba(255,255,255,0.65)" />
              <polygon points="4,212 128,290 128,160" fill="rgba(255,255,255,0.85)" />
              <polygon points="252,212 128,290 128,160" fill="rgba(255,255,255,0.45)" />
              <polygon points="128,314 4,235 128,290" fill="rgba(255,255,255,0.9)" />
              <polygon points="128,314 252,235 128,290" fill="rgba(255,255,255,0.55)" />
            </svg>
          }
        />

        {/* ── 4. Tesla Coin — vivid purple, yellow T logo ── */}
        <GlassCoin 
  size={125}
  baseColor="#9945ff"
  glowColor="rgba(153,69,255,0.7)"
  duration={8} delay="-6s"
  logo={
    <svg width="52" height="52" viewBox="0 0 397 311" fill="white">
      <path d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1l62.7-62.7zM64.6 3.8C67.1 1.4 70.4 0 73.8 0h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.6 3.8zM333.1 120.9c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h317.4c5.8 0 8.7-7 4.6-11.1l-62.7-62.7z"/>
    </svg>
  }
/>
      </div>

      {/* Hero Content Area */}
      <div className="container mx-auto px-4 relative z-30">
        <div className="text-center max-w-4xl mx-auto flex flex-col items-center">
        <h1 className="text-5xl md:text-6xl lg:text-[60px] leading-[1.05] font-semibold tracking-tight mb-8 text-white drop-shadow-2xl">
        Multi-Agent AI System<br/>for Real-Time Bitcoin Forecasting
        </h1>
          <p className="text-[#a0a0a0] text-lg md:text-xl mb-12 max-w-2xl font-light leading-relaxed">
            The world's most advanced analytical engine to help you predict better, minimize risk, and maximize gains.
          </p>
    
        </div>
      </div>
    </section>
  )
}
