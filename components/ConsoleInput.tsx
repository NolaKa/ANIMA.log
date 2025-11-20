'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import DitheredImage from './DitheredImage'
import CyberEsotericText from './CyberEsotericText'
import GhostText from './GhostText'
import BreathingElement from './BreathingElement'

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
    <div className="space-y-6 fade-in-blur">
      <div className="border-2 border-black p-6" style={{ backgroundColor: '#7C8A7C' }}>
        <GhostText size={14} className="mb-4 font-mono text-sm" style={{ color: '#1a2b1a', letterSpacing: '2px' }}>
          &gt; CONSOLE INPUT
        </GhostText>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-start gap-2">
            <GhostText size={18} className="mt-1 font-mono text-lg" style={{ color: '#000' }}>
              root@psyche:~$
            </GhostText>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="_"
              className="flex-1 bg-transparent font-mono 
                       border-none outline-none resize-none
                       text-lg leading-relaxed"
              style={{
                color: '#000',
                caretColor: '#000',
              }}
              rows={8}
              disabled={isAnalyzing}
            />
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              disabled
              title="Funkcja będzie wkrótce dostępna"
              className="px-4 py-3 border-2 border-terminal-green/30 
                       opacity-50 cursor-not-allowed
                       font-vt323 text-lg text-terminal-green/50
                       relative group"
            >
              [UPLOAD IMAGE]
              <span className="absolute -bottom-8 left-0 right-0 text-xs text-terminal-green/40 font-vt323 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                Wkrótce dostępne
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled
            />

            <BreathingElement intensity={0.03} duration={3000}>
              <button
                type="submit"
                disabled={isAnalyzing || (!input.trim() && !imagePreview)}
                className="px-6 py-3 font-mono text-lg
                         disabled:opacity-30 disabled:cursor-not-allowed
                         border-2 transition-all float"
                style={{
                  borderColor: '#000',
                  backgroundColor: isAnalyzing || (!input.trim() && !imagePreview) 
                    ? '#7C8A7C' 
                    : '#000',
                  color: isAnalyzing || (!input.trim() && !imagePreview) ? '#000' : '#7C8A7C',
                  borderBottomWidth: '4px',
                  borderRightWidth: '4px',
                }}
              >
                {isAnalyzing ? '[ANALYZING...]' : '[ EXECUTE ]'}
              </button>
            </BreathingElement>
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
        <div className="border-2 border-black p-6" style={{ backgroundColor: '#7C8A7C' }}>
          <CyberEsotericText stability={0.85} className="font-mono text-lg" style={{ color: '#000' }}>
            &gt; ANALYZING... <span className="cursor-blink">_</span>
          </CyberEsotericText>
        </div>
      )}

      {result && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="border-2 border-black p-6 space-y-6" style={{ backgroundColor: '#7C8A7C' }}>
            <GhostText size={16} className="font-mono mb-6" style={{ color: '#1a2b1a', letterSpacing: '1px' }}>
              &gt; ANALYSIS COMPLETE
            </GhostText>

            <div className="space-y-6">
              <div className="border-l-2 border-black pl-4">
                <GhostText size={12} className="text-xs font-mono mb-2" style={{ color: '#1a2b1a', letterSpacing: '1px' }}>
                  ANALYSIS_LOG:
                </GhostText>
                <GhostText size={18} className="font-mono whitespace-pre-wrap leading-relaxed" style={{ color: '#000' }}>
                  {result.analysis_log}
                </GhostText>
              </div>

              {result.detected_symbols.length > 0 && (
                <div>
                  <GhostText size={12} className="text-xs font-mono mb-3" style={{ color: '#1a2b1a', letterSpacing: '1px' }}>
                    SYMBOLS:
                  </GhostText>
                  <div className="flex flex-wrap gap-2">
                    {result.detected_symbols.map((symbol, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 border-2 border-black font-mono text-sm inline-block"
                        style={{
                          backgroundColor: '#7C8A7C',
                          color: '#000',
                        }}
                      >
                        <GhostText size={14} style={{ color: '#000' }}>
                          {symbol}
                        </GhostText>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <GhostText size={12} className="text-xs font-mono mb-2" style={{ color: '#1a2b1a', letterSpacing: '1px' }}>
                  ARCHETYPE:
                </GhostText>
                <GhostText size={30} className="font-mono text-3xl" style={{ color: '#000' }}>
                  {result.dominant_archetype}
                </GhostText>
              </div>

              {result.visual_mood && (
                <div>
                  <GhostText size={12} className="text-xs font-mono mb-2" style={{ color: '#1a2b1a', letterSpacing: '1px' }}>
                    VISUAL_MOOD:
                  </GhostText>
                  <GhostText size={16} className="italic" style={{ color: '#000' }}>
                    {result.visual_mood}
                  </GhostText>
                </div>
              )}

              <div className="border-l-2 border-black pl-4 mt-6">
                <GhostText size={12} className="text-xs font-mono mb-2" style={{ color: '#1a2b1a', letterSpacing: '1px' }}>
                  REFLECTION_QUESTION:
                </GhostText>
                <GhostText size={20} className="font-mono text-xl" style={{ color: '#000' }}>
                  {result.reflection_question}
                </GhostText>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

