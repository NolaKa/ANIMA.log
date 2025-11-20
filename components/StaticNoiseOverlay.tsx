'use client'

export default function StaticNoiseOverlay() {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999,
        opacity: 0.15,
      }}
    >
      {/* Scanlines */}
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: `${(i * 100) / 50}%`,
            left: 0,
            width: '100%',
            height: '1px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            opacity: Math.random() * 0.3,
          }}
        />
      ))}
      
      {/* Random noise dots */}
      {Array.from({ length: 100 }).map((_, i) => (
        <div
          key={`noise-${i}`}
          style={{
            position: 'absolute',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: '2px',
            height: '2px',
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            opacity: Math.random() * 0.5,
          }}
        />
      ))}
    </div>
  )
}

