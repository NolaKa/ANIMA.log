'use client'

import { useState } from 'react'

interface RedactedTextProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export default function RedactedText({ children, className = '', style }: RedactedTextProps) {
  const [isRevealed, setIsRevealed] = useState(false)
  const text = typeof children === 'string' ? children : String(children)
  
  return (
    <div
      className={className}
      style={{
        position: 'relative',
        cursor: 'pointer',
        userSelect: 'none',
        ...style
      }}
      onMouseDown={() => setIsRevealed(true)}
      onMouseUp={() => setIsRevealed(false)}
      onMouseLeave={() => setIsRevealed(false)}
      onTouchStart={() => setIsRevealed(true)}
      onTouchEnd={() => setIsRevealed(false)}
    >
      {isRevealed ? (
        <div>{children}</div>
      ) : (
        <div
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backgroundImage: `
              repeating-linear-gradient(
                45deg,
                transparent,
                transparent 2px,
                rgba(255, 255, 255, 0.1) 2px,
                rgba(255, 255, 255, 0.1) 4px
              )
            `,
            color: 'transparent',
            userSelect: 'none',
            minHeight: '1.2em',
          }}
        >
          {text.replace(/./g, '█')}
        </div>
      )}
    </div>
  )
}

