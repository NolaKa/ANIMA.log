'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'
import DitheredImage from './DitheredImage'

interface Entry {
  id: string
  timestamp: string
  type: string
  content: string
  contentText: string | null
  imageUrl: string | null
  detectedSymbols: string[]
  dominantArchetype: string | null
  visualMood: string | null
  analysisLog: string
  reflectionQuestion: string
  aiAnalysis: any | null
}

export default function Archive() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  useEffect(() => {
    fetchEntries()
  }, [])

  const fetchEntries = async () => {
    try {
      const response = await fetch('/api/entries')
      const data = await response.json()
      setEntries(data)
    } catch (error) {
      console.error('Error fetching entries:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent expanding/collapsing when clicking delete
    setDeleteConfirmId(id)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmId) return

    try {
      const response = await fetch(`/api/entries/${deleteConfirmId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete entry')
      }

      // Remove entry from local state
      setEntries(entries.filter(entry => entry.id !== deleteConfirmId))
      
      // Close expanded view if this entry was expanded
      if (expandedId === deleteConfirmId) {
        setExpandedId(null)
      }

      // Close confirmation modal
      setDeleteConfirmId(null)
    } catch (error) {
      console.error('Error deleting entry:', error)
      setDeleteConfirmId(null)
      // You can add a custom error message here if needed
    }
  }

  const handleDeleteCancel = () => {
    setDeleteConfirmId(null)
  }

  if (loading) {
    return (
      <div className="border border-terminal-green/30 p-6">
        <div className="text-terminal-green/60">
          &gt; LOADING ARCHIVE... <span className="cursor-blink">_</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="mb-4 text-terminal-green/60 text-sm">
        &gt; ARCHIVE - {entries.length} ENTRIES FOUND
      </div>

      {entries.length === 0 ? (
        <div className="border border-terminal-green/30 p-6 text-terminal-green/60">
          &gt; NO ENTRIES FOUND. START LOGGING.
        </div>
      ) : (
        entries.map((entry) => (
          <div
            key={entry.id}
            className="border border-terminal-green/20 p-4 
                     hover:border-terminal-green/40 transition-colors
                     cursor-pointer"
            onClick={() => toggleExpand(entry.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-terminal-green/60 text-xs mb-1">
                  [{entry.type.toUpperCase()}] {format(new Date(entry.timestamp), 'dd.MM.yyyy HH:mm', { locale: pl })}
                </div>
                <div className="text-terminal-green text-sm font-mono">
                  {entry.type === 'text' 
                    ? (entry.contentText || entry.content || '').substring(0, 100) + ((entry.contentText || entry.content || '').length > 100 ? '...' : '')
                    : '[IMAGE]'}
                </div>
                {entry.dominantArchetype && (
                  <div className="mt-2 text-terminal-amber text-xs">
                    ARCHETYPE: {entry.dominantArchetype}
                  </div>
                )}
              </div>
              <div className="text-terminal-green/30 text-xs">
                {expandedId === entry.id ? '[-]' : '[+]'}
              </div>
            </div>

            {expandedId === entry.id && (
              <div className="mt-4 pt-4 border-t border-terminal-green/20 space-y-3">
                {entry.type === 'image' && entry.imageUrl && (
                  <div className="border-2 border-terminal-green p-2">
                    <DitheredImage
                      src={entry.imageUrl}
                      alt="Entry"
                      className="max-w-full max-h-96"
                    />
                  </div>
                )}
                {entry.type === 'text' && entry.contentText && (
                  <div>
                    <span className="text-terminal-green/60 text-xs">CONTENT:</span>
                    <div className="mt-1 text-terminal-green text-sm font-mono whitespace-pre-wrap">
                      {entry.contentText}
                    </div>
                  </div>
                )}
                {entry.detectedSymbols.length > 0 && (
                  <div>
                    <span className="text-terminal-green/60 text-xs">SYMBOLS: </span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {entry.detectedSymbols.map((symbol, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 border border-terminal-green/30 
                                   bg-terminal-green/5 text-terminal-green text-xs"
                        >
                          {symbol}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {entry.visualMood && (
                  <div>
                    <span className="text-terminal-green/60 text-xs">VISUAL_MOOD:</span>
                    <div className="mt-1 text-terminal-green/80 italic text-sm">
                      {entry.visualMood}
                    </div>
                  </div>
                )}
                <div>
                  <span className="text-terminal-green/60 text-xs">ANALYSIS_LOG:</span>
                  <div className="mt-1 text-terminal-green text-sm font-mono whitespace-pre-wrap">
                    {entry.analysisLog}
                  </div>
                </div>
                <div>
                  <span className="text-error-red text-xs">REFLECTION_QUESTION:</span>
                  <div className="mt-1 text-error-red font-bold text-sm">
                    {entry.reflectionQuestion}
                  </div>
                </div>
                <div className="pt-2 border-t border-terminal-green/20">
                  <button
                    onClick={(e) => handleDeleteClick(entry.id, e)}
                    className="px-4 py-2 border-2 border-error-red/50 
                             text-error-red/80 hover:border-error-red 
                             hover:text-error-red hover:bg-error-red/10
                             font-vt323 text-sm transition-colors
                             active:bg-error-red/20"
                  >
                    [DELETE ENTRY]
                  </button>
                </div>
              </div>
            )}
          </div>
        ))
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div 
          className="fixed inset-0 bg-true-black/80 flex items-center justify-center z-50"
          onClick={handleDeleteCancel}
        >
          <div 
            className="border-4 border-error-red p-6 bg-true-black max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-error-red font-vt323 text-xl mb-4">
              &gt; DELETE CONFIRMATION
            </div>
            <div className="text-terminal-green/80 font-mono text-sm mb-6">
              Are you sure you want to delete this entry?<br/>
              This operation cannot be undone.
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 px-4 py-3 border-2 border-error-red 
                         bg-error-red/20 text-error-red hover:bg-error-red/30
                         font-vt323 text-lg transition-colors"
              >
                [CONFIRM DELETE]
              </button>
              <button
                onClick={handleDeleteCancel}
                className="flex-1 px-4 py-3 border-2 border-terminal-green/50 
                         bg-terminal-green/10 text-terminal-green hover:bg-terminal-green/20
                         font-vt323 text-lg transition-colors"
              >
                [CANCEL]
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

