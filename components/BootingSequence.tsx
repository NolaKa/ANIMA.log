'use client'

import { useState, useEffect } from 'react'

export default function BootingSequence() {
  const [lines, setLines] = useState<string[]>([])
  const [currentLine, setCurrentLine] = useState(0)

  const bootMessages = [
    'INITIALIZING ANIMA.log SYSTEM...',
    'LOADING JUNGIAN ARCHETYPES...',
    'CONNECTING TO COLLECTIVE UNCONSCIOUS...',
    'SCANNING FOR SYMBOLS...',
    'READY.',
    '',
    '> WELCOME TO ANIMA.log',
    '> ENTER YOUR DREAMS. UPLOAD YOUR IMAGES.',
    '> THE SHADOW AWAITS.',
  ]

  useEffect(() => {
    if (currentLine < bootMessages.length) {
      const timer = setTimeout(() => {
        setLines([...lines, bootMessages[currentLine]])
        setCurrentLine(currentLine + 1)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [currentLine, lines])

  return (
    <div className="min-h-screen bg-true-black text-terminal-green font-jetbrains p-8 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        {lines.map((line, index) => (
          <div key={index} className="mb-1">
            {line}
            {index === lines.length - 1 && <span className="cursor-blink">_</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

