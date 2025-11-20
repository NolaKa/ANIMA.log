import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { normalizeSymbol } from '@/lib/symbol-normalizer'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const symbolId = resolvedParams.id

    if (!symbolId) {
      return NextResponse.json(
        { error: 'Symbol ID is required' },
        { status: 400 }
      )
    }

    // Get symbol
    const symbol = await prisma.symbol.findUnique({
      where: { id: symbolId },
    })

    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol not found' },
        { status: 404 }
      )
    }

    // Find all entries containing this symbol
    const allEntries = await prisma.entry.findMany({
      orderBy: {
        timestamp: 'desc',
      },
    })

    const occurrences: Array<{
      entryId: string
      timestamp: string
      type: string
      contentPreview: string
    }> = []

    for (const entry of allEntries) {
      const symbols = JSON.parse(entry.detectedSymbols || '[]') as string[]
      const normalizedSymbols = symbols.map(normalizeSymbol)
      
      if (normalizedSymbols.includes(symbol.name)) {
        occurrences.push({
          entryId: entry.id,
          timestamp: entry.timestamp.toISOString(),
          type: entry.type,
          contentPreview: entry.type === 'text' 
            ? (entry.contentText || '').substring(0, 100)
            : '[IMAGE]',
        })
      }
    }

    return NextResponse.json({
      symbol: {
        id: symbol.id,
        name: symbol.name,
        description: symbol.description,
        category: symbol.category,
        meaning: symbol.meaning,
        level: symbol.level,
        occurrences: symbol.occurrences,
        firstSeen: symbol.firstSeen.toISOString(),
        lastSeen: symbol.lastSeen.toISOString(),
      },
      occurrences,
    })
  } catch (error) {
    console.error('Error fetching symbol history:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    )
  }
}

