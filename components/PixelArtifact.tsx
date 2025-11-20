'use client'

import { useState, useEffect } from 'react'

interface PixelArtifactProps {
  x: string
  y: string
  pattern: string
  opacity?: number
}

export default function PixelArtifact({ x, y, pattern, opacity = 0.6 }: PixelArtifactProps) {
  const [visible, setVisible] = useState(true)
  
  useEffect(() => {
    // Artefakty migają skokowo
    const interval = setInterval(() => {
      setVisible(Math.random() > 0.3) // 70% szansy na widoczność
    }, 500 + Math.random() * 1000)
    
    return () => clearInterval(interval)
  }, [])
  
  if (!visible) return null
  
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        opacity,
        fontSize: '20px',
        color: '#1a2b1a',
        fontWeight: 'bold',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    >
      {pattern}
    </div>
  )
}

