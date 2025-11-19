import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

