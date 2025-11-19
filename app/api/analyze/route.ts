import { NextRequest, NextResponse } from 'next/server'
import { analyzeContent } from '@/lib/anima-ai-groq'
import { prisma } from '@/lib/prisma'

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

    // Save to database
    const entry = await prisma.entry.create({
      data: {
        type,
        contentText: type === 'text' ? content : null,
        imageUrl: type === 'image' ? content : null,
        detectedSymbols: JSON.stringify(analysis.detected_symbols),
        dominantArchetype: analysis.dominant_archetype,
        visualMood: analysis.visual_mood,
        aiAnalysis: JSON.stringify(analysis),
        analysisLog: analysis.analysis_log,
        reflectionQuestion: analysis.reflection_question,
      },
    })

    // Update or create symbols
    for (const symbolName of analysis.detected_symbols) {
      await prisma.symbol.upsert({
        where: { name: symbolName },
        update: {
          occurrences: {
            increment: 1,
          },
        },
        create: {
          name: symbolName,
          archetype: analysis.dominant_archetype,
          occurrences: 1,
        },
      })
    }

    return NextResponse.json(analysis)
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

