import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { normalizeSymbol } from '@/lib/symbol-normalizer'

export async function GET() {
  try {
    const symbols = await prisma.symbol.findMany({
      orderBy: {
        occurrences: 'desc',
      },
    })

    const formattedSymbols = symbols.map((symbol) => ({
      id: symbol.id,
      name: symbol.name,
      description: symbol.description,
      archetype: symbol.archetype,
      occurrences: symbol.occurrences,
      firstSeen: symbol.firstSeen.toISOString(),
    }))

    return NextResponse.json(formattedSymbols)
  } catch (error) {
    console.error('Error fetching symbols:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Clean up symbols that have no associated entries
    const allEntries = await prisma.entry.findMany()
    
    // Collect all symbols that actually appear in entries
    const symbolsInEntries = new Set<string>()
    for (const entry of allEntries) {
      const symbols = JSON.parse(entry.detectedSymbols || '[]') as string[]
      for (const symbolName of symbols) {
        const normalizedName = normalizeSymbol(symbolName)
        symbolsInEntries.add(normalizedName)
      }
    }

    // Find all symbols in database
    const allSymbols = await prisma.symbol.findMany()
    
    // Delete symbols that don't appear in any entry
    let deletedCount = 0
    for (const symbol of allSymbols) {
      if (!symbolsInEntries.has(symbol.name)) {
        // Also delete associated connections
        await (prisma as any).symbolConnection.deleteMany({
          where: {
            OR: [
              { fromId: symbol.id },
              { toId: symbol.id },
            ],
          },
        })
        
        await prisma.symbol.delete({
          where: { id: symbol.id },
        })
        deletedCount++
      }
    }

    // Also sync occurrences for remaining symbols
    for (const symbol of allSymbols) {
      if (symbolsInEntries.has(symbol.name)) {
        // Count actual occurrences in entries
        let actualOccurrences = 0
        for (const entry of allEntries) {
          const symbols = JSON.parse(entry.detectedSymbols || '[]') as string[]
          for (const symbolName of symbols) {
            const normalizedName = normalizeSymbol(symbolName)
            if (normalizedName === symbol.name) {
              actualOccurrences++
            }
          }
        }

        // Update if different
        if (actualOccurrences !== symbol.occurrences) {
          await prisma.symbol.update({
            where: { id: symbol.id },
            data: {
              occurrences: actualOccurrences,
            },
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      deletedCount,
      message: `Cleaned up ${deletedCount} orphaned symbols`,
    })
  } catch (error) {
    console.error('Error cleaning up symbols:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to clean up symbols', details: errorMessage },
      { status: 500 }
    )
  }
}

