'use client'

import { useState, useEffect } from 'react'
import CyberEsotericText from './CyberEsotericText'
import GhostText from './GhostText'

interface Node {
  id: string
  name: string
  category: string | null
  level: number
  occurrences: number
}

interface Edge {
  id: string
  source: string
  target: string
  strength: number
}

interface GraphData {
  nodes: Node[]
  edges: Edge[]
}

interface GridItem {
  id: string
  label: string
  type: 'symbol' | 'noise'
  size: number // 1 or 2 (1x1 or 2x2 cells)
  relations: string[] // IDs of connected symbols
  node?: Node // Original node data if type is 'symbol'
  strength?: number // Connection strength for relations
  x?: number // Random X position (0-100)
  y?: number // Random Y position (0-100)
}

// Generate noise items for background
const generateNoise = (count: number): GridItem[] => {
  const noisePatterns = ['0x4F', '::', '//', '0x2A', '[]', '{}', '0x7E', '~~', '++', '--', '0x5C', '||']
  const noise: GridItem[] = []
  
  for (let i = 0; i < count; i++) {
    noise.push({
      id: `noise-${i}`,
      label: noisePatterns[i % noisePatterns.length],
      type: 'noise',
      size: 1,
      relations: [],
    })
  }
  
  return noise
}

export default function ConstellationGraph() {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [] })
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [gridItems, setGridItems] = useState<GridItem[]>([])
  const [categoryFilter, setCategoryFilter] = useState<Set<string | null>>(new Set(['NATURE', 'PERSONA', 'SHADOW', 'SACRED', null])) // All categories visible

  useEffect(() => {
    fetchGraphData()
  }, [])

  const fetchGraphData = async () => {
    try {
      const response = await fetch('/api/symbols/connections')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (!data.nodes || !data.edges) {
        console.error('Invalid data format:', data)
        setGraphData({ nodes: [], edges: [] })
        return
      }
      
      setGraphData(data)
      buildGrid(data.nodes, data.edges)
    } catch (error) {
      console.error('Error fetching graph data:', error)
      setGraphData({ nodes: [], edges: [] })
    } finally {
      setLoading(false)
    }
  }

  const buildGrid = (nodes: Node[], edges: Edge[]) => {
    // Create symbol items
    const symbolItems: GridItem[] = nodes.map((node) => {
      // Find all connected nodes
      const relations: string[] = []
      edges.forEach((edge) => {
        if (edge.source === node.id) {
          relations.push(edge.target)
        } else if (edge.target === node.id) {
          relations.push(edge.source)
        }
      })

      // Size based on occurrences and level (more occurrences = bigger)
      const size = node.occurrences >= 5 || node.level >= 4 ? 2 : 1

      return {
        id: node.id,
        label: node.name,
        type: 'symbol' as const,
        size,
        relations,
        node,
      }
    })

    // Generate noise items (less noise for cleaner look)
    const noiseItems = generateNoise(Math.floor(symbolItems.length * 0.3))
    
    // Combine and shuffle for organic look
    const allItems = [...symbolItems, ...noiseItems]
    
    // Shuffle array for random distribution
    for (let i = allItems.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allItems[i], allItems[j]] = [allItems[j], allItems[i]]
    }
    
    // Assign random positions to each item
    allItems.forEach(item => {
      item.x = Math.random() * 95 // 0-95% to avoid edge clipping
      item.y = Math.random() * 95
    })
    
    setGridItems(allItems)
  }

  const getCategoryColor = (category: string | null, isSelected: boolean): string => {
    switch (category) {
      case 'NATURE':
        return isSelected ? '#1a3d1a' : '#2d5d2d' // Ciemnozielony
      case 'PERSONA':
        return isSelected ? '#4d3d1a' : '#5d4d2d' // Brązowo-żółty
      case 'SHADOW':
        return isSelected ? '#000' : '#1a1a1a' // Czarny
      case 'SACRED':
        return isSelected ? '#2d4d3d' : '#3d5d4d' // Szaro-zielony
      default:
        return isSelected ? '#000' : '#1a2b1a' // Domyślny szary
    }
  }

  const shouldUseGhost = (category: string | null): boolean => {
    // SHADOW i SACRED mają efekt ghost
    return category === 'SHADOW' || category === 'SACRED'
  }

  // Get opacity based on selection state
  const getOpacity = (item: GridItem): number => {
    if (!selectedId) return 1 // Nothing selected -> everything visible
    
    if (item.type === 'noise') return 0.1 // Noise always dims on focus
    
    if (item.id === selectedId) return 1 // Selected -> full brightness
    
    const selectedItem = gridItems.find(i => i.id === selectedId)
    if (selectedItem && selectedItem.relations.includes(item.id)) {
      return 0.8 // Related -> bright
    }
    
    return 0.1 // Rest -> dimmed
  }

  // Get border color based on selection state
  const getBorderColor = (item: GridItem): string => {
    if (item.id === selectedId) return '#FFFFFF' // Selected = White
    
    const selectedItem = gridItems.find(i => i.id === selectedId)
    if (selectedItem && selectedItem.relations.includes(item.id)) {
      return '#33FF00' // Related = Green
    }
    
    return '#112211' // Default = Dark
  }

  // Get connection info for status bar
  const getConnectionInfo = (): string => {
    if (!selectedId) return 'SELECT BLOCK TO DECRYPT'
    
    const selectedItem = gridItems.find(i => i.id === selectedId)
    if (!selectedItem || selectedItem.type === 'noise') return 'NO DATA'
    
    const relations = selectedItem.relations
    if (relations.length === 0) return `FOCUS: [${selectedItem.label.toUpperCase()}] NO RELATIONS DETECTED`
    
    // Get relation details from edges
    const relationDetails: string[] = []
    graphData.edges.forEach((edge) => {
      const otherId = edge.source === selectedId ? edge.target : edge.target === selectedId ? edge.source : null
      if (otherId && relations.includes(otherId)) {
        const relatedNode = graphData.nodes.find(n => n.id === otherId)
        if (relatedNode) {
          const strengthPercent = Math.round((edge.strength / 5) * 100)
          relationDetails.push(`${relatedNode.name.toUpperCase()} (${strengthPercent}%)`)
        }
      }
    })
    
    return `FOCUS: [${selectedItem.label.toUpperCase()}] RELATIONS: ${relationDetails.join(', ')}`
  }

  if (loading) {
    return (
      <div className="border-2 border-black p-6" style={{ backgroundColor: '#7C8A7C' }}>
        <CyberEsotericText stability={0.85} className="font-mono text-base" style={{ color: '#000' }}>
          &gt; LOADING MEMORY DUMP... <span className="cursor-blink">_</span>
        </CyberEsotericText>
      </div>
    )
  }

  if (gridItems.length === 0) {
    return (
      <div className="border-2 border-black p-6" style={{ backgroundColor: '#7C8A7C' }}>
        <CyberEsotericText stability={0.9} className="font-mono text-base" style={{ color: '#000' }}>
          &gt; NO DATA FOUND. ANALYZE MORE ENTRIES TO BUILD MEMORY DUMP.
        </CyberEsotericText>
      </div>
    )
  }

  const selectedItem = gridItems.find(i => i.id === selectedId)

  return (
    <div className="space-y-4 fade-in-blur">
      {/* Header */}
      <div className="border-2 border-black p-4 mb-4" style={{ backgroundColor: '#7C8A7C' }}>
        <GhostText size={14} className="font-mono text-sm mb-4" style={{ color: '#000' }}>
          {getConnectionInfo()}
        </GhostText>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 text-xs">
          <GhostText size={12} className="font-mono" style={{ color: '#1a2b1a', letterSpacing: '1px' }}>
            CATEGORIES:
          </GhostText>
          {(['NATURE', 'PERSONA', 'SHADOW', 'SACRED', null] as const).map((cat) => {
            const isVisible = categoryFilter.has(cat)
            return (
              <button
                key={cat || 'UNKNOWN'}
                onClick={() => {
                  const newFilter = new Set(categoryFilter)
                  if (isVisible) {
                    newFilter.delete(cat)
                  } else {
                    newFilter.add(cat)
                  }
                  setCategoryFilter(newFilter)
                }}
                className="px-2 py-1 border-2 border-black font-mono text-xs transition-all"
                style={{
                  borderColor: '#000',
                  backgroundColor: isVisible ? '#000' : '#7C8A7C',
                  color: isVisible ? '#7C8A7C' : '#000',
                  borderBottomWidth: isVisible ? '4px' : '2px',
                  borderRightWidth: isVisible ? '4px' : '2px',
                }}
              >
                {cat || 'UNKNOWN'}
              </button>
            )
          })}
        </div>
      </div>

      {/* Scattered Words */}
      <div className="overflow-hidden relative fade-in-blur" style={{ height: '600px', backgroundColor: 'transparent' }}>
        {gridItems
          .filter((item) => {
            // Filter by category - show noise always, symbols only if category is visible
            if (item.type === 'noise') return true
            if (!item.node) return false
            return categoryFilter.has(item.node.category)
          })
          .map((item) => {
            const isBig = item.size === 2
            const isSelected = item.id === selectedId
            const opacity = getOpacity(item)
            
            if (item.type === 'noise') {
              return (
                <div
                  key={item.id}
                  className="absolute cursor-pointer transition-all duration-300 font-mono"
                  style={{
                    left: `${item.x || 50}%`,
                    top: `${item.y || 50}%`,
                    transform: 'translate(-50%, -50%)',
                    fontSize: '14px',
                    color: '#1a2b1a',
                    opacity: opacity * 0.5,
                    zIndex: 1,
                  }}
                >
                  {item.label}
                </div>
              )
            }
            
            // Symbol with category styling
            const category = item.node?.category || null
            const categoryColor = getCategoryColor(category, isSelected)
            const useGhost = shouldUseGhost(category)
            
            const textContent = `[${item.label.toUpperCase()}]`
            
            if (useGhost) {
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedId(item.id === selectedId ? null : item.id)
                  }}
                  className="absolute cursor-pointer transition-all duration-300 font-mono"
                  style={{
                    left: `${item.x || 50}%`,
                    top: `${item.y || 50}%`,
                    transform: 'translate(-50%, -50%)',
                    fontSize: isBig ? '24px' : '16px',
                    fontWeight: isSelected ? 'bold' : 'normal',
                    opacity,
                    zIndex: isSelected ? 10 : (selectedItem && selectedItem.relations.includes(item.id) ? 5 : 1),
                  }}
                >
                  <GhostText size={isBig ? 24 : 16} style={{ color: categoryColor }}>
                    {textContent}
                  </GhostText>
                </div>
              )
            }
            
            return (
              <div
                key={item.id}
                onClick={() => {
                  setSelectedId(item.id === selectedId ? null : item.id)
                }}
                className="absolute cursor-pointer transition-all duration-300 font-mono"
                style={{
                  left: `${item.x || 50}%`,
                  top: `${item.y || 50}%`,
                  transform: 'translate(-50%, -50%)',
                  fontSize: isBig ? '24px' : '16px',
                  color: categoryColor,
                  fontWeight: isSelected ? 'bold' : 'normal',
                  opacity,
                  zIndex: isSelected ? 10 : (selectedItem && selectedItem.relations.includes(item.id) ? 5 : 1),
                }}
              >
                {textContent}
              </div>
            )
          })}
      </div>

      {/* Status bar */}
      {selectedId && selectedItem && selectedItem.type === 'symbol' && (
        <div className="border-2 border-black p-4" style={{ backgroundColor: '#7C8A7C' }}>
          <CyberEsotericText stability={0.7} className="font-mono text-lg mb-3" style={{ color: '#000' }}>
            &gt; {selectedItem.label.toUpperCase()}
          </CyberEsotericText>
          <GhostText size={12} className="text-xs font-mono mb-4" style={{ color: '#1a2b1a', letterSpacing: '1px' }}>
            CATEGORY: {selectedItem.node?.category || 'UNKNOWN'} | LEVEL: {selectedItem.node?.level || 1} | OCCURRENCES: {selectedItem.node?.occurrences || 0}
          </GhostText>
          {selectedItem.relations.length > 0 && (
            <div className="mt-4 pt-4 border-t-2 border-black">
              <GhostText size={12} className="text-xs font-mono mb-3" style={{ color: '#1a2b1a', letterSpacing: '1px' }}>
                CONNECTED SYMBOLS:
              </GhostText>
              <div className="flex flex-wrap gap-2">
                {selectedItem.relations.map((relId) => {
                  const relatedNode = graphData.nodes.find(n => n.id === relId)
                  const edge = graphData.edges.find(
                    e => (e.source === selectedId && e.target === relId) || (e.target === selectedId && e.source === relId)
                  )
                  if (!relatedNode) return null
                  
                  const relatedColor = getCategoryColor(relatedNode.category, false)
                  const relatedUseGhost = shouldUseGhost(relatedNode.category)
                  
                  return (
                    <span
                      key={relId}
                      className="px-2 py-1 font-mono text-xs"
                          style={{ 
                        color: relatedColor,
                      }}
                    >
                      {relatedUseGhost ? (
                        <GhostText size={12} style={{ color: relatedColor }}>
                          {relatedNode.name} ({edge ? edge.strength : '?'}x)
                        </GhostText>
                      ) : (
                        `${relatedNode.name} (${edge ? edge.strength : '?'}x)`
                      )}
                    </span>
                  )
                })}
                    </div>
                  </div>
                )}
        </div>
      )}

      <GhostText size={12} className="text-xs font-mono" style={{ color: '#1a2b1a' }}>
        &gt; CLICK SYMBOL TO FOCUS | CLICK AGAIN TO DESELECT
      </GhostText>
    </div>
  )
}
