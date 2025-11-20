import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { normalizeSymbol } from '@/lib/symbol-normalizer'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const id = resolvedParams.id

    if (!id) {
      return NextResponse.json(
        { error: 'Entry ID is required' },
        { status: 400 }
      )
    }

    // Get the entry first to access its symbols
    const entry = await prisma.entry.findUnique({
      where: { id },
    })

    if (!entry) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      )
    }

    // Parse symbols from the entry
    const symbols = JSON.parse(entry.detectedSymbols || '[]') as string[]

    // Delete the entry
    await prisma.entry.delete({
      where: { id },
    })

    // Decrease occurrences for each symbol
    for (const symbolName of symbols) {
      const normalizedName = normalizeSymbol(symbolName)
      
      // Find the symbol
      const symbol = await prisma.symbol.findUnique({
        where: { name: normalizedName },
      })

      if (symbol) {
        // Decrease occurrences, but don't go below 0
        const newOccurrences = Math.max(0, symbol.occurrences - 1)
        
        if (newOccurrences === 0) {
          // Remove symbol if it has no occurrences left
          await prisma.symbol.delete({
            where: { name: normalizedName },
          })
        } else {
          // Update occurrences
          await prisma.symbol.update({
            where: { name: normalizedName },
            data: {
              occurrences: newOccurrences,
            },
          })
        }
      } else {
        // Log warning if symbol not found - this shouldn't happen normally
        console.warn(`Symbol "${normalizedName}" (from "${symbolName}") not found in database when deleting entry ${id}`)
      }
    }

    return NextResponse.json({ success: true, message: 'Entry deleted successfully' })
  } catch (error) {
    console.error('Error deleting entry:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to delete entry', details: errorMessage },
      { status: 500 }
    )
  }
}

