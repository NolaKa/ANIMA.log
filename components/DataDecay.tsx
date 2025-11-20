'use client'

import { useMemo } from 'react'
import HallucinationText from './HallucinationText'

interface DataDecayProps {
  children: React.ReactNode
  ageInDays: number
  className?: string
  style?: React.CSSProperties
}

// Corrupt text based on age
function corruptText(text: string, corruptionLevel: number): string {
  if (corruptionLevel < 0.1) return text
  
  const chars = text.split('')
  const corruptionChars = ['▖', '▗', '▘', '▙', '▚', '▛', '▜', '▝', '▞', '▟', '█', '▓', '▒', '░']
  
  return chars.map((char, i) => {
    if (char === ' ') return char
    if (Math.random() < corruptionLevel) {
      return corruptionChars[Math.floor(Math.random() * corruptionChars.length)]
    }
    return char
  }).join('')
}

export default function DataDecay({ children, ageInDays, className = '', style }: DataDecayProps) {
  const corruptionLevel = useMemo(() => {
    // More days = more corruption (max 0.3 for very old entries)
    return Math.min(ageInDays / 100, 0.3)
  }, [ageInDays])
  
  const text = typeof children === 'string' ? children : String(children)
  const corrupted = useMemo(() => corruptText(text, corruptionLevel), [text, corruptionLevel])
  
  const blurIntensity = Math.min(ageInDays / 50, 3)
  const opacity = Math.max(1 - ageInDays / 200, 0.6)
  
  return (
    <div className={className} style={{
      filter: `blur(${blurIntensity}px)`,
      opacity,
      ...style
    }}>
      <HallucinationText intensity={1 + corruptionLevel * 2}>
        {corruptionLevel > 0.1 ? corrupted : text}
      </HallucinationText>
    </div>
  )
}

