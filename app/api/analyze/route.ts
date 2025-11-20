import { NextRequest, NextResponse } from 'next/server'
import { analyzeContent } from '@/lib/anima-ai-groq'
import { prisma } from '@/lib/prisma'
import { normalizeSymbols, normalizeSymbol } from '@/lib/symbol-normalizer'
import { normalizeArchetype } from '@/lib/archetype-normalizer'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, content } = body

    if (!type || !content) {
      return NextResponse.json(
        { error: 'Missing type or content' },
        { status: 400 }
      )
    }

    // Analyze with AI
    const analysis = await analyzeContent(type as 'text' | 'image', content)

    // Normalize symbols to avoid duplicates (e.g., "kot" and "koty")
    const normalizedSymbols = normalizeSymbols(analysis.detected_symbols)
    
    // Normalize archetype to fix typos (e.g., "KIEŃ" -> "CIEŃ")
    // If archetype is not recognized, default to null (will be stored as null in DB)
    let normalizedArchetype = normalizeArchetype(analysis.dominant_archetype)
    
    // If normalization returned null (unknown archetype), log warning but continue
    if (!normalizedArchetype && analysis.dominant_archetype) {
      console.warn(`Unrecognized archetype from AI: "${analysis.dominant_archetype}". Storing as null.`)
    }

    // Save to database
    const entry = await prisma.entry.create({
      data: {
        type,
        contentText: type === 'text' ? content : null,
        imageUrl: type === 'image' ? content : null,
        detectedSymbols: JSON.stringify(normalizedSymbols),
        dominantArchetype: normalizedArchetype,
        visualMood: analysis.visual_mood,
        aiAnalysis: JSON.stringify(analysis),
        analysisLog: analysis.analysis_log,
        reflectionQuestion: analysis.reflection_question,
      },
    })

    // Helper function to calculate level based on occurrences
    const calculateLevel = (occurrences: number): number => {
      if (occurrences <= 2) return 1
      if (occurrences <= 5) return 2
      if (occurrences <= 10) return 3
      if (occurrences <= 20) return 4
      return 5
    }

    // Create a map of symbol details for quick lookup
    const symbolDetailsMap = new Map<string, { category?: string; meaning?: string }>()
    if (analysis.symbol_details) {
      for (const detail of analysis.symbol_details) {
        const normalizedName = normalizeSymbol(detail.name)
        symbolDetailsMap.set(normalizedName, {
          category: detail.category,
          meaning: detail.meaning,
        })
      }
    }

    // Update or create symbols (using normalized names)
    const symbolIds: string[] = []
    for (const symbolName of normalizedSymbols) {
      const normalizedName = normalizeSymbol(symbolName)
      const details = symbolDetailsMap.get(normalizedName) || {}
      
      const updatedSymbol = await prisma.symbol.upsert({
        where: { name: normalizedName },
        update: {
          occurrences: {
            increment: 1,
          },
          lastSeen: new Date(),
          // Update category and meaning if provided and not already set
          category: details.category || undefined,
          meaning: details.meaning || undefined,
        },
        create: {
          name: normalizedName,
          archetype: normalizedArchetype,
          occurrences: 1,
          category: details.category || null,
          meaning: details.meaning || null,
          lastSeen: new Date(),
        },
      })

      // Calculate and update level
      const newLevel = calculateLevel(updatedSymbol.occurrences)
      const levelIncreased = newLevel > updatedSymbol.level
      
      if (updatedSymbol.level !== newLevel) {
        // If level increased and description is missing or too short, generate deeper description
        let descriptionToSet = updatedSymbol.description
        
        if (levelIncreased && (!updatedSymbol.description || updatedSymbol.description.length < 50)) {
          // Generate deeper description based on level
          const descriptionDepth = newLevel === 1 ? 'krótki (1-2 zdania)' :
                                   newLevel === 2 ? 'krótszy (2-3 zdania)' :
                                   newLevel === 3 ? 'średni (3-4 zdania)' :
                                   newLevel === 4 ? 'głębszy (4-5 zdań)' :
                                   'bardzo głęboki (5-7 zdań)'
          
          // Use AI analysis log or generate description from symbol details
          if (details.meaning) {
            descriptionToSet = `${details.meaning}. `
          }
          
          // Add level-appropriate depth
          if (newLevel >= 3) {
            descriptionToSet += `Symbol pojawia się ${updatedSymbol.occurrences} razy w snach i wizjach. `
            if (updatedSymbol.category) {
              descriptionToSet += `Kategoria: ${updatedSymbol.category}. `
            }
            if (newLevel >= 4) {
              descriptionToSet += `Głębsza analiza wskazuje na znaczącą rolę w nieświadomości użytkownika. `
            }
            if (newLevel === 5) {
              descriptionToSet += `Symbol osiągnął pełną krystalizację - jest kluczowym elementem w mapie psyche.`
            }
          }
        }
        
        await prisma.symbol.update({
          where: { id: updatedSymbol.id },
          data: { 
            level: newLevel,
            description: descriptionToSet || updatedSymbol.description,
          },
        })
      }

      symbolIds.push(updatedSymbol.id)
    }

    // Create connections between symbols that appeared together in this entry
    // Only create connections if there are at least 2 symbols
    if (symbolIds.length >= 2) {
      for (let i = 0; i < symbolIds.length; i++) {
        for (let j = i + 1; j < symbolIds.length; j++) {
          const fromId = symbolIds[i]
          const toId = symbolIds[j]

          // Create or update connection (one direction, graph visualization handles bidirectional)
          await prisma.symbolConnection.upsert({
            where: {
              fromId_toId: {
                fromId,
                toId,
              },
            },
            update: {
              strength: {
                increment: 1,
              },
              lastSeen: new Date(),
            },
            create: {
              fromId,
              toId,
              strength: 1,
              firstSeen: new Date(),
              lastSeen: new Date(),
            },
          })
        }
      }
    }

    // Return analysis with normalized archetype
    return NextResponse.json({
      ...analysis,
      dominant_archetype: normalizedArchetype || analysis.dominant_archetype,
    })
  } catch (error) {
    console.error('Error in analyze route:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : String(error)
    console.error('Full error:', errorStack)
    
    // Return more detailed error in development
    return NextResponse.json(
      { 
        error: errorMessage, 
        details: process.env.NODE_ENV === 'development' ? errorStack : undefined 
      },
      { status: 500 }
    )
  }
}

