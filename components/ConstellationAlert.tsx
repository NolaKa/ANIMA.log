'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Constellation {
  pattern: string
  description: string
  symbols: string[]
  archetype?: string
}

export default function ConstellationAlert() {
  const [constellation, setConstellation] = useState<Constellation | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    checkConstellations()
    // Check daily
    const interval = setInterval(checkConstellations, 24 * 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const checkConstellations = async () => {
    try {
      const response = await fetch('/api/constellations')
      const data = await response.json()
      if (data.pattern) {
        setConstellation(data)
        setIsVisible(true)
        // Auto-hide after 10 seconds
        setTimeout(() => setIsVisible(false), 10000)
      }
    } catch (error) {
      console.error('Error checking constellations:', error)
    }
  }

  if (!constellation) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 right-4 z-50 max-w-md border-2 border-error-red 
                   bg-true-black p-6 shadow-lg"
        >
          <div className="mb-4">
            <div className="text-error-red font-vt323 text-2xl mb-2 glitch" data-text={constellation.pattern}>
              {constellation.pattern}
            </div>
            <div className="text-terminal-green text-sm">
              {constellation.description}
            </div>
          </div>

          {constellation.symbols.length > 0 && (
            <div className="mb-4">
              <div className="text-terminal-green/60 text-xs mb-2">SYMBOLS:</div>
              <div className="flex flex-wrap gap-2">
                {constellation.symbols.map((symbol, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 border border-error-red/30 
                             bg-error-red/10 text-error-red text-xs"
                  >
                    {symbol}
                  </span>
                ))}
              </div>
            </div>
          )}

          {constellation.archetype && (
            <div className="mb-4 text-terminal-amber text-sm">
              ARCHETYPE: {constellation.archetype}
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-error-red/30">
            <div className="text-error-red text-xs font-bold">
              {getConstellationQuestion(constellation.pattern)}
            </div>
          </div>

          <button
            onClick={() => setIsVisible(false)}
            className="mt-4 text-terminal-green/60 text-xs hover:text-terminal-green 
                     transition-colors"
          >
            [DISMISS]
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function getConstellationQuestion(pattern: string): string {
  const questions: Record<string, string> = {
    ZANURZENIE: 'Czy jesteś gotów wypłynąć?',
    POŻAR: 'Co próbujesz spalić?',
    GRUNT: 'Czy stąpasz po twardym gruncie?',
    WZNIESIENIE: 'Dokąd chcesz wzlecieć?',
    CIENIE: 'Gdzie pada światło?',
    ANIMA: 'Kogo udajesz?',
    ANIMUS: 'Kogo udajesz?',
    WZORZEC: 'Czy widzisz wzór?',
  }
  return questions[pattern] || 'Co to dla Ciebie oznacza?'
}

