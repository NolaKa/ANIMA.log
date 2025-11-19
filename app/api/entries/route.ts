import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const entries = await prisma.entry.findMany({
      orderBy: {
        timestamp: 'desc',
      },
    })

    const formattedEntries = entries.map((entry) => ({
      id: entry.id,
      timestamp: entry.timestamp.toISOString(),
      type: entry.type,
      content: entry.type === 'text' ? entry.contentText : entry.imageUrl,
      contentText: entry.contentText,
      imageUrl: entry.imageUrl,
      detectedSymbols: JSON.parse(entry.detectedSymbols || '[]'),
      dominantArchetype: entry.dominantArchetype,
      visualMood: entry.visualMood,
      analysisLog: entry.analysisLog,
      reflectionQuestion: entry.reflectionQuestion,
      aiAnalysis: entry.aiAnalysis ? JSON.parse(entry.aiAnalysis) : null,
    }))

    return NextResponse.json(formattedEntries)
  } catch (error) {
    console.error('Error fetching entries:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

