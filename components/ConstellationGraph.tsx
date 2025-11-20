'use client'

import { useState, useEffect } from 'react'

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

  const getCategoryColor = (category: string | null): string => {
    switch (category) {
      case 'NATURE':
        return '#33FF00' // Terminal green
      case 'PERSONA':
        return '#FFB000' // Amber
      case 'SHADOW':
        return '#FF3333' // Error red
      case 'SACRED':
        return '#00FFFF' // Cyan
      default:
        return '#888888' // Gray
    }
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
      <div className="border border-terminal-green/30 p-6">
        <div className="text-terminal-green/60">
          &gt; LOADING MEMORY DUMP... <span className="cursor-blink">_</span>
        </div>
      </div>
    )
  }

  if (gridItems.length === 0) {
    return (
      <div className="border border-terminal-green/30 p-6 text-terminal-green/60">
        &gt; NO DATA FOUND. ANALYZE MORE ENTRIES TO BUILD MEMORY DUMP.
      </div>
    )
  }

  const selectedItem = gridItems.find(i => i.id === selectedId)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="border-b border-terminal-green/30 pb-3">
        <div className="text-[#FFB000] font-vt323 text-sm mb-3">
          {getConnectionInfo()}
        </div>
        
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="text-terminal-green/60">CATEGORIES:</span>
          {(['NATURE', 'PERSONA', 'SHADOW', 'SACRED', null] as const).map((cat) => {
            const isVisible = categoryFilter.has(cat)
            const color = cat ? getCategoryColor(cat) : '#888888'
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
                className="px-2 py-1 border transition-colors"
                style={{
                  borderColor: isVisible ? color : color + '40',
                  backgroundColor: isVisible ? color + '10' : 'transparent',
                  color: isVisible ? color : color + '60',
                }}
              >
                {cat || 'UNKNOWN'}
              </button>
            )
          })}
        </div>
      </div>
          
      {/* Scattered Words */}
      <div className="bg-true-black overflow-hidden relative" style={{ height: '600px' }}>
        {gridItems
          .filter((item) => {
            // Filter by category - show noise always, symbols only if category is visible
            if (item.type === 'noise') return true
            if (!item.node) return false
            return categoryFilter.has(item.node.category)
          })
          .map((item) => {
            const isBig = item.size === 2
            const color = item.type === 'symbol' && item.node 
              ? getCategoryColor(item.node.category) 
              : '#1a441a'
            
            return (
              <div
                key={item.id}
                onClick={() => {
                  if (item.type === 'symbol') {
                    setSelectedId(item.id === selectedId ? null : item.id)
                  }
                }}
                className="absolute cursor-pointer transition-all duration-200 font-vt323"
                style={{
                  left: `${item.x || 50}%`,
                  top: `${item.y || 50}%`,
                  transform: 'translate(-50%, -50%)',
                  fontSize: isBig ? '24px' : '16px',
                  color: item.id === selectedId ? '#FFFFFF' : (item.type === 'noise' ? '#1a441a' : color),
                  fontWeight: item.id === selectedId ? 'bold' : 'normal',
                  opacity: getOpacity(item),
                  textShadow: item.id === selectedId ? '0 0 10px currentColor' : 'none',
                  zIndex: item.id === selectedId ? 10 : (selectedItem && selectedItem.relations.includes(item.id) ? 5 : 1),
                }}
              >
                {item.type === 'symbol' ? `[${item.label.toUpperCase()}]` : item.label}
              </div>
            )
          })}
      </div>

      {/* Status bar */}
      {selectedId && selectedItem && selectedItem.type === 'symbol' && (
        <div className="border border-terminal-green/30 p-4 bg-true-black">
          <div className="text-terminal-green font-vt323 text-lg mb-2">
            &gt; {selectedItem.label.toUpperCase()}
          </div>
          <div className="text-terminal-green/60 text-xs font-mono">
            CATEGORY: {selectedItem.node?.category || 'UNKNOWN'} | LEVEL: {selectedItem.node?.level || 1} | OCCURRENCES: {selectedItem.node?.occurrences || 0}
          </div>
          {selectedItem.relations.length > 0 && (
            <div className="mt-3 pt-3 border-t border-terminal-green/20">
              <div className="text-terminal-green/60 text-xs mb-2">CONNECTED SYMBOLS:</div>
              <div className="flex flex-wrap gap-2">
                {selectedItem.relations.map((relId) => {
                  const relatedNode = graphData.nodes.find(n => n.id === relId)
                  const edge = graphData.edges.find(
                    e => (e.source === selectedId && e.target === relId) || (e.target === selectedId && e.source === relId)
                  )
                  if (!relatedNode) return null
                  
                  return (
                    <span
                      key={relId}
                      className="px-2 py-1 border border-terminal-green/30 bg-terminal-green/5 text-terminal-green text-xs"
                    >
                      {relatedNode.name} ({edge ? edge.strength : '?'}x)
                    </span>
                  )
                })}
                    </div>
                  </div>
                )}
        </div>
      )}

      <div className="text-terminal-green/40 text-xs font-mono">
        &gt; CLICK SYMBOL TO FOCUS | CLICK AGAIN TO DESELECT
      </div>
    </div>
  )
}
