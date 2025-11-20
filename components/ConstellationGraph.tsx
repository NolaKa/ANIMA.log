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

type LayoutMode = 'radial' | 'grid' | 'minimal' | 'force' | 'circuit'

export default function ConstellationGraph() {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [] })
  const [loading, setLoading] = useState(true)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [minStrength, setMinStrength] = useState(2) // Filter weak connections - default to 2 for less chaos
  const [showLabels, setShowLabels] = useState(false) // Hide labels by default for cleaner view
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('circuit') // Default to circuit mode
  const [categoryFilter, setCategoryFilter] = useState<Set<string | null>>(new Set(['NATURE', 'PERSONA', 'SHADOW', 'SACRED', null])) // All categories visible
  const [iterations, setIterations] = useState(0) // Force-directed iterations
  const svgRef = useRef<SVGSVGElement>(null)
  const isDragging = useRef(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const animationFrameRef = useRef<number | null>(null)
  const rawDataRef = useRef<{ nodes: Node[]; edges: Edge[] } | null>(null)

  useEffect(() => {
    fetchGraphData()
  }, [])

  // Layout calculation functions
  const calculateRadialLayout = (nodes: Node[]): Node[] => {
    const centerX = 400
    const centerY = 300
    const categoryRadius = 180 // Distance of category centers from center
    const nodeRadius = 60 // Radius for nodes within category
    
    // Group nodes by category
    const categoryGroups: Record<string, Node[]> = {}
    nodes.forEach((node: Node) => {
      const cat = node.category || 'UNKNOWN'
      if (!categoryGroups[cat]) categoryGroups[cat] = []
      categoryGroups[cat].push(node)
    })
    
    const categories = Object.keys(categoryGroups)
    const positionedNodes: Node[] = []
    
    categories.forEach((category, catIndex) => {
      const categoryAngle = (catIndex / categories.length) * 2 * Math.PI - Math.PI / 2 // Start from top
      const categoryCenterX = centerX + Math.cos(categoryAngle) * categoryRadius
      const categoryCenterY = centerY + Math.sin(categoryAngle) * categoryRadius
      
      const categoryNodes = categoryGroups[category]
      categoryNodes.forEach((node, nodeIndex) => {
        // Arrange nodes in a circle around category center
        const nodeAngle = (nodeIndex / categoryNodes.length) * 2 * Math.PI
        const distance = nodeRadius * (0.5 + (node.level / 5) * 0.5) // Level affects distance
        positionedNodes.push({
          ...node,
          x: categoryCenterX + Math.cos(nodeAngle) * distance,
          y: categoryCenterY + Math.sin(nodeAngle) * distance,
        })
      })
    })
    
    return positionedNodes
  }

  const calculateGridLayout = (nodes: Node[]): Node[] => {
    const centerX = 400
    const centerY = 300
    const categorySpacing = 180
    const nodeSpacing = 40
    
    // Group nodes by category
    const categoryGroups: Record<string, Node[]> = {}
    nodes.forEach((node: Node) => {
      const cat = node.category || 'UNKNOWN'
      if (!categoryGroups[cat]) categoryGroups[cat] = []
      categoryGroups[cat].push(node)
    })
    
    const categories = Object.keys(categoryGroups)
    const cols = Math.ceil(Math.sqrt(categories.length))
    const positionedNodes: Node[] = []
    
    categories.forEach((category, catIndex) => {
      const col = catIndex % cols
      const row = Math.floor(catIndex / cols)
      const categoryCenterX = centerX + (col - (cols - 1) / 2) * categorySpacing
      const categoryCenterY = centerY + (row - (categories.length / cols - 1) / 2) * categorySpacing
      
      const categoryNodes = categoryGroups[category]
      const nodesPerRow = Math.ceil(Math.sqrt(categoryNodes.length))
      
      categoryNodes.forEach((node, nodeIndex) => {
        const nodeCol = nodeIndex % nodesPerRow
        const nodeRow = Math.floor(nodeIndex / nodesPerRow)
        positionedNodes.push({
          ...node,
          x: categoryCenterX + (nodeCol - (nodesPerRow - 1) / 2) * nodeSpacing,
          y: categoryCenterY + (nodeRow - (Math.ceil(categoryNodes.length / nodesPerRow) - 1) / 2) * nodeSpacing,
        })
      })
    })
    
    return positionedNodes
  }

  const calculateMinimalLayout = (nodes: Node[], edges: Edge[]): Node[] => {
    // Similar to radial but with more spacing and only strong connections
    const centerX = 400
    const centerY = 300
    const categoryRadius = 200
    const nodeRadius = 80
    
    // Group nodes by category
    const categoryGroups: Record<string, Node[]> = {}
    nodes.forEach((node: Node) => {
      const cat = node.category || 'UNKNOWN'
      if (!categoryGroups[cat]) categoryGroups[cat] = []
      categoryGroups[cat].push(node)
    })
    
    const categories = Object.keys(categoryGroups)
    const positionedNodes: Node[] = []
    
    categories.forEach((category, catIndex) => {
      const categoryAngle = (catIndex / categories.length) * 2 * Math.PI - Math.PI / 2
      const categoryCenterX = centerX + Math.cos(categoryAngle) * categoryRadius
      const categoryCenterY = centerY + Math.sin(categoryAngle) * categoryRadius
      
      const categoryNodes = categoryGroups[category]
      categoryNodes.forEach((node, nodeIndex) => {
        // More spacing in minimal layout
        const nodeAngle = (nodeIndex / categoryNodes.length) * 2 * Math.PI
        const distance = nodeRadius * (0.6 + (node.level / 5) * 0.4)
        positionedNodes.push({
          ...node,
          x: categoryCenterX + Math.cos(nodeAngle) * distance,
          y: categoryCenterY + Math.sin(nodeAngle) * distance,
        })
      })
    })
    
    return positionedNodes
  }

  const calculateCircuitLayout = (nodes: Node[]): Node[] => {
    // Grid-based positioning for circuit board look
    const gridSize = 60 // Spacing between grid points
    const startX = 100
    const startY = 100
    const maxCols = 10
    
    // Group nodes by category for better organization
    const categoryGroups: Record<string, Node[]> = {}
    nodes.forEach((node: Node) => {
      const cat = node.category || 'UNKNOWN'
      if (!categoryGroups[cat]) categoryGroups[cat] = []
      categoryGroups[cat].push(node)
    })
    
    const categories = Object.keys(categoryGroups)
    const positionedNodes: Node[] = []
    let globalIndex = 0
    
    // Place categories in grid sections
    categories.forEach((category, catIndex) => {
      const categoryNodes = categoryGroups[category]
      const col = catIndex % maxCols
      const row = Math.floor(catIndex / maxCols)
      
      // Each category gets a grid area
      const baseX = startX + col * gridSize * 3
      const baseY = startY + row * gridSize * 3
      
      // Arrange nodes within category area in a compact grid
      const nodesPerRow = Math.ceil(Math.sqrt(categoryNodes.length))
      categoryNodes.forEach((node, nodeIndex) => {
        const nodeCol = nodeIndex % nodesPerRow
        const nodeRow = Math.floor(nodeIndex / nodesPerRow)
        
        // Snap to grid for clean circuit look
        const gridX = Math.round((baseX + nodeCol * gridSize) / gridSize) * gridSize
        const gridY = Math.round((baseY + nodeRow * gridSize) / gridSize) * gridSize
        
        positionedNodes.push({
          ...node,
          x: gridX,
          y: gridY,
        })
        globalIndex++
      })
    })
    
    return positionedNodes
  }

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

      // Calculate layout based on mode
      let positionedNodes: Node[] = []
      
      switch (layoutMode) {
        case 'radial':
          positionedNodes = calculateRadialLayout(data.nodes)
          break
        case 'grid':
          positionedNodes = calculateGridLayout(data.nodes)
          break
        case 'minimal':
          positionedNodes = calculateMinimalLayout(data.nodes, data.edges || [])
          break
        case 'circuit':
          positionedNodes = calculateCircuitLayout(data.nodes)
          break
        case 'force':
          // Use original force-directed approach
          const centerX = 400
          const centerY = 300
          const categoryGroups: Record<string, Node[]> = {}
          data.nodes.forEach((node: Node) => {
            const cat = node.category || 'UNKNOWN'
            if (!categoryGroups[cat]) categoryGroups[cat] = []
            categoryGroups[cat].push(node)
          })
          
          Object.entries(categoryGroups).forEach(([category, nodes]) => {
            const categoryAngle = (Object.keys(categoryGroups).indexOf(category) / Object.keys(categoryGroups).length) * 2 * Math.PI
            const categoryCenterX = centerX + Math.cos(categoryAngle) * 100
            const categoryCenterY = centerY + Math.sin(categoryAngle) * 100
            
            nodes.forEach((node, index) => {
              const spiralAngle = (index / nodes.length) * 2 * Math.PI * 2
              const spiralRadius = (index / nodes.length) * 80
              const noise = Math.random() * 20 - 10
              
              positionedNodes.push({
                ...node,
                x: categoryCenterX + (spiralRadius + noise) * Math.cos(spiralAngle),
                y: categoryCenterY + (spiralRadius + noise) * Math.sin(spiralAngle),
              })
            })
          })
          break
      }
      
      // Store raw data for layout recalculation
      rawDataRef.current = {
        nodes: data.nodes.map(({ x, y, ...rest }: Node) => rest),
        edges: data.edges || [],
      }
      
      setGraphData({
        nodes: positionedNodes,
        edges: data.edges || [],
      })
      
      // Only run force-directed simulation for force mode
      if (layoutMode === 'force') {
        setIterations(0)
        runForceDirectedSimulation(positionedNodes, data.edges || [])
      }
    } catch (error) {
      console.error('Error fetching graph data:', error)
      setGraphData({ nodes: [], edges: [] })
      rawDataRef.current = null
    } finally {
      setLoading(false)
    }
  }

  // Recalculate layout when mode changes
  useEffect(() => {
    if (!rawDataRef.current || rawDataRef.current.nodes.length === 0) return
    
    const { nodes, edges } = rawDataRef.current
    let positionedNodes: Node[] = []
    
      switch (layoutMode) {
        case 'radial':
          positionedNodes = calculateRadialLayout(nodes)
          break
        case 'grid':
          positionedNodes = calculateGridLayout(nodes)
          break
        case 'minimal':
          positionedNodes = calculateMinimalLayout(nodes, edges)
          break
        case 'circuit':
          positionedNodes = calculateCircuitLayout(nodes)
          break
        case 'force':
        // Re-run force simulation
        const centerX = 400
        const centerY = 300
        const categoryGroups: Record<string, Node[]> = {}
        nodes.forEach((node: Node) => {
          const cat = node.category || 'UNKNOWN'
          if (!categoryGroups[cat]) categoryGroups[cat] = []
          categoryGroups[cat].push(node)
        })
        
        Object.entries(categoryGroups).forEach(([category, categoryNodes]) => {
          const categoryAngle = (Object.keys(categoryGroups).indexOf(category) / Object.keys(categoryGroups).length) * 2 * Math.PI
          const categoryCenterX = centerX + Math.cos(categoryAngle) * 100
          const categoryCenterY = centerY + Math.sin(categoryAngle) * 100
          
          categoryNodes.forEach((node, index) => {
            const spiralAngle = (index / categoryNodes.length) * 2 * Math.PI * 2
            const spiralRadius = (index / categoryNodes.length) * 80
            const noise = Math.random() * 20 - 10
            
            positionedNodes.push({
              ...node,
              x: categoryCenterX + (spiralRadius + noise) * Math.cos(spiralAngle),
              y: categoryCenterY + (spiralRadius + noise) * Math.sin(spiralAngle),
            })
          })
        })
        runForceDirectedSimulation(positionedNodes, edges)
        return
    }
    
    setGraphData({
      nodes: positionedNodes,
      edges: edges,
    })
  }, [layoutMode])

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
            {/* Background Grid for Circuit Mode */}
            {layoutMode === 'circuit' && (() => {
              const gridSize = 60
              const lines = []
              for (let x = 0; x <= 800; x += gridSize) {
                lines.push(
                  <line
                    key={`v-${x}`}
                    x1={x}
                    y1={0}
                    x2={x}
                    y2={600}
                    stroke="#114411"
                    strokeWidth="1"
                    strokeDasharray="2,2"
                    opacity="0.4"
                  />
                )
              }
              for (let y = 0; y <= 600; y += gridSize) {
                lines.push(
                  <line
                    key={`h-${y}`}
                    x1={0}
                    y1={y}
                    x2={800}
                    y2={y}
                    stroke="#114411"
                    strokeWidth="1"
                    strokeDasharray="2,2"
                    opacity="0.4"
                  />
                )
              }
              return <g>{lines}</g>
            })()}

            {/* Category Labels */}
            {(() => {
              const categoryGroups: Record<string, Node[]> = {}
              graphData.nodes.forEach((node) => {
                const cat = node.category || 'UNKNOWN'
                if (!categoryGroups[cat]) categoryGroups[cat] = []
                categoryGroups[cat].push(node)
              })
              
              const categories = Object.keys(categoryGroups)
              
              if (layoutMode === 'radial' || layoutMode === 'minimal') {
                const centerX = 400
                const centerY = 300
                const categoryRadius = layoutMode === 'minimal' ? 200 : 180
                
                return categories.map((category, catIndex) => {
                  const categoryAngle = (catIndex / categories.length) * 2 * Math.PI - Math.PI / 2
                  const labelX = centerX + Math.cos(categoryAngle) * categoryRadius
                  const labelY = centerY + Math.sin(categoryAngle) * categoryRadius
                  const color = getCategoryColor(category === 'UNKNOWN' ? null : category)
                  
                  return (
                    <text
                      key={category}
                      x={labelX}
                      y={labelY - 20}
                      textAnchor="middle"
                      fill={color}
                      fontSize="12"
                      fontFamily="VT323, monospace"
                      className="pointer-events-none"
                      style={{ 
                        fontWeight: 'bold',
                        textShadow: '2px 2px 0px #000',
                      }}
                    >
                      {category}
                    </text>
                  )
                })
              } else if (layoutMode === 'grid') {
                const centerX = 400
                const centerY = 300
                const categorySpacing = 180
                const cols = Math.ceil(Math.sqrt(categories.length))
                
                return categories.map((category, catIndex) => {
                  const col = catIndex % cols
                  const row = Math.floor(catIndex / cols)
                  const labelX = centerX + (col - (cols - 1) / 2) * categorySpacing
                  const labelY = centerY + (row - (categories.length / cols - 1) / 2) * categorySpacing - 40
                  const color = getCategoryColor(category === 'UNKNOWN' ? null : category)
                  
                  return (
                    <text
                      key={category}
                      x={labelX}
                      y={labelY}
                      textAnchor="middle"
                      fill={color}
                      fontSize="12"
                      fontFamily="VT323, monospace"
                      className="pointer-events-none"
                      style={{ 
                        fontWeight: 'bold',
                        textShadow: '2px 2px 0px #000',
                      }}
                    >
                      {category}
                    </text>
                  )
                })
              }
              return null
            })()}

            {/* Edges (lines) - filtered by strength - bitmap style */}
            <g>
              {graphData.edges
                .filter((edge) => {
                  // In minimal mode, only show strongest connections
                  const effectiveMinStrength = layoutMode === 'minimal' ? Math.max(minStrength, 3) : minStrength
                  return edge.strength >= effectiveMinStrength
                })
                .map((edge) => {
                  const sourceNode = graphData.nodes.find((n) => n.id === edge.source)
                  const targetNode = graphData.nodes.find((n) => n.id === edge.target)
                  
                  if (!sourceNode || !targetNode) return null
                  
                  // Check if both nodes are visible
                  if (!categoryFilter.has(sourceNode.category) || !categoryFilter.has(targetNode.category)) {
                    return null
                  }
                  
                  // In minimal mode, only show cross-category connections or very strong same-category
                  if (layoutMode === 'minimal' && sourceNode.category === targetNode.category && edge.strength < 4) {
                    return null
                  }
                  
                  // Circuit mode: L-shaped orthogonal routing
                  if (layoutMode === 'circuit') {
                    const isStrong = edge.strength >= 3
                    const strokeColor = isStrong ? '#33FF00' : '#1a8000'
                    const strokeWidth = isStrong ? 2.5 : 1.0
                    const strokeDash = isStrong ? '' : '4,4'
                    
                    // L-shaped routing: Start -> (End.x, Start.y) -> End
                    const midX = targetNode.x
                    const midY = sourceNode.y
                    
                    return (
                      <g key={edge.id}>
                        {/* Horizontal segment */}
                        <line
                          x1={sourceNode.x}
                          y1={sourceNode.y}
                          x2={midX}
                          y2={midY}
                          stroke={strokeColor}
                          strokeWidth={strokeWidth}
                          strokeDasharray={strokeDash}
                          shapeRendering="crispEdges"
                        />
                        {/* Vertical segment */}
                        <line
                          x1={midX}
                          y1={midY}
                          x2={targetNode.x}
                          y2={targetNode.y}
                          stroke={strokeColor}
                          strokeWidth={strokeWidth}
                          strokeDasharray={strokeDash}
                          shapeRendering="crispEdges"
                        />
                        {/* Solder point at corner */}
                        <rect
                          x={midX - 2}
                          y={midY - 2}
                          width="4"
                          height="4"
                          fill={strokeColor}
                          shapeRendering="crispEdges"
                        />
                      </g>
                    )
                  }
                  
                  // Regular straight lines for other modes
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
                  const color = getCategoryColor(node.category)
                  const isSelected = selectedNode === node.id
                  
                  // Circuit mode: larger squares with brackets and hex codes
                  if (layoutMode === 'circuit') {
                    const isMajor = node.level >= 4 || node.category === 'SHADOW'
                    const size = isMajor ? 24 : 16
                    const pixelX = Math.round(node.x - size / 2)
                    const pixelY = Math.round(node.y - size / 2)
                    
                    // Generate pseudo-random hex code based on node id
                    const hash = node.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
                    const hexCode = `0x${(hash % 256).toString(16).padStart(2, '0').toUpperCase()}`
                    
                    return (
                      <g key={node.id}>
                        {/* Outer square */}
                        <rect
                          x={pixelX}
                          y={pixelY}
                          width={size}
                          height={size}
                          fill="black"
                          stroke={color}
                          strokeWidth={isSelected ? 3 : 2}
                          className="cursor-pointer"
                          onClick={() => setSelectedNode(isSelected ? null : node.id)}
                          shapeRendering="crispEdges"
                        />
                        
                        {/* Inner fill for major nodes or SHADOW */}
                        {node.category === 'SHADOW' && (
                          <rect
                            x={pixelX + 4}
                            y={pixelY + 4}
                            width={size - 8}
                            height={size - 8}
                            fill="#FF3333"
                            shapeRendering="crispEdges"
                          />
                        )}
                        {isMajor && node.category !== 'SHADOW' && (
                          <rect
                            x={pixelX + 4}
                            y={pixelY + 4}
                            width={size - 8}
                            height={size - 8}
                            fill={color}
                            opacity="0.6"
                            shapeRendering="crispEdges"
                          />
                        )}
                        
                        {/* Label with brackets - only show if showLabels is true or node is selected */}
                        {(showLabels || isSelected) && (
                          <text
                            x={node.x}
                            y={pixelY - 6}
                            textAnchor="middle"
                            fill={color}
                            fontSize="10"
                            fontFamily="VT323, monospace"
                            fontWeight="bold"
                            className="pointer-events-none"
                            style={{ 
                              textShadow: '1px 1px 0px #000',
                            }}
                          >
                            [{node.name.toUpperCase()}]
                          </text>
                        )}
                        
                        {/* Hex code - only show if showLabels is true or node is selected */}
                        {(showLabels || isSelected) && (
                          <text
                            x={node.x + size / 2 + 4}
                            y={node.y + size / 2 + 4}
                            fill="#1a8000"
                            fontSize="7"
                            fontFamily="VT323, monospace"
                            className="pointer-events-none"
                          >
                            {hexCode}
                          </text>
                        )}
                      </g>
                    )
                  }
                  
                  // Regular bitmap style for other modes
                  const size = node.level === 1 ? 8 : node.level === 2 ? 10 : node.level === 3 ? 12 : node.level === 4 ? 14 : 16
                  
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

