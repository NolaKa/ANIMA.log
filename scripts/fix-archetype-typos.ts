/**
 * Script to fix archetype typos in existing database entries
 * Example: fixes "KIEŃ" -> "CIEŃ"
 */

import { PrismaClient } from '@prisma/client'
import { normalizeArchetype } from '../lib/archetype-normalizer'

const prisma = new PrismaClient()

async function fixArchetypeTypos() {
  console.log('🔍 Scanning for archetype typos...')

  // Get all entries with archetypes
  const entries = await prisma.entry.findMany({
    where: {
      dominantArchetype: {
        not: null,
      },
    },
  })

  console.log(`📊 Found ${entries.length} entries with archetypes`)

  let fixed = 0
  const corrections: Record<string, string> = {}

  for (const entry of entries) {
    if (!entry.dominantArchetype) continue

    const normalized = normalizeArchetype(entry.dominantArchetype)
    
    if (normalized !== entry.dominantArchetype) {
      corrections[entry.dominantArchetype] = normalized || 'null'
      
      await prisma.entry.update({
        where: { id: entry.id },
        data: {
          dominantArchetype: normalized,
        },
      })
      
      fixed++
    }
  }

  // Also fix symbols
  const symbols = await prisma.symbol.findMany({
    where: {
      archetype: {
        not: null,
      },
    },
  })

  console.log(`\n📊 Found ${symbols.length} symbols with archetypes`)

  for (const symbol of symbols) {
    if (!symbol.archetype) continue

    const normalized = normalizeArchetype(symbol.archetype)
    
    if (normalized !== symbol.archetype) {
      corrections[symbol.archetype] = normalized || 'null'
      
      await prisma.symbol.update({
        where: { id: symbol.id },
        data: {
          archetype: normalized,
        },
      })
      
      fixed++
    }
  }

  if (Object.keys(corrections).length > 0) {
    console.log('\n✅ Corrections made:')
    for (const [wrong, correct] of Object.entries(corrections)) {
      console.log(`  "${wrong}" → "${correct}"`)
    }
    console.log(`\n✅ Fixed ${fixed} entries/symbols`)
  } else {
    console.log('\n✅ No typos found!')
  }
}

fixArchetypeTypos()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

