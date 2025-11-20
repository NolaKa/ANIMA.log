'use client'

import { useState, useEffect } from 'react'
import { format, formatDistanceToNow } from 'date-fns'
import { pl } from 'date-fns/locale'
import CyberEsotericText from './CyberEsotericText'
import GhostText from './GhostText'
import BreathingElement from './BreathingElement'

interface Symbol {
  id: string
  name: string
  description: string | null
  category: string | null
  meaning: string | null
  level: number
  occurrences: number
  firstSeen: string
  lastSeen: string
}

interface SymbolHistory {
  symbol: Symbol
  occurrences: Array<{
    entryId: string
    timestamp: string
    type: string
    contentPreview: string
  }>
}

export default function SymbolLib() {
  const [symbols, setSymbols] = useState<Symbol[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSymbol, setSelectedSymbol] = useState<SymbolHistory | null>(null)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [sortBy, setSortBy] = useState<'name' | 'level' | 'lastSeen' | 'occurrences'>('level')

  useEffect(() => {
    fetchSymbols()
  }, [])

  const fetchSymbols = async () => {
    try {
      const response = await fetch('/api/symbols')
      const data = await response.json()
      setSymbols(data)
    } catch (error) {
      console.error('Error fetching symbols:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSymbolHistory = async (symbolId: string) => {
    setLoadingHistory(true)
    try {
      const response = await fetch(`/api/symbols/${symbolId}/history`)
      const data = await response.json()
      setSelectedSymbol(data)
    } catch (error) {
      console.error('Error fetching symbol history:', error)
    } finally {
      setLoadingHistory(false)
    }
  }

  const getLevelDescription = (level: number): string => {
    switch (level) {
      case 1:
        return 'RAW - Pierwsze wystąpienie. Symbol jest surowy, 1-bitowy, niewyraźny.'
      case 2:
        return 'EMERGING - Symbol zaczyna się krystalizować. Więcej szczegółów, większa klarowność.'
      case 3:
        return 'DEFINED - Symbol jest wyraźny. Struktura jest czytelna, znaczenie głębsze.'
      case 4:
        return 'EVOLVED - Symbol osiągnął zaawansowaną formę. Bogata symbolika, głębokie znaczenie.'
      case 5:
        return 'MASTERED - Symbol w pełni rozwinięty. Kompleksowa struktura, pełna świadomość znaczenia.'
      default:
        return 'UNKNOWN'
    }
  }

  const getLevelVisual = (level: number, name: string): string => {
    // Generate ASCII art representation based on level - more organic/fractal-like
    const size = 6 + level * 2 // Level 1 = 8x8, Level 5 = 16x16
    const density = level / 5 // How "filled" the symbol is
    
    // Create a more fractal-like pattern using multiple hash functions
    let visual = ''
    const nameHash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    
    for (let y = 0; y < size; y++) {
      let line = ''
      for (let x = 0; x < size; x++) {
        // Fractal-like pattern using multiple hash layers
        const hash1 = (nameHash + x * 7 + y * 11 + level * 13) % 100
        const hash2 = (nameHash + x * 3 + y * 5 + level * 17) % 100
        const hash3 = (nameHash + x * 2 + y * 3 + level * 19) % 100
        
        // Distance from center for radial patterns
        const centerX = size / 2
        const centerY = size / 2
        const dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2)
        const maxDist = Math.sqrt(centerX ** 2 + centerY ** 2)
        const radialFactor = 1 - (dist / maxDist)
        
        if (level === 1) {
          // Level 1: Very sparse, 1-bit, pixelated
          const threshold = 0.15
          line += (hash1 % 100) / 100 < threshold ? '█' : ' '
        } else if (level === 2) {
          // Level 2: More detail, still blocky
          const threshold = 0.3
          const pattern = (hash1 % 100) / 100
          line += pattern < threshold ? '█' : pattern < threshold * 1.5 ? '▓' : '░'
        } else if (level === 3) {
          // Level 3: Clear pattern, more gradients
          const pattern = ((hash1 + hash2) % 200) / 200
          line += pattern < 0.4 ? '█' : pattern < 0.6 ? '▓' : pattern < 0.8 ? '▒' : '░'
        } else if (level === 4) {
          // Level 4: Rich detail, fractal-like
          const pattern = ((hash1 + hash2 + hash3) % 300) / 300
          const combined = (pattern + radialFactor * 0.3) / 1.3
          line += combined < 0.5 ? '█' : combined < 0.7 ? '▓' : combined < 0.85 ? '▒' : '░'
        } else {
          // Level 5: Full detail, complex fractal pattern
          const pattern = ((hash1 + hash2 + hash3) % 300) / 300
          const radial = radialFactor * 0.4
          const combined = (pattern + radial) / 1.4
          const char = combined < 0.4 ? '█' : combined < 0.6 ? '▓' : combined < 0.8 ? '▒' : combined < 0.95 ? '░' : ' '
          line += char
        }
      }
      visual += line + '\n'
    }
    return visual
  }

  const getCategoryColor = (category: string | null): string => {
    // Cyber-Ezoteryczne kolory
    switch (category) {
      case 'NATURE':
        return '#1a2b1a'
      case 'PERSONA':
        return '#000'
      case 'SHADOW':
        return '#000'
      case 'SACRED':
        return '#1a2b1a'
      default:
        return '#1a2b1a'
    }
  }

  const sortedSymbols = [...symbols].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'level':
        return b.level - a.level
      case 'lastSeen':
        return new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime()
      case 'occurrences':
        return b.occurrences - a.occurrences
      default:
        return 0
    }
  })

  if (loading) {
    return (
      <div className="border-2 border-black p-6" style={{ backgroundColor: '#7C8A7C' }}>
        <CyberEsotericText stability={0.85} className="font-mono text-base" style={{ color: '#000' }}>
          &gt; LOADING SYMBOL.LIB... <span className="cursor-blink">_</span>
        </CyberEsotericText>
      </div>
    )
  }

  return (
    <div className="flex gap-4 h-[600px] fade-in-blur">
      {/* Left Panel - File List */}
      <div className="flex-1 overflow-hidden flex flex-col border-2 border-black" style={{ backgroundColor: '#7C8A7C' }}>
        {/* Header */}
        <div className="border-b-2 border-black p-2" style={{ backgroundColor: '#5a6b5a' }}>
          <div className="flex items-center justify-between font-mono text-sm" style={{ color: '#000' }}>
            <div className="flex items-center gap-4">
              <CyberEsotericText stability={0.9} className="font-mono">
                &gt; SYMBOL.LIB
              </CyberEsotericText>
              <GhostText size={12} className="text-xs" style={{ color: '#1a2b1a' }}>({symbols.length} files)</GhostText>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <GhostText size={12} style={{ color: '#1a2b1a', letterSpacing: '1px' }}>SORT:</GhostText>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="font-mono text-xs px-2 py-1 border-2 border-black"
                style={{
                  backgroundColor: '#7C8A7C',
                  borderColor: '#000',
                  color: '#000',
                }}
              >
                <option value="level">LEVEL</option>
                <option value="name">NAME</option>
                <option value="lastSeen">LAST SEEN</option>
                <option value="occurrences">OCCURRENCES</option>
              </select>
            </div>
          </div>
        </div>

        {/* File List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sortedSymbols.map((symbol) => {
            const isSelected = selectedSymbol?.symbol.id === symbol.id
            const categoryColor = getCategoryColor(symbol.category)
            const lastSeenDate = new Date(symbol.lastSeen)
            const lastSeenText = formatDistanceToNow(lastSeenDate, { 
              addSuffix: true, 
              locale: pl 
            })

            return (
              <BreathingElement key={symbol.id} intensity={0.02} duration={4000 + Math.random() * 2000}>
                <div
                  onClick={() => fetchSymbolHistory(symbol.id)}
                  className="flex items-center gap-2 p-2 cursor-pointer border-2 transition-all"
                  style={{
                    borderColor: '#000',
                    backgroundColor: isSelected ? '#5a6b5a' : '#7C8A7C',
                    borderBottomWidth: isSelected ? '4px' : '2px',
                    borderRightWidth: isSelected ? '4px' : '2px',
                  }}
                >
                  {/* File Icon */}
                  <div className="font-mono text-xs" style={{ color: '#000' }}>
                    {symbol.level === 1 ? '▢' : symbol.level === 2 ? '▦' : symbol.level === 3 ? '▩' : symbol.level === 4 ? '▨' : '█'}
                  </div>
                  
                  {/* Filename */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <GhostText size={14} className="font-mono text-sm truncate" style={{ color: '#000' }}>
                        {symbol.name}.sym
                      </GhostText>
                      <span className="text-xs font-mono" style={{ color: '#1a2b1a' }}>
                        L{symbol.level}
                      </span>
                    </div>
                  </div>

                  {/* File Info */}
                  <div className="text-xs font-mono whitespace-nowrap">
                    <div style={{ color: categoryColor }}>
                      {symbol.category || 'UNK'}
                    </div>
                    <div style={{ color: '#1a2b1a' }}>
                      {symbol.occurrences}x
                    </div>
                  </div>
                </div>
              </BreathingElement>
            )
          })}
        </div>
      </div>

      {/* Right Panel - File Details */}
      <div className="flex-1 overflow-y-auto border-2 border-black" style={{ backgroundColor: '#7C8A7C' }}>
        {selectedSymbol ? (
          loadingHistory ? (
            <div className="p-6 text-center">
              <CyberEsotericText stability={0.85} className="font-mono text-base" style={{ color: '#000' }}>
                &gt; LOADING... <span className="cursor-blink">_</span>
              </CyberEsotericText>
            </div>
          ) : (
            <div className="p-4 space-y-4 fade-in-blur">
              {/* File Header */}
              <div className="border-b-2 border-black pb-3">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <CyberEsotericText stability={0.7} className="font-mono text-xl mb-1" style={{ color: '#000' }}>
                      &gt; {selectedSymbol.symbol.name.toUpperCase()}.SYM
                    </CyberEsotericText>
                    <GhostText size={12} className="text-xs font-mono" style={{ color: '#1a2b1a', letterSpacing: '1px' }}>
                      LEVEL {selectedSymbol.symbol.level} | {selectedSymbol.symbol.occurrences} OCCURRENCES
                    </GhostText>
                  </div>
                  <div 
                    className="text-xs font-mono px-2 py-1 border-2 border-black"
                    style={{ 
                      borderColor: '#000',
                      color: '#000',
                      backgroundColor: '#7C8A7C',
                    }}
                  >
                    {selectedSymbol.symbol.category || 'UNKNOWN'}
                  </div>
                </div>
              </div>

              {/* Visual Representation */}
              <div className="border-2 border-black p-4" style={{ backgroundColor: '#5a6b5a' }}>
                <GhostText size={12} className="text-xs mb-2 font-mono" style={{ color: '#1a2b1a', letterSpacing: '1px' }}>
                  VISUAL REPRESENTATION (LEVEL {selectedSymbol.symbol.level}):
                </GhostText>
                <pre className="font-mono text-xs leading-tight" style={{ color: '#000' }}>
                  {getLevelVisual(selectedSymbol.symbol.level, selectedSymbol.symbol.name)}
                </pre>
              </div>

              {/* Level Description */}
              <div className="border-2 border-black p-3" style={{ backgroundColor: '#7C8A7C' }}>
                <GhostText size={12} className="text-xs mb-2 font-mono" style={{ color: '#1a2b1a', letterSpacing: '1px' }}>
                  EVOLUTION STATUS:
                </GhostText>
                <GhostText size={14} className="font-mono text-sm" style={{ color: '#000' }}>
                  {getLevelDescription(selectedSymbol.symbol.level)}
                </GhostText>
              </div>

              {/* Meaning */}
              {selectedSymbol.symbol.meaning && (
                <div className="border-2 border-black p-3" style={{ backgroundColor: '#7C8A7C' }}>
                  <GhostText size={12} className="text-xs mb-2 font-mono" style={{ color: '#1a2b1a', letterSpacing: '1px' }}>
                    MEANING:
                  </GhostText>
                  <GhostText size={14} className="text-sm" style={{ color: '#000' }}>
                    {selectedSymbol.symbol.meaning}
                  </GhostText>
                </div>
              )}

              {/* Description (deeper at higher levels) */}
              {selectedSymbol.symbol.description && (
                <div className="border-2 border-black p-3" style={{ backgroundColor: '#7C8A7C' }}>
                  <GhostText size={12} className="text-xs mb-2 font-mono" style={{ color: '#1a2b1a', letterSpacing: '1px' }}>
                    DESCRIPTION:
                  </GhostText>
                  <GhostText size={14} className="font-mono text-sm whitespace-pre-wrap" style={{ color: '#000' }}>
                    {selectedSymbol.symbol.description}
                  </GhostText>
                </div>
              )}

              {/* Timestamps */}
              <div className="border-2 border-black p-3" style={{ backgroundColor: '#7C8A7C' }}>
                <GhostText size={12} className="text-xs mb-2 font-mono" style={{ color: '#1a2b1a', letterSpacing: '1px' }}>
                  TIMELINE:
                </GhostText>
                <div className="space-y-1 text-xs font-mono">
                  <div style={{ color: '#000' }}>
                    FIRST SEEN: {format(new Date(selectedSymbol.symbol.firstSeen), 'dd.MM.yyyy HH:mm', { locale: pl })}
                  </div>
                  <div style={{ color: '#000' }}>
                    LAST SEEN: {format(new Date(selectedSymbol.symbol.lastSeen), 'dd.MM.yyyy HH:mm', { locale: pl })} ({formatDistanceToNow(new Date(selectedSymbol.symbol.lastSeen), { addSuffix: true, locale: pl })})
                  </div>
                </div>
              </div>

              {/* Occurrence History */}
              <div className="border-2 border-black p-3" style={{ backgroundColor: '#7C8A7C' }}>
                <GhostText size={12} className="text-xs mb-2 font-mono" style={{ color: '#1a2b1a', letterSpacing: '1px' }}>
                  OCCURRENCE HISTORY ({selectedSymbol.occurrences.length} entries):
                </GhostText>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {selectedSymbol.occurrences.map((occ, idx) => (
                    <div 
                      key={idx}
                      className="border-l-2 border-black pl-2 py-1 text-xs"
                    >
                      <div className="font-mono" style={{ color: '#1a2b1a' }}>
                        [{occ.type.toUpperCase()}] {format(new Date(occ.timestamp), 'dd.MM.yyyy HH:mm', { locale: pl })}
                      </div>
                      <GhostText size={12} className="text-xs font-mono mt-1" style={{ color: '#000' }}>
                        {occ.contentPreview}
                      </GhostText>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        ) : (
          <div className="p-6 text-center">
            <GhostText size={16} className="font-mono text-base" style={{ color: '#000' }}>
              &gt; SELECT A SYMBOL FILE TO VIEW DETAILS
            </GhostText>
          </div>
        )}
      </div>
    </div>
  )
}

