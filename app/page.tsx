'use client'

import { useState, useEffect } from 'react'
import ConsoleInput from '@/components/ConsoleInput'
import Archive from '@/components/Archive'
import SymbolLib from '@/components/SymbolLib'
import ConstellationGraph from '@/components/ConstellationGraph'
import BootingSequence from '@/components/BootingSequence'
import ConstellationAlert from '@/components/ConstellationAlert'
import PixelArtifact from '@/components/PixelArtifact'
import GhostText from '@/components/GhostText'

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

  // Generate random artifacts
  const artifacts = [
    { x: '10%', y: '20%', p: '✛' },
    { x: '80%', y: '15%', p: '::' },
    { x: '50%', y: '60%', p: '░░' },
    { x: '90%', y: '90%', p: '▟' },
    { x: '30%', y: '40%', p: '⌬' },
    { x: '70%', y: '75%', p: '⏣' },
  ]

  return (
    <main className="min-h-screen relative" style={{ backgroundColor: '#7C8A7C', color: '#000' }}>
      {/* Pixel Artifacts */}
      {artifacts.map((artifact, i) => (
        <PixelArtifact key={i} x={artifact.x} y={artifact.y} pattern={artifact.p} />
      ))}
      
      {/* Header */}
      <header className="border-b-2 border-black p-4 relative z-10" style={{ backgroundColor: '#7C8A7C' }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-4xl font-mono" style={{ 
              color: '#000',
              fontWeight: 400,
              letterSpacing: '2px',
              border: '2px solid #000',
              padding: '4px 8px',
              backgroundColor: '#7C8A7C',
            }}>
              ANIMA_v.0.9
            </div>
            <GhostText size={12} className="text-xs font-mono" style={{ color: '#1a2b1a', letterSpacing: '1px' }}>
              MEMORY LEAK DETECTED...
            </GhostText>
          </div>
          <nav className="flex gap-3 font-mono text-sm">
            <button
              onClick={() => setCurrentView('console')}
              className="px-3 py-1 border-2 transition-all font-mono text-sm"
              style={{
                borderColor: '#000',
                backgroundColor: currentView === 'console' ? '#000' : '#7C8A7C',
                color: currentView === 'console' ? '#7C8A7C' : '#000',
                borderBottomWidth: '4px',
                borderRightWidth: '4px',
              }}
            >
              [CONSOLE]
            </button>
            <button
              onClick={() => setCurrentView('symbollib')}
              className="px-3 py-1 border-2 transition-all font-mono text-sm"
              style={{
                borderColor: '#000',
                backgroundColor: currentView === 'symbollib' ? '#000' : '#7C8A7C',
                color: currentView === 'symbollib' ? '#7C8A7C' : '#000',
                borderBottomWidth: '4px',
                borderRightWidth: '4px',
              }}
            >
              [SYMBOL.LIB]
            </button>
            <button
              onClick={() => setCurrentView('constellation')}
              className="px-3 py-1 border-2 transition-all font-mono text-sm"
              style={{
                borderColor: '#000',
                backgroundColor: currentView === 'constellation' ? '#000' : '#7C8A7C',
                color: currentView === 'constellation' ? '#7C8A7C' : '#000',
                borderBottomWidth: '4px',
                borderRightWidth: '4px',
              }}
            >
              [CONSTELLATION]
            </button>
            <button
              onClick={() => setCurrentView('archive')}
              className="px-3 py-1 border-2 transition-all font-mono text-sm"
              style={{
                borderColor: '#000',
                backgroundColor: currentView === 'archive' ? '#000' : '#7C8A7C',
                color: currentView === 'archive' ? '#7C8A7C' : '#000',
                borderBottomWidth: '4px',
                borderRightWidth: '4px',
              }}
            >
              [ARCHIVE]
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-4 relative z-10" style={{ backgroundColor: '#7C8A7C' }}>
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

