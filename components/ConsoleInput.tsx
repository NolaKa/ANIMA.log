'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import DitheredImage from './DitheredImage'

interface AnalysisResult {
  analysis_log: string
  detected_symbols: string[]
  dominant_archetype: string
  reflection_question: string
  visual_mood: string
}

export default function ConsoleInput() {
  const [input, setInput] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() && !imagePreview) return

    setIsAnalyzing(true)
    setResult(null)

    try {
      let contentToAnalyze = input
      
      // If image, upload it first or use data URL
      if (imagePreview) {
        // For now, use data URL directly (base64)
        // In production, you might want to upload to a storage service
        contentToAnalyze = imagePreview
      }

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: imagePreview ? 'image' : 'text',
          content: contentToAnalyze,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`
        const errorDetails = errorData.details || ''
        console.error('API Error:', errorMessage, errorDetails)
        throw new Error(`${errorMessage}${errorDetails ? '\n\nSzczegóły: ' + errorDetails.substring(0, 200) : ''}`)
      }

      const data = await response.json()
      setResult(data)
      setInput('')
      setImagePreview(null)
    } catch (error) {
      console.error('Error analyzing:', error)
      const errorMessage = error instanceof Error ? error.message : 'Nieznany błąd'
      alert(`Błąd podczas analizy:\n\n${errorMessage}\n\nSprawdź konsolę przeglądarki (F12) dla więcej szczegółów.`)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="space-y-6">
      <div className="border-2 border-terminal-green p-6 bg-true-black">
        <div className="mb-4 text-terminal-green/60 font-vt323 text-lg">
          &gt; CONSOLE INPUT
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-start gap-2">
            <span className="text-terminal-green mt-1 font-vt323 text-xl">
              root@psyche:~$
            </span>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="_"
              className="flex-1 bg-true-black text-terminal-green font-vt323 
                       border-none outline-none resize-none
                       placeholder-terminal-green/50
                       focus:placeholder-terminal-green/20
                       text-xl leading-relaxed"
              rows={8}
              disabled={isAnalyzing}
            />
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-3 border-2 border-terminal-green 
                       hover:bg-terminal-green/10 hover:border-terminal-green
                       font-vt323 text-lg"
            >
              [UPLOAD IMAGE]
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            <button
              type="submit"
              disabled={isAnalyzing || (!input.trim() && !imagePreview)}
              className="px-6 py-3 bg-terminal-green text-true-black 
                       hover:bg-terminal-green/90
                       disabled:opacity-30 disabled:cursor-not-allowed
                       font-vt323 text-xl font-bold
                       border-0"
            >
              {isAnalyzing ? '[ANALYZING...]' : '[ EXECUTE ]'}
            </button>
          </div>

          {imagePreview && (
            <div className="mt-4 relative">
              <div className="text-terminal-green/60 font-vt323 text-base mb-2">PREVIEW:</div>
              <div className="relative inline-block border-2 border-terminal-green">
                <DitheredImage
                  src={imagePreview}
                  alt="Preview"
                  className="max-w-md max-h-64"
                />
              </div>
              <button
                type="button"
                onClick={() => setImagePreview(null)}
                className="mt-2 text-error-red font-vt323 text-base hover:text-error-red/80 border-2 border-error-red px-3 py-1"
              >
                [REMOVE]
              </button>
            </div>
          )}
        </form>
      </div>

      {isAnalyzing && (
        <div className="border-2 border-terminal-green p-6 bg-true-black">
          <div className="text-terminal-green font-vt323 text-xl">
            &gt; ANALYZING... <span className="cursor-blink">_</span>
          </div>
        </div>
      )}

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-l-4 border-terminal-green bg-true-black p-6 space-y-4 font-vt323"
        >
          <div className="text-terminal-green/60 text-lg mb-4">
            &gt; ANALYSIS COMPLETE
          </div>

          <div className="space-y-4">
            <div className="border-l-2 border-terminal-green pl-4">
              <div className="text-terminal-green/60 text-sm mb-1">ANALYSIS_LOG:</div>
              <div className="text-terminal-green whitespace-pre-wrap text-xl leading-relaxed">
                {result.analysis_log}
              </div>
            </div>

            {result.detected_symbols.length > 0 && (
              <div>
                <div className="text-terminal-green/60 text-sm mb-2">SYMBOLS:</div>
                <div className="flex flex-wrap gap-2">
                  {result.detected_symbols.map((symbol, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 border-2 border-terminal-green 
                               bg-terminal-green/10 text-terminal-green text-base"
                    >
                      {symbol}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="text-terminal-green/60 text-sm mb-1">ARCHETYPE:</div>
              <div className="text-terminal-amber text-2xl font-bold">
                {result.dominant_archetype}
              </div>
            </div>

            {result.visual_mood && (
              <div>
                <div className="text-terminal-green/60 text-sm mb-1">VISUAL_MOOD:</div>
                <div className="text-terminal-green/80 text-lg italic">
                  {result.visual_mood}
                </div>
              </div>
            )}

            <div className="border-l-2 border-error-red pl-4 mt-4">
              <div className="text-error-red text-sm mb-1">REFLECTION_QUESTION:</div>
              <div className="text-error-red text-xl font-bold">
                {result.reflection_question}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

