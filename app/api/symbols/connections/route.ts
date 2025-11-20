import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get all symbols
    const symbols = await (prisma as any).symbol.findMany({
      orderBy: {
        occurrences: 'desc',
      },
    })

    // Get all connections separately
    // Prisma converts model names to camelCase: SymbolConnection -> symbolConnection
    const prismaAny = prisma as any
    
    // Debug: log available models
    if (!prismaAny.symbolConnection) {
      const availableModels = Object.keys(prismaAny).filter(k => !k.startsWith('$') && typeof prismaAny[k] === 'object' && prismaAny[k]?.findMany)
      console.error('symbolConnection not found. Available models:', availableModels.join(', '))
      // Return empty data instead of error
      return NextResponse.json({
        nodes: symbols.map((s: any) => ({
          id: s.id,
          name: s.name,
          category: s.category || null,
          level: s.level || 1,
          occurrences: s.occurrences,
          x: Math.random() * 800,
          y: Math.random() * 600,
        })),
        edges: [],
      })
    }

    const connections = await prismaAny.symbolConnection.findMany({
      orderBy: {
        strength: 'desc',
      },
    })

    // Format for graph visualization
    const nodes = symbols.map((symbol: any) => ({
      id: symbol.id,
      name: symbol.name,
      category: symbol.category,
      level: symbol.level,
      occurrences: symbol.occurrences,
      x: Math.random() * 800, // Will be calculated by graph layout algorithm
      y: Math.random() * 600,
    }))

    // Create edges (undirected graph - each connection appears once)
    const edgesMap = new Map<string, { source: string; target: string; strength: number }>()
    
    connections.forEach((connection: any) => {
      // Use consistent ordering: smaller ID first
      const [fromId, toId] = connection.fromId < connection.toId 
        ? [connection.fromId, connection.toId]
        : [connection.toId, connection.fromId]
      
      const key = `${fromId}-${toId}`
      
      // Add edge only once (undirected graph)
      if (!edgesMap.has(key)) {
        edgesMap.set(key, {
          source: fromId,
          target: toId,
          strength: connection.strength,
        })
      } else {
        // If edge exists, update strength (in case of duplicate connections)
        const existing = edgesMap.get(key)!
        existing.strength = Math.max(existing.strength, connection.strength)
      }
    })
    
    const edges = Array.from(edgesMap.values()).map((edge, index) => ({
      id: `edge-${index}`,
      ...edge,
    }))

    return NextResponse.json({
      nodes,
      edges,
    })
  } catch (error) {
    console.error('Error fetching symbol connections:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : String(error)
    console.error('Full error:', errorStack)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    )
  }
}

