'use client'

import { useState, useEffect } from 'react'

interface Symbol {
  id: string
  name: string
  description: string | null
  archetype: string | null
  occurrences: number
  firstSeen: string
}

export default function SymbolDex() {
  const [symbols, setSymbols] = useState<Symbol[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

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

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  if (loading) {
    return (
      <div className="border border-terminal-green/30 p-6">
        <div className="text-terminal-green/60">
          &gt; LOADING SYMBOL DEX... <span className="cursor-blink">_</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="mb-4 text-terminal-green/60 text-sm">
        &gt; SYMBOL DEX - {symbols.length} SYMBOLS CATALOGUED
      </div>

      {symbols.length === 0 ? (
        <div className="border border-terminal-green/30 p-6 text-terminal-green/60">
          &gt; NO SYMBOLS DETECTED YET. ANALYZE YOUR FIRST ENTRY.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {symbols.map((symbol) => (
            <div
              key={symbol.id}
              className="border border-terminal-green/20 p-4 
                       hover:border-terminal-green/40 transition-colors
                       cursor-pointer"
              onClick={() => toggleExpand(symbol.id)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="text-terminal-green font-bold text-lg">
                  {symbol.name}
                </div>
                <div className="text-terminal-green/30 text-xs">
                  {expandedId === symbol.id ? '[-]' : '[+]'}
                </div>
              </div>

              <div className="text-terminal-green/60 text-xs mb-2">
                OCCURRENCES: {symbol.occurrences}
              </div>

              {symbol.archetype && (
                <div className="text-terminal-amber text-xs mb-2">
                  ARCHETYPE: {symbol.archetype}
                </div>
              )}

              {expandedId === symbol.id && symbol.description && (
                <div className="mt-3 pt-3 border-t border-terminal-green/20">
                  <div className="text-terminal-green/60 text-xs mb-1">DESCRIPTION:</div>
                  <div className="text-terminal-green text-sm">
                    {symbol.description}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

