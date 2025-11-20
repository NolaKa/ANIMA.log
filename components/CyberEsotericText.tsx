'use client'

import { useState, useEffect } from 'react'

interface CyberEsotericTextProps {
  children: React.ReactNode
  stability?: number
  className?: string
  style?: React.CSSProperties
}

// Zestaw glifów: mieszanka symboli technicznych i "magicznych"
const GLYPHS = ['⏣', '⌬', '⎋', '⌘', '⌥', '§', '†', '‡', 'µ', '∂', '∆', '░', '▒', '▓', '▖', '▗', '▘', '▙', '▚', '▛', '▜', '▝', '▞', '▟']

export default function CyberEsotericText({ 
  children, 
  stability = 0.95, // Zwiększona domyślna stabilność (mniej korozji)
  className = '',
  style 
}: CyberEsotericTextProps) {
  const [displayText, setDisplayText] = useState('')
  const text = typeof children === 'string' ? children : String(children)
  
  useEffect(() => {
    // Funkcja korodująca tekst
    const corrupt = () => {
      const chars = text.split('')
      const corrupted = chars.map(char => {
        if (char === ' ' || char === '\n') return char // Spacji i nowych linii nie psujemy
        // Szansa na "halucynację" znaku zależy od stabilności
        if (Math.random() > stability) {
          return GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
        }
        return char
      })
      setDisplayText(corrupted.join(''))
    }
    
    // Ustaw początkowy tekst
    setDisplayText(text)
    
    // Efekt "migotania" halucynacji - rzadziej i tylko dla wybranych tekstów
    // Zmniejszona częstotliwość: co 2-4 sekundy zamiast co 200-500ms
    const interval = setInterval(corrupt, 2000 + Math.random() * 2000)
    return () => clearInterval(interval)
  }, [text, stability])
  
  return (
    <span className={className} style={style}>
      {displayText || text}
    </span>
  )
}

