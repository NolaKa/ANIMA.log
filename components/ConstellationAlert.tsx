'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CyberEsotericText from './CyberEsotericText'
import GhostText from './GhostText'

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
          className="fixed top-4 right-4 z-50 max-w-md border-2 border-black p-6"
          style={{ 
            backgroundColor: '#7C8A7C',
            borderBottomWidth: '4px',
            borderRightWidth: '4px',
          }}
        >
          <div className="mb-4">
            <CyberEsotericText stability={0.7} className="font-mono text-2xl mb-2" style={{ color: '#000' }}>
              {constellation.pattern}
            </CyberEsotericText>
            <GhostText size={14} className="text-sm" style={{ color: '#000' }}>
              {constellation.description}
            </GhostText>
          </div>

          {constellation.symbols.length > 0 && (
            <div className="mb-4">
              <GhostText size={12} className="text-xs font-mono mb-2" style={{ color: '#1a2b1a' }}>SYMBOLS:</GhostText>
              <div className="flex flex-wrap gap-2">
                {constellation.symbols.map((symbol, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 border-2 border-black text-xs font-mono"
                    style={{
                      backgroundColor: '#7C8A7C',
                      color: '#000',
                    }}
                  >
                    {symbol}
                  </span>
                ))}
              </div>
            </div>
          )}

          {constellation.archetype && (
            <GhostText size={14} className="mb-4 text-sm font-mono" style={{ color: '#000' }}>
              ARCHETYPE: {constellation.archetype}
            </GhostText>
          )}

          <div className="mt-4 pt-4 border-t-2 border-black">
            <GhostText size={12} className="text-xs font-bold font-mono" style={{ color: '#000' }}>
              {getConstellationQuestion(constellation.pattern)}
            </GhostText>
          </div>

          <button
            onClick={() => setIsVisible(false)}
            className="mt-4 text-xs font-mono transition-colors"
            style={{ 
              color: '#1a2b1a',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#000'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#1a2b1a'
            }}
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

