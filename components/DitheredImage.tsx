'use client'

import { useEffect, useRef, useState } from 'react'

interface DitheredImageProps {
  src: string
  alt?: string
  className?: string
}

export default function DitheredImage({ src, alt, className }: DitheredImageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [processedSrc, setProcessedSrc] = useState<string | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    img.onload = () => {
      // Set canvas size
      const maxWidth = 800
      const maxHeight = 600
      let { width, height } = img

      // Scale down if too large
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width = width * ratio
        height = height * ratio
      }

      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Draw image
      ctx.drawImage(img, 0, 0, width, height)

      // Get image data
      const imageData = ctx.getImageData(0, 0, width, height)
      const data = imageData.data

      // Convert to grayscale and apply 1-bit dithering (Floyd-Steinberg)
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]
        
        // Convert to grayscale
        const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b)
        
        // 1-bit threshold (128)
        const newValue = gray > 128 ? 255 : 0
        const error = gray - newValue

        // Set pixel
        data[i] = newValue
        data[i + 1] = newValue
        data[i + 2] = newValue

        // Floyd-Steinberg dithering
        if (i + 4 < data.length) {
          data[i + 4] = Math.max(0, Math.min(255, data[i + 4] + error * 7 / 16))
        }
        if (i + 4 * (width - 1) < data.length) {
          data[i + 4 * (width - 1)] = Math.max(0, Math.min(255, data[i + 4 * (width - 1)] + error * 3 / 16))
        }
        if (i + 4 * width < data.length) {
          data[i + 4 * width] = Math.max(0, Math.min(255, data[i + 4 * width] + error * 5 / 16))
        }
        if (i + 4 * (width + 1) < data.length) {
          data[i + 4 * (width + 1)] = Math.max(0, Math.min(255, data[i + 4 * (width + 1)] + error * 1 / 16))
        }
      }

      // Put modified image data back
      ctx.putImageData(imageData, 0, 0)

      // Convert to data URL
      setProcessedSrc(canvas.toDataURL())
    }

    img.src = src
  }, [src])

  if (!processedSrc) {
    return (
      <div className={`${className} bg-true-black border-2 border-terminal-green flex items-center justify-center`}>
        <div className="text-terminal-green/60 font-vt323">PROCESSING...</div>
      </div>
    )
  }

  return (
    <div className="relative inline-block">
      <img
        src={processedSrc}
        alt={alt}
        className={`${className} block`}
        style={{
          imageRendering: 'crisp-edges',
        }}
      />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}

