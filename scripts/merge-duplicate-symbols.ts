/**
 * Script to merge duplicate symbols in the database
 * Example: merges "kot" and "koty" into "kot"
 */

import { PrismaClient } from '@prisma/client'
import { normalizeSymbol } from '../lib/symbol-normalizer'

const prisma = new PrismaClient()

async function mergeDuplicateSymbols() {
  console.log('🔍 Scanning for duplicate symbols...')

  // Get all symbols
  const allSymbols = await prisma.symbol.findMany()

  // Group symbols by normalized name
  const symbolGroups = new Map<string, typeof allSymbols>()

  for (const symbol of allSymbols) {
    const normalized = normalizeSymbol(symbol.name)
    if (!symbolGroups.has(normalized)) {
      symbolGroups.set(normalized, [])
    }
    symbolGroups.get(normalized)!.push(symbol)
  }

  // Find groups with duplicates
  const duplicates = Array.from(symbolGroups.entries()).filter(
    ([_, symbols]) => symbols.length > 1
  )

  if (duplicates.length === 0) {
    console.log('✅ No duplicates found!')
    return
  }

  console.log(`📊 Found ${duplicates.length} groups with duplicates:`)

  for (const [normalized, symbols] of duplicates) {
    console.log(`\n  "${normalized}": ${symbols.map((s) => `"${s.name}"`).join(', ')}`)

    // Find the best symbol to keep (prefer the normalized one, or the one with most occurrences)
    const sorted = symbols.sort((a, b) => {
      // Prefer exact match with normalized name
      if (a.name === normalized && b.name !== normalized) return -1
      if (b.name === normalized && a.name !== normalized) return 1
      // Otherwise prefer more occurrences
      return b.occurrences - a.occurrences
    })

    const keepSymbol = sorted[0]
    const mergeSymbols = sorted.slice(1)

    // Calculate total occurrences
    const totalOccurrences = symbols.reduce((sum, s) => sum + s.occurrences, 0)

    console.log(`    → Keeping "${keepSymbol.name}" (${keepSymbol.occurrences} occurrences)`)
    console.log(`    → Merging ${mergeSymbols.length} symbols into it`)

    // Update the kept symbol
    await prisma.symbol.update({
      where: { id: keepSymbol.id },
      data: {
        name: normalized, // Ensure normalized name
        occurrences: totalOccurrences,
      },
    })

    // Update all entries that reference merged symbols
    const allEntries = await prisma.entry.findMany()
    for (const entry of allEntries) {
      const symbols = JSON.parse(entry.detectedSymbols || '[]') as string[]
      let updated = false
      const newSymbols = symbols.map((symbol) => {
        const normalizedSymbol = normalizeSymbol(symbol)
        if (normalizedSymbol === normalized && symbol !== normalized) {
          updated = true
          return normalized
        }
        return symbol
      })

      if (updated) {
        await prisma.entry.update({
          where: { id: entry.id },
          data: {
            detectedSymbols: JSON.stringify(newSymbols),
          },
        })
      }
    }

    // Delete merged symbols
    for (const symbol of mergeSymbols) {
      await prisma.symbol.delete({
        where: { id: symbol.id },
      })
      console.log(`    ✓ Deleted "${symbol.name}"`)
    }
  }

  console.log('\n✅ Merge complete!')
}

mergeDuplicateSymbols()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

