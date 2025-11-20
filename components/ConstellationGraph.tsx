'use client'

import { useState, useEffect, useRef } from 'react'

interface Node {
  id: string
  name: string
  category: string | null
  level: number
  occurrences: number
  x: number
  y: number
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

export default function ConstellationGraph() {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [] })
  const [loading, setLoading] = useState(true)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const svgRef = useRef<SVGSVGElement>(null)
  const isDragging = useRef(false)
  const dragStart = useRef({ x: 0, y: 0 })

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
      
      // Check if data has nodes and edges
      if (!data.nodes || !data.edges) {
        console.error('Invalid data format:', data)
        setGraphData({ nodes: [], edges: [] })
        return
      }
      
      // Simple force-directed layout: distribute nodes in a circle initially
      const nodeCount = data.nodes.length || 0
      
      if (nodeCount === 0) {
        setGraphData({ nodes: [], edges: [] })
        return
      }
      
      const radius = Math.min(400, Math.max(200, nodeCount * 20))
      const centerX = 400
      const centerY = 300
      
      const positionedNodes = data.nodes.map((node: Node, index: number) => {
        const angle = (2 * Math.PI * index) / nodeCount
        return {
          ...node,
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
        }
      })
      
      setGraphData({
        nodes: positionedNodes,
        edges: data.edges || [],
      })
    } catch (error) {
      console.error('Error fetching graph data:', error)
      setGraphData({ nodes: [], edges: [] })
    } finally {
      setLoading(false)
    }
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

  const getNodeSize = (level: number): number => {
    return 8 + level * 4 // Level 1 = 12px, Level 5 = 28px
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      isDragging.current = true
      dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y }
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging.current) {
      setPan({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y,
      })
    }
  }

  const handleMouseUp = () => {
    isDragging.current = false
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setZoom((prev) => Math.max(0.5, Math.min(2, prev * delta)))
  }

  if (loading) {
    return (
      <div className="border border-terminal-green/30 p-6">
        <div className="text-terminal-green/60">
          &gt; LOADING CONSTELLATION... <span className="cursor-blink">_</span>
        </div>
      </div>
    )
  }

  if (graphData.nodes.length === 0) {
    return (
      <div className="border border-terminal-green/30 p-6 text-terminal-green/60">
        &gt; NO CONNECTIONS FOUND. ANALYZE MORE ENTRIES TO BUILD CONSTELLATION.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="text-terminal-green/60 text-sm">
          &gt; CONSTELLATION - {graphData.nodes.length} NODES, {graphData.edges.length} CONNECTIONS
        </div>
        <div className="flex gap-2 text-xs text-terminal-green/60">
          <button
            onClick={() => setZoom(1)}
            className="px-2 py-1 border border-terminal-green/30 hover:border-terminal-green/60"
          >
            RESET VIEW
          </button>
        </div>
      </div>

      <div
        className="border-2 border-terminal-green/30 bg-true-black overflow-hidden"
        style={{ height: '600px', cursor: isDragging.current ? 'grabbing' : 'grab' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          className="select-none"
          viewBox="0 0 800 600"
          preserveAspectRatio="xMidYMid meet"
        >
          <g transform={`translate(${pan.x + 400}, ${pan.y + 300}) scale(${zoom}) translate(-400, -300)`}>
            {/* Edges (lines) */}
            <g>
              {graphData.edges.map((edge) => {
                const sourceNode = graphData.nodes.find((n) => n.id === edge.source)
                const targetNode = graphData.nodes.find((n) => n.id === edge.target)
                
                if (!sourceNode || !targetNode) return null
                
                const opacity = Math.min(1, 0.2 + edge.strength * 0.1)
                
                return (
                  <line
                    key={edge.id}
                    x1={sourceNode.x}
                    y1={sourceNode.y}
                    x2={targetNode.x}
                    y2={targetNode.y}
                    stroke="#33FF00"
                    strokeWidth={Math.max(1, Math.min(3, edge.strength * 0.5))}
                    strokeOpacity={opacity}
                  />
                )
              })}
            </g>

            {/* Nodes (symbols) */}
            <g>
              {graphData.nodes.map((node) => {
                const size = getNodeSize(node.level)
                const color = getCategoryColor(node.category)
                const isSelected = selectedNode === node.id
                
                return (
                  <g key={node.id}>
                    <rect
                      x={node.x - size / 2}
                      y={node.y - size / 2}
                      width={size}
                      height={size}
                      fill={isSelected ? color : color + '80'}
                      stroke={isSelected ? color : '#33FF00'}
                      strokeWidth={isSelected ? 2 : 1}
                      className="cursor-pointer"
                      onClick={() => setSelectedNode(isSelected ? null : node.id)}
                    />
                    {isSelected && (
                      <text
                        x={node.x}
                        y={node.y - size - 5}
                        textAnchor="middle"
                        fill={color}
                        fontSize="10"
                        fontFamily="VT323, monospace"
                        className="pointer-events-none"
                      >
                        {node.name} (L{node.level})
                      </text>
                    )}
                  </g>
                )
              })}
            </g>
          </g>
        </svg>
      </div>

      {selectedNode && (
        <div className="border border-terminal-green/30 p-4 bg-true-black">
          {(() => {
            const node = graphData.nodes.find((n) => n.id === selectedNode)
            if (!node) return null
            
            const connections = graphData.edges
              .filter((e) => e.source === node.id || e.target === node.id)
              .map((e) => {
                const connectedId = e.source === node.id ? e.target : e.source
                const connectedNode = graphData.nodes.find((n) => n.id === connectedId)
                return connectedNode ? { node: connectedNode, strength: e.strength } : null
              })
              .filter((c): c is { node: Node; strength: number } => c !== null)
              .sort((a, b) => b.strength - a.strength)
              .slice(0, 5)
            
            return (
              <div className="space-y-2">
                <div className="text-terminal-green font-vt323 text-lg">
                  &gt; {node.name.toUpperCase()}
                </div>
                <div className="text-terminal-green/60 text-xs font-mono">
                  CATEGORY: {node.category || 'UNKNOWN'} | LEVEL: {node.level} | OCCURRENCES: {node.occurrences}
                </div>
                {connections.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-terminal-green/20">
                    <div className="text-terminal-green/60 text-xs mb-2">CONNECTED SYMBOLS:</div>
                    <div className="flex flex-wrap gap-2">
                      {connections.map((conn) => (
                        <span
                          key={conn.node!.id}
                          className="px-2 py-1 border border-terminal-green/30 
                                   bg-terminal-green/5 text-terminal-green text-xs"
                        >
                          {conn.node!.name} ({conn.strength}x)
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })()}
        </div>
      )}

      <div className="text-terminal-green/40 text-xs font-mono">
        &gt; CONTROLS: DRAG TO PAN | SCROLL TO ZOOM | CLICK NODE TO SELECT
      </div>
    </div>
  )
}

