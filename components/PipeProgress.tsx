'use client'

interface PipeProgressProps {
  progress: number // 0-100
  className?: string
}

export default function PipeProgress({ progress, className = '' }: PipeProgressProps) {
  return (
    <div className={`flex items-center ${className}`} style={{ height: '20px' }}>
      {/* Pipe Start */}
      <div
        style={{
          width: '20px',
          height: '20px',
          borderRadius: '10px',
          border: '2px solid #000',
          backgroundColor: '#7C8A7C',
        }}
      />
      
      {/* Pipe Line */}
      <div
        style={{
          flex: 1,
          height: '14px',
          borderTop: '2px solid #000',
          borderBottom: '2px solid #000',
          backgroundColor: '#5a6b5a',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Pipe Fill - animated progress */}
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            backgroundColor: '#000',
            opacity: 0.3,
            transition: 'width 0.3s ease',
          }}
        />
        {/* Striped pattern */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(0,0,0,0.1) 4px, rgba(0,0,0,0.1) 8px)',
            pointerEvents: 'none',
          }}
        />
      </div>
      
      {/* Pipe End */}
      <div
        style={{
          width: '20px',
          height: '20px',
          border: '2px solid #000',
          backgroundColor: '#000',
        }}
      />
    </div>
  )
}

