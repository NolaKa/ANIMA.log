'use client'

interface HallucinationTextProps {
  children: React.ReactNode
  intensity?: number
  className?: string
  style?: React.CSSProperties
}

export default function HallucinationText({ 
  children, 
  intensity = 1, 
  className = '',
  style 
}: HallucinationTextProps) {
  const text = typeof children === 'string' ? children : String(children)
  const isString = typeof children === 'string'
  
  return (
    <div className={`relative ${className}`} style={style}>
      {/* RGB Split - Red channel (left) */}
      {isString && (
        <div
          style={{
            position: 'absolute',
            left: -2 * intensity,
            top: 0,
            color: 'rgba(255, 0, 0, 0.7)',
            opacity: 0.8,
            pointerEvents: 'none',
            zIndex: 1,
            whiteSpace: 'pre',
          }}
        >
          {text}
        </div>
      )}
      
      {/* RGB Split - Cyan channel (right) */}
      {isString && (
        <div
          style={{
            position: 'absolute',
            left: 2 * intensity,
            top: 0,
            color: 'rgba(0, 255, 255, 0.7)',
            opacity: 0.8,
            pointerEvents: 'none',
            zIndex: 1,
            whiteSpace: 'pre',
          }}
        >
          {text}
        </div>
      )}
      
      {/* Ghost layer - delayed and shifted */}
      {isString && (
        <div
          style={{
            position: 'absolute',
            left: 4 * intensity,
            top: 2 * intensity,
            opacity: 0.4,
            pointerEvents: 'none',
            zIndex: 2,
            whiteSpace: 'pre',
          }}
        >
          {text}
        </div>
      )}
      
      {/* Main text */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        {children}
      </div>
    </div>
  )
}

