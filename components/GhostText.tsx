'use client'

interface GhostTextProps {
  children: React.ReactNode
  size?: number
  className?: string
  style?: React.CSSProperties
}

export default function GhostText({ children, size = 16, className = '', style }: GhostTextProps) {
  const text = typeof children === 'string' ? children : String(children)
  return (
    <span 
      className={`ghost-text ${className}`}
      data-text={text}
      style={{
        fontSize: `${size}px`,
        color: '#000',
        position: 'relative',
        ...style
      }}
    >
      {children}
    </span>
  )
}

