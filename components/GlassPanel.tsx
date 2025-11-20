'use client'

interface GlassPanelProps {
  children: React.ReactNode
  intensity?: number
  className?: string
  onClick?: () => void
}

export default function GlassPanel({ children, intensity = 20, className = '', onClick }: GlassPanelProps) {
  return (
    <div 
      className={`glass-panel ${className}`}
      onClick={onClick}
      style={{
        backdropFilter: `blur(${intensity}px)`,
        WebkitBackdropFilter: `blur(${intensity}px)`,
      }}
    >
      {children}
    </div>
  )
}

