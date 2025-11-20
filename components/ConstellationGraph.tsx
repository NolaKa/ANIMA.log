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
  vx?: number // Velocity x (for force-directed)
  vy?: number // Velocity y (for force-directed)
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
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [minStrength, setMinStrength] = useState(1) // Filter weak connections
  const [showLabels, setShowLabels] = useState(true) // Show all labels
  const [categoryFilter, setCategoryFilter] = useState<Set<string | null>>(new Set(['NATURE', 'PERSONA', 'SHADOW', 'SACRED', null])) // All categories visible
  const [iterations, setIterations] = useState(0) // Force-directed iterations
  const svgRef = useRef<SVGSVGElement>(null)
  const isDragging = useRef(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const animationFrameRef = useRef<number | null>(null)

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
      
      const nodeCount = data.nodes.length || 0
      
      if (nodeCount === 0) {
        setGraphData({ nodes: [], edges: [] })
        return
      }

      // Initial fractal-like positioning using recursive subdivision
      const centerX = 400
      const centerY = 300
      const initialRadius = 250
      
      // Group nodes by category
      const categoryGroups: Record<string, Node[]> = {}
      data.nodes.forEach((node: Node) => {
        const cat = node.category || 'UNKNOWN'
        if (!categoryGroups[cat]) categoryGroups[cat] = []
        categoryGroups[cat].push(node)
      })

      // Fractal-like initial positions - recursive spiral placement
      const positionedNodes: Node[] = []
      let globalIndex = 0
      
      Object.entries(categoryGroups).forEach(([category, nodes]) => {
        // Each category gets a sector of the circle
        const categoryAngle = (Object.keys(categoryGroups).indexOf(category) / Object.keys(categoryGroups).length) * 2 * Math.PI
        const categoryCenterX = centerX + Math.cos(categoryAngle) * 100
        const categoryCenterY = centerY + Math.sin(categoryAngle) * 100
        
        // Spiral placement within category cluster
        nodes.forEach((node, index) => {
          const spiralAngle = (index / nodes.length) * 2 * Math.PI * 2 // Double spiral
          const spiralRadius = (index / nodes.length) * 80
          const noise = Math.random() * 20 - 10 // Add some organic randomness
          
          positionedNodes.push({
            ...node,
            x: categoryCenterX + (spiralRadius + noise) * Math.cos(spiralAngle),
            y: categoryCenterY + (spiralRadius + noise) * Math.sin(spiralAngle),
          })
          globalIndex++
        })
      })
      
      setGraphData({
        nodes: positionedNodes,
        edges: data.edges || [],
      })
      
      // Start force-directed simulation
      setIterations(0)
      runForceDirectedSimulation(positionedNodes, data.edges || [])
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

  // Force-directed layout simulation for organic clustering
  const runForceDirectedSimulation = (initialNodes: Node[], edges: Edge[]) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    let nodes = initialNodes.map(n => ({ ...n, vx: 0, vy: 0 }))
    const maxIterations = 100
    let iteration = 0

    const simulate = () => {
      if (iteration >= maxIterations) {
        const cleanNodes = nodes.map(({ vx, vy, ...rest }) => rest)
        setGraphData({ nodes: cleanNodes, edges })
        return
      }

      // Force parameters
      const linkDistance = 100 // Preferred distance between connected nodes
      const linkStrength = 0.3 // Strength of spring force
      const chargeStrength = -800 // Repulsion strength
      const categoryAttraction = 200 // Attraction between same category
      const damping = 0.9 // Friction

      // Reset velocities
      nodes.forEach(node => {
        node.vx = 0
        node.vy = 0
      })

      // Apply spring forces (attraction) for edges
      edges.forEach(edge => {
        const source = nodes.find(n => n.id === edge.source)
        const target = nodes.find(n => n.id === edge.target)
        if (!source || !target) return

        const dx = target.x - source.x
        const dy = target.y - source.y
        const distance = Math.sqrt(dx * dx + dy * dy) || 1
        const force = (distance - linkDistance) * linkStrength * edge.strength

        const fx = (dx / distance) * force
        const fy = (dy / distance) * force

        source.vx += fx
        source.vy += fy
        target.vx -= fx
        target.vy -= fy
      })

      // Apply repulsion (charge) between all nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const nodeA = nodes[i]
          const nodeB = nodes[j]

          const dx = nodeB.x - nodeA.x
          const dy = nodeB.y - nodeA.y
          const distance = Math.sqrt(dx * dx + dy * dy) || 1
          const distanceSquared = distance * distance

          // Repulsion force
          const force = chargeStrength / distanceSquared
          const fx = (dx / distance) * force
          const fy = (dy / distance) * force

          nodeA.vx -= fx
          nodeA.vy -= fy
          nodeB.vx += fx
          nodeB.vy += fy

          // Category attraction - nodes of same category attract slightly
          if (nodeA.category === nodeB.category && nodeA.category) {
            const attraction = categoryAttraction / distanceSquared
            const ax = (dx / distance) * attraction
            const ay = (dy / distance) * attraction

            nodeA.vx += ax
            nodeA.vy += ay
            nodeB.vx -= ax
            nodeB.vy -= ay
          }
        }
      }

      // Update positions
      const centerX = 400
      const centerY = 300
      const centerForce = 0.01 // Weak force toward center

      nodes.forEach(node => {
        // Apply velocity with damping
        node.vx *= damping
        node.vy *= damping

        // Weak centering force
        const dx = centerX - node.x
        const dy = centerY - node.y
        node.vx += dx * centerForce
        node.vy += dy * centerForce

        // Update position
        node.x += node.vx * 0.1
        node.y += node.vy * 0.1

        // Keep within bounds (soft boundary)
        const maxDistance = 350
        const distanceFromCenter = Math.sqrt(
          (node.x - centerX) ** 2 + (node.y - centerY) ** 2
        )
        if (distanceFromCenter > maxDistance) {
          const angle = Math.atan2(node.y - centerY, node.x - centerX)
          node.x = centerX + Math.cos(angle) * maxDistance
          node.y = centerY + Math.sin(angle) * maxDistance
        }
      })

      iteration++
      setIterations(iteration)

      // Update graph data every few iterations for smooth animation
      if (iteration % 5 === 0) {
        const cleanNodes = nodes.map(({ vx, vy, ...rest }) => rest)
        setGraphData({ nodes: cleanNodes, edges })
      }

      animationFrameRef.current = requestAnimationFrame(simulate)
    }

    simulate()
  }

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

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

  // Zoom disabled - bitmap style doesn't need zoom

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
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="text-terminal-green/60 text-sm">
            &gt; CONSTELLATION - {graphData.nodes.length} NODES, {graphData.edges.filter(e => e.strength >= minStrength).length} CONNECTIONS
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-terminal-green/60">MIN STRENGTH:</span>
            <input
              type="range"
              min="1"
              max="5"
              value={minStrength}
              onChange={(e) => setMinStrength(Number(e.target.value))}
              className="w-20"
            />
            <span className="text-terminal-green">{minStrength}</span>
          </div>
          
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showLabels}
              onChange={(e) => setShowLabels(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-terminal-green/60">SHOW LABELS</span>
          </label>
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

      <div
        className="bg-true-black overflow-hidden"
        style={{ height: '600px', cursor: isDragging.current ? 'grabbing' : 'grab' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          className="select-none"
          viewBox="0 0 800 600"
          preserveAspectRatio="xMidYMid meet"
          style={{ imageRendering: 'pixelated' }} // Bitmap style
        >
          <g transform={`translate(${pan.x + 400}, ${pan.y + 300}) translate(-400, -300)`}>
            {/* Edges (lines) - filtered by strength - bitmap style */}
            <g>
              {graphData.edges
                .filter((edge) => edge.strength >= minStrength)
                .map((edge) => {
                  const sourceNode = graphData.nodes.find((n) => n.id === edge.source)
                  const targetNode = graphData.nodes.find((n) => n.id === edge.target)
                  
                  if (!sourceNode || !targetNode) return null
                  
                  // Check if both nodes are visible
                  if (!categoryFilter.has(sourceNode.category) || !categoryFilter.has(targetNode.category)) {
                    return null
                  }
                  
                  // Bitmap style: solid colors, pixelated
                  const strokeWidth = edge.strength === 1 ? 1 : edge.strength === 2 ? 2 : edge.strength >= 3 ? 3 : 1
                  
                  return (
                    <line
                      key={edge.id}
                      x1={sourceNode.x}
                      y1={sourceNode.y}
                      x2={targetNode.x}
                      y2={targetNode.y}
                      stroke="#33FF00"
                      strokeWidth={strokeWidth}
                      strokeOpacity={edge.strength >= 3 ? 1 : edge.strength === 2 ? 0.7 : 0.5}
                      shapeRendering="crispEdges"
                    />
                  )
                })}
            </g>

            {/* Nodes (symbols) - filtered by category - bitmap/pixelated style */}
            <g>
              {graphData.nodes
                .filter((node) => categoryFilter.has(node.category))
                .map((node) => {
                  // Bitmap style: fixed pixel sizes (8x8, 10x10, 12x12, 14x14, 16x16)
                  const size = node.level === 1 ? 8 : node.level === 2 ? 10 : node.level === 3 ? 12 : node.level === 4 ? 14 : 16
                  const color = getCategoryColor(node.category)
                  const isSelected = selectedNode === node.id
                  
                  // Round to pixel grid for crisp bitmap look
                  const pixelX = Math.round(node.x - size / 2)
                  const pixelY = Math.round(node.y - size / 2)
                  
                  return (
                    <g key={node.id}>
                      {/* Main square - solid bitmap style, no anti-aliasing */}
                      <rect
                        x={pixelX}
                        y={pixelY}
                        width={size}
                        height={size}
                        fill={isSelected ? color : color}
                        stroke={isSelected ? '#33FF00' : '#33FF00'}
                        strokeWidth={isSelected ? 2 : 1}
                        className="cursor-pointer"
                        onClick={() => setSelectedNode(isSelected ? null : node.id)}
                        shapeRendering="crispEdges"
                      />
                      
                      {(showLabels || isSelected) && (
                        <text
                          x={node.x}
                          y={pixelY - 4}
                          textAnchor="middle"
                          fill={isSelected ? color : color}
                          fontSize={isSelected ? "10" : "8"}
                          fontFamily="VT323, monospace"
                          className="pointer-events-none"
                          style={{ 
                            fontWeight: isSelected ? 'bold' : 'normal',
                            textShadow: '1px 1px 0px #000',
                          }}
                        >
                          {node.name}
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
        &gt; CONTROLS: DRAG TO PAN | CLICK NODE TO SELECT
      </div>
    </div>
  )
}

