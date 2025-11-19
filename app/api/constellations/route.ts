import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get entries from last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentEntries = await prisma.entry.findMany({
      where: {
        timestamp: {
          gte: sevenDaysAgo,
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
    })

    // Analyze patterns
    const symbolFrequency: Record<string, number> = {}
    const archetypeFrequency: Record<string, number> = {}

    recentEntries.forEach((entry) => {
      const symbols = JSON.parse(entry.detectedSymbols || '[]') as string[]
      symbols.forEach((symbol) => {
        symbolFrequency[symbol] = (symbolFrequency[symbol] || 0) + 1
      })

      if (entry.dominantArchetype) {
        archetypeFrequency[entry.dominantArchetype] =
          (archetypeFrequency[entry.dominantArchetype] || 0) + 1
      }
    })

    // Find recurring patterns
    const recurringSymbols = Object.entries(symbolFrequency)
      .filter(([_, count]) => count >= 2)
      .sort(([_, a], [__, b]) => b - a)
      .slice(0, 5)
      .map(([symbol]) => symbol)

    const dominantArchetype = Object.entries(archetypeFrequency)
      .sort(([_, a], [__, b]) => b - a)[0]?.[0]

    // Generate constellation if pattern found
    if (recurringSymbols.length > 0) {
      const patternName = getPatternName(recurringSymbols, dominantArchetype)
      const description = generatePatternDescription(
        recurringSymbols,
        dominantArchetype
      )

      // Save constellation
      await prisma.constellation.create({
        data: {
          pattern: patternName,
          description,
          symbols: JSON.stringify(recurringSymbols),
          confidence: Math.min(recurringSymbols.length / 5, 1.0),
        },
      })

      return NextResponse.json({
        pattern: patternName,
        description,
        symbols: recurringSymbols,
        archetype: dominantArchetype,
      })
    }

    return NextResponse.json({
      pattern: null,
      message: 'No patterns detected in the last 7 days',
    })
  } catch (error) {
    console.error('Error analyzing constellations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function getPatternName(
  symbols: string[],
  archetype: string | undefined
): string {
  // Simple pattern naming based on symbols
  const waterSymbols = ['woda', 'deszcz', 'ocean', 'rzeka', 'jezioro']
  const fireSymbols = ['ogień', 'płomień', 'słońce', 'żar']
  const earthSymbols = ['ziemia', 'kamień', 'góra', 'piwnica']
  const airSymbols = ['wiatr', 'niebo', 'chmury', 'ptak']

  const hasWater = symbols.some((s) =>
    waterSymbols.some((ws) => s.toLowerCase().includes(ws))
  )
  const hasFire = symbols.some((s) =>
    fireSymbols.some((fs) => s.toLowerCase().includes(fs))
  )
  const hasEarth = symbols.some((s) =>
    earthSymbols.some((es) => s.toLowerCase().includes(es))
  )
  const hasAir = symbols.some((s) =>
    airSymbols.some((as) => s.toLowerCase().includes(as))
  )

  if (hasWater && symbols.length >= 3) return 'ZANURZENIE'
  if (hasFire && symbols.length >= 3) return 'POŻAR'
  if (hasEarth && symbols.length >= 3) return 'GRUNT'
  if (hasAir && symbols.length >= 3) return 'WZNIESIENIE'
  if (archetype === 'Cień') return 'CIENIE'
  if (archetype === 'Anima') return 'ANIMA'
  if (archetype === 'Animus') return 'ANIMUS'

  return 'WZORZEC'
}

function generatePatternDescription(
  symbols: string[],
  archetype: string | undefined
): string {
  const symbolList = symbols.join(', ')
  return `Wykryto powtarzające się symbole: ${symbolList}. ${
    archetype ? `Dominujący archetyp: ${archetype}.` : ''
  }`
}

