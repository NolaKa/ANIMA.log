'use client'

import { useState, useEffect } from 'react'
import { format, formatDistanceToNow } from 'date-fns'
import { pl } from 'date-fns/locale'

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
    switch (category) {
      case 'NATURE':
        return '#33FF00'
      case 'PERSONA':
        return '#FFB000'
      case 'SHADOW':
        return '#FF3333'
      case 'SACRED':
        return '#00FFFF'
      default:
        return '#888888'
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
      <div className="border border-terminal-green/30 p-6">
        <div className="text-terminal-green/60">
          &gt; LOADING SYMBOL.LIB... <span className="cursor-blink">_</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-4 h-[600px]">
      {/* Left Panel - File List (Norton Commander style) */}
      <div className="flex-1 border-2 border-terminal-green/30 bg-true-black overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b-2 border-terminal-green p-2 bg-terminal-green/10">
          <div className="flex items-center justify-between text-terminal-green font-vt323 text-sm">
            <div className="flex items-center gap-4">
              <span>&gt; SYMBOL.LIB</span>
              <span className="text-terminal-green/60">({symbols.length} files)</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-terminal-green/60">SORT:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-true-black border border-terminal-green/30 text-terminal-green text-xs px-2 py-1 font-vt323"
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
        <div className="flex-1 overflow-y-auto">
          <div className="p-2 space-y-1">
            {sortedSymbols.map((symbol) => {
              const isSelected = selectedSymbol?.symbol.id === symbol.id
              const categoryColor = getCategoryColor(symbol.category)
              const lastSeenDate = new Date(symbol.lastSeen)
              const lastSeenText = formatDistanceToNow(lastSeenDate, { 
                addSuffix: true, 
                locale: pl 
              })

              return (
                <div
                  key={symbol.id}
                  onClick={() => fetchSymbolHistory(symbol.id)}
                  className={`flex items-center gap-2 p-2 cursor-pointer border transition-colors
                    ${isSelected 
                      ? 'border-terminal-green bg-terminal-green/10' 
                      : 'border-terminal-green/20 hover:border-terminal-green/40'
                    }`}
                >
                  {/* File Icon */}
                  <div className="text-terminal-green font-mono text-xs">
                    {symbol.level === 1 ? '▢' : symbol.level === 2 ? '▦' : symbol.level === 3 ? '▩' : symbol.level === 4 ? '▨' : '█'}
                  </div>
                  
                  {/* Filename */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-terminal-green font-mono text-sm truncate">
                        {symbol.name}.sym
                      </span>
                      <span className="text-terminal-green/40 text-xs">
                        L{symbol.level}
                      </span>
                    </div>
                  </div>

                  {/* File Info */}
                  <div className="text-terminal-green/60 text-xs font-mono whitespace-nowrap">
                    <div style={{ color: categoryColor }}>
                      {symbol.category || 'UNK'}
                    </div>
                    <div className="text-terminal-green/40">
                      {symbol.occurrences}x
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Right Panel - File Details */}
      <div className="flex-1 border-2 border-terminal-green/30 bg-true-black overflow-y-auto">
        {selectedSymbol ? (
          loadingHistory ? (
            <div className="p-6 text-terminal-green/60 text-center">
              &gt; LOADING... <span className="cursor-blink">_</span>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {/* File Header */}
              <div className="border-b-2 border-terminal-green/30 pb-3">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-terminal-green font-vt323 text-xl mb-1">
                      &gt; {selectedSymbol.symbol.name.toUpperCase()}.SYM
                    </div>
                    <div className="text-terminal-green/60 text-xs font-mono">
                      LEVEL {selectedSymbol.symbol.level} | {selectedSymbol.symbol.occurrences} OCCURRENCES
                    </div>
                  </div>
                  <div 
                    className="text-xs font-mono px-2 py-1 border"
                    style={{ 
                      borderColor: getCategoryColor(selectedSymbol.symbol.category),
                      color: getCategoryColor(selectedSymbol.symbol.category)
                    }}
                  >
                    {selectedSymbol.symbol.category || 'UNKNOWN'}
                  </div>
                </div>
              </div>

              {/* Visual Representation */}
              <div className="border border-terminal-green/30 p-4 bg-terminal-green/5">
                <div className="text-terminal-green/60 text-xs mb-2 font-mono">
                  VISUAL REPRESENTATION (LEVEL {selectedSymbol.symbol.level}):
                </div>
                <pre className="text-terminal-green font-mono text-xs leading-tight">
                  {getLevelVisual(selectedSymbol.symbol.level, selectedSymbol.symbol.name)}
                </pre>
              </div>

              {/* Level Description */}
              <div className="border border-terminal-green/30 p-3">
                <div className="text-terminal-green/60 text-xs mb-2 font-mono">
                  EVOLUTION STATUS:
                </div>
                <div className="text-terminal-green text-sm font-mono">
                  {getLevelDescription(selectedSymbol.symbol.level)}
                </div>
              </div>

              {/* Meaning */}
              {selectedSymbol.symbol.meaning && (
                <div className="border border-terminal-green/30 p-3">
                  <div className="text-terminal-green/60 text-xs mb-2 font-mono">
                    MEANING:
                  </div>
                  <div className="text-terminal-green text-sm">
                    {selectedSymbol.symbol.meaning}
                  </div>
                </div>
              )}

              {/* Description (deeper at higher levels) */}
              {selectedSymbol.symbol.description && (
                <div className="border border-terminal-green/30 p-3">
                  <div className="text-terminal-green/60 text-xs mb-2 font-mono">
                    DESCRIPTION:
                  </div>
                  <div className="text-terminal-green text-sm font-mono whitespace-pre-wrap">
                    {selectedSymbol.symbol.description}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="border border-terminal-green/30 p-3">
                <div className="text-terminal-green/60 text-xs mb-2 font-mono">
                  TIMELINE:
                </div>
                <div className="space-y-1 text-terminal-green text-xs font-mono">
                  <div>
                    FIRST SEEN: {format(new Date(selectedSymbol.symbol.firstSeen), 'dd.MM.yyyy HH:mm', { locale: pl })}
                  </div>
                  <div className="text-terminal-amber">
                    LAST SEEN: {format(new Date(selectedSymbol.symbol.lastSeen), 'dd.MM.yyyy HH:mm', { locale: pl })} ({formatDistanceToNow(new Date(selectedSymbol.symbol.lastSeen), { addSuffix: true, locale: pl })})
                  </div>
                </div>
              </div>

              {/* Occurrence History */}
              <div className="border border-terminal-green/30 p-3">
                <div className="text-terminal-green/60 text-xs mb-2 font-mono">
                  OCCURRENCE HISTORY ({selectedSymbol.occurrences.length} entries):
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {selectedSymbol.occurrences.map((occ, idx) => (
                    <div 
                      key={idx}
                      className="border-l-2 border-terminal-green/30 pl-2 py-1 text-xs"
                    >
                      <div className="text-terminal-green/60 font-mono">
                        [{occ.type.toUpperCase()}] {format(new Date(occ.timestamp), 'dd.MM.yyyy HH:mm', { locale: pl })}
                      </div>
                      <div className="text-terminal-green/80 text-xs font-mono mt-1">
                        {occ.contentPreview}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        ) : (
          <div className="p-6 text-terminal-green/60 text-center">
            &gt; SELECT A SYMBOL FILE TO VIEW DETAILS
          </div>
        )}
      </div>
    </div>
  )
}

