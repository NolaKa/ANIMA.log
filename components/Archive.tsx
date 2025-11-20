'use client'

import { useState, useEffect } from 'react'
import { format, differenceInDays } from 'date-fns'
import { pl } from 'date-fns/locale'
import DitheredImage from './DitheredImage'
import DataDecay from './DataDecay'
import CyberEsotericText from './CyberEsotericText'
import GhostText from './GhostText'

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
      <div className="border-2 border-black p-6" style={{ backgroundColor: '#7C8A7C' }}>
        <CyberEsotericText stability={0.85} className="font-mono" style={{ color: '#000' }}>
          &gt; LOADING ARCHIVE... <span className="cursor-blink">_</span>
        </CyberEsotericText>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <GhostText size={14} className="mb-4 text-sm font-mono" style={{ color: '#1a2b1a' }}>
        &gt; ARCHIVE - {entries.length} ENTRIES FOUND
      </GhostText>

      {entries.length === 0 ? (
        <div className="border-2 border-black p-6" style={{ backgroundColor: '#7C8A7C', color: '#000' }}>
          <CyberEsotericText stability={0.9} className="font-mono">
            &gt; NO ENTRIES FOUND. START LOGGING.
          </CyberEsotericText>
        </div>
      ) : (
        entries.map((entry) => {
          const entryDate = new Date(entry.timestamp)
          const ageInDays = differenceInDays(new Date(), entryDate)
          
          return (
            <div 
              key={entry.id} 
              className="border-2 border-black p-4 cursor-pointer" 
              style={{ 
                backgroundColor: '#7C8A7C',
                borderBottomWidth: '4px',
                borderRightWidth: '4px',
              }}
              onClick={() => toggleExpand(entry.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <GhostText size={12} className="text-xs mb-1 font-mono" style={{ color: '#1a2b1a', letterSpacing: '1px' }}>
                    [{entry.type.toUpperCase()}] {format(entryDate, 'dd.MM.yyyy HH:mm', { locale: pl })}
                  </GhostText>
                  <GhostText size={14} className="text-sm font-mono" style={{ color: '#000' }}>
                    {entry.type === 'text' 
                      ? (entry.contentText || entry.content || '').substring(0, 100) + ((entry.contentText || entry.content || '').length > 100 ? '...' : '')
                      : '[IMAGE]'}
                  </GhostText>
                  {entry.dominantArchetype && (
                    <GhostText size={12} className="mt-2 text-xs font-mono" style={{ color: '#1a2b1a' }}>
                      ARCHETYPE: {entry.dominantArchetype}
                    </GhostText>
                  )}
                </div>
                <div className="text-xs font-mono" style={{ color: '#000' }}>
                  {expandedId === entry.id ? '[-]' : '[+]'}
                </div>
              </div>

            {expandedId === entry.id && (
              <div className="mt-4 pt-4 border-t-2 border-black space-y-3">
                {entry.type === 'image' && entry.imageUrl && (
                  <div className="border-2 border-black p-2" style={{ backgroundColor: '#5a6b5a' }}>
                    <DitheredImage
                      src={entry.imageUrl}
                      alt="Entry"
                      className="max-w-full max-h-96"
                    />
                  </div>
                )}
                {entry.type === 'text' && entry.contentText && (
                  <div>
                    <GhostText size={12} className="text-xs font-mono mb-1" style={{ color: '#1a2b1a', letterSpacing: '1px' }}>CONTENT:</GhostText>
                    <GhostText size={14} className="mt-1 text-sm font-mono whitespace-pre-wrap" style={{ color: '#000' }}>
                      {entry.contentText}
                    </GhostText>
                  </div>
                )}
                {entry.detectedSymbols.length > 0 && (
                  <div>
                    <GhostText size={12} className="text-xs font-mono" style={{ color: '#1a2b1a' }}>SYMBOLS: </GhostText>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {entry.detectedSymbols.map((symbol, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 border-2 border-black text-xs font-mono"
                          style={{ backgroundColor: '#7C8A7C', color: '#000' }}
                        >
                          {symbol}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {entry.visualMood && (
                  <div>
                    <GhostText size={12} className="text-xs font-mono" style={{ color: '#1a2b1a' }}>VISUAL_MOOD:</GhostText>
                    <GhostText size={14} className="mt-1 italic text-sm" style={{ color: '#000' }}>
                      {entry.visualMood}
                    </GhostText>
                  </div>
                )}
                <div>
                  <GhostText size={12} className="text-xs font-mono" style={{ color: '#1a2b1a' }}>ANALYSIS_LOG:</GhostText>
                  <GhostText size={14} className="mt-1 text-sm font-mono whitespace-pre-wrap" style={{ color: '#000' }}>
                    {entry.analysisLog}
                  </GhostText>
                </div>
                <div>
                  <GhostText size={12} className="text-xs font-mono" style={{ color: '#000' }}>REFLECTION_QUESTION:</GhostText>
                  <GhostText size={14} className="mt-1 font-bold text-sm font-mono" style={{ color: '#000' }}>
                    {entry.reflectionQuestion}
                  </GhostText>
                </div>
                <div className="pt-2 border-t-2 border-black">
                  <button
                    onClick={(e) => handleDeleteClick(entry.id, e)}
                    className="px-4 py-2 border-2 border-black font-mono text-sm transition-colors"
                    style={{ 
                      backgroundColor: '#000',
                      color: '#7C8A7C',
                      borderBottomWidth: '4px',
                      borderRightWidth: '4px',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#1a2b1a'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#000'
                    }}
                  >
                    [DELETE ENTRY]
                  </button>
                </div>
              </div>
            )}
          </div>
          )
        })
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
          onClick={handleDeleteCancel}
        >
          <div 
            className="border-4 border-black p-6 max-w-md w-full mx-4"
            style={{ backgroundColor: '#7C8A7C' }}
            onClick={(e) => e.stopPropagation()}
          >
            <CyberEsotericText stability={0.85} className="font-mono text-xl mb-4" style={{ color: '#000' }}>
              &gt; DELETE CONFIRMATION
            </CyberEsotericText>
            <div className="font-mono text-sm mb-6" style={{ color: '#000' }}>
              Are you sure you want to delete this entry?<br/>
              This operation cannot be undone.
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 px-4 py-3 border-2 border-black font-mono text-lg transition-colors"
                style={{ 
                  backgroundColor: '#000',
                  color: '#7C8A7C',
                  borderBottomWidth: '4px',
                  borderRightWidth: '4px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1a2b1a'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#000'
                }}
              >
                [CONFIRM DELETE]
              </button>
              <button
                onClick={handleDeleteCancel}
                className="flex-1 px-4 py-3 border-2 border-black font-mono text-lg transition-colors"
                style={{ 
                  backgroundColor: '#7C8A7C',
                  color: '#000',
                  borderBottomWidth: '4px',
                  borderRightWidth: '4px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#5a6b5a'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#7C8A7C'
                }}
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

