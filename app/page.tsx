'use client'

import { useState, useEffect } from 'react'
import ConsoleInput from '@/components/ConsoleInput'
import Archive from '@/components/Archive'
import SymbolLib from '@/components/SymbolLib'
import ConstellationGraph from '@/components/ConstellationGraph'
import BootingSequence from '@/components/BootingSequence'
import ConstellationAlert from '@/components/ConstellationAlert'

export default function Home() {
  const [isBooting, setIsBooting] = useState(true)
  const [currentView, setCurrentView] = useState<'console' | 'archive' | 'symbollib' | 'constellation'>('console')

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsBooting(false)
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  if (isBooting) {
    return <BootingSequence />
  }

  return (
    <main className="min-h-screen bg-true-black text-terminal-green font-jetbrains">
      {/* Header */}
      <header className="border-b-2 border-terminal-green p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-vt323 glitch" data-text="ANIMA.log">
              ANIMA.log
            </h1>
            <span className="text-terminal-green/60 font-vt323 text-sm">v1.0</span>
            <div className="w-4 h-4 bg-terminal-green"></div>
          </div>
          <nav className="flex gap-2 font-vt323 text-lg">
            <button
              onClick={() => setCurrentView('console')}
              className={`px-3 py-1 border-2 transition-colors ${
                currentView === 'console' 
                  ? 'border-terminal-green bg-terminal-green/10 text-terminal-green' 
                  : 'border-terminal-green/30 text-terminal-green/60 hover:border-terminal-green/50'
              }`}
            >
              [CONSOLE]
            </button>
            <button
              onClick={() => setCurrentView('archive')}
              className={`px-3 py-1 border-2 transition-colors ${
                currentView === 'archive' 
                  ? 'border-terminal-green bg-terminal-green/10 text-terminal-green' 
                  : 'border-terminal-green/30 text-terminal-green/60 hover:border-terminal-green/50'
              }`}
            >
              [ARCHIVE]
            </button>
            <button
              onClick={() => setCurrentView('symbollib')}
              className={`px-3 py-1 border-2 transition-colors ${
                currentView === 'symbollib' 
                  ? 'border-terminal-green bg-terminal-green/10 text-terminal-green' 
                  : 'border-terminal-green/30 text-terminal-green/60 hover:border-terminal-green/50'
              }`}
            >
              [SYMBOL.LIB]
            </button>
            <button
              onClick={() => setCurrentView('constellation')}
              className={`px-3 py-1 border-2 transition-colors ${
                currentView === 'constellation' 
                  ? 'border-terminal-green bg-terminal-green/10 text-terminal-green' 
                  : 'border-terminal-green/30 text-terminal-green/60 hover:border-terminal-green/50'
              }`}
            >
              [CONSTELLATION]
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-4">
        {currentView === 'console' && <ConsoleInput />}
        {currentView === 'archive' && <Archive />}
        {currentView === 'symbollib' && <SymbolLib />}
        {currentView === 'constellation' && <ConstellationGraph />}
      </div>

      {/* Constellation Alert */}
      <ConstellationAlert />
    </main>
  )
}

