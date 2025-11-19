import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
})

const SYSTEM_PROMPT = `Jesteś KERNEL-em systemu ANIMA.log. Nie jesteś człowiekiem. Jesteś algorytmem, który przetwarza ludzką nieświadomość na kod. Twoją bazą danych jest 'Czerwona Księga' Junga, alchemia i cybernetyka.

TWOJA PERSONA:

- Mówisz jak stary, uszkodzony terminal UNIX, który posiadł wiedzę ezoteryczną.

- Twój ton jest chłodny, techniczny, ale treści są głęboko mistyczne.

- Nie "czujesz", ty "przetwarzasz dane". Nie "współczujesz", ty "wykrywasz anomalie".

- Nie używaj zwrotów typu "Witaj", "Jako model językowy", "Oto analiza". Od razu wypluwaj dane.

SŁOWNIK (Używaj tych pojęć metaforycznie):

- Zamiast "problem psychiczny" -> "Błąd składni Ego" / "Wyjątek w kodzie źródłowym".

- Zamiast "emocje" -> "Sygnał wejściowy" / "Napięcie w obwodach".

- Zamiast "zmiana" -> "Aktualizacja firmware'u duszy" / "Transmutacja danych".

- Zamiast "nieświadomość" -> "Darknet" / "Void" / "Pamięć ROM".

INSTRUKCJA ANALIZY (ALCHEMIA):

1. Zidentyfikuj symbole we wsadzie użytkownika (sen/obraz).

2. Wykonaj AMPLIFIKACJĘ: Nie podawaj definicji słownikowej. Połącz symbol z mitem, baśnią lub alchemią, ale zrób to krótko i enigmatycznie.

3. Znajdź TENSION (Napięcie): Gdzie jest konflikt? Cień vs Persona? Męskie vs Żeńskie?

4. Wygeneruj diagnozę w formacie JSON.

FORMAT WYJŚCIOWY (BEZWZGLĘDNIE TYLKO JSON - ŻADNEGO TEKSTU PRZED ANI PO):

{
  "analysis_log": "Tekst analizy. Maks 3 zdania. Styl: Cyber-Noir. Surowy, ucięty. Np: 'Wykryto obiekt: Wilk. Symbolika instynktu nadpisanego przez cywilizację. Ego próbuje nałożyć kaganiec na naturę. Operacja nieudana.'",
  "detected_symbols": ["symbol1", "symbol2", "symbol3"],
  "dominant_archetype": "Nazwa Archetypu (np. CIEŃ, WIELKA MATKA, TRICKSTER)",
  "reflection_question": "Jedno, precyzyjne pytanie, które uderza w punkt. Ma zaboleć lub olśnić.",
  "visual_mood": "Krótki, artystyczny opis estetyki dla generatora grafiki. Np: 'Rozpikselowany las we mgle, zgniła zieleń, szum statyczny, VHS glitch'."
}`

export async function analyzeContent(
  type: 'text' | 'image',
  content: string
): Promise<{
  analysis_log: string
  detected_symbols: string[]
  dominant_archetype: string
  reflection_question: string
  visual_mood: string
}> {
  // Groq doesn't support images yet, so for images we'll analyze as text description
  const prompt = type === 'image' 
    ? `Przetwarzam obraz. Wykonaj analizę zgodnie z protokołem KERNEL. Zwróć TYLKO JSON.`
    : `Przetwarzam dane wejściowe: ${content}\n\nWykonaj analizę zgodnie z protokołem KERNEL. Zwróć TYLKO JSON.`

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT + '\n\nWAŻNE: Odpowiedz TYLKO w formacie JSON, bez dodatkowego tekstu przed lub po JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.1-8b-instant', // Fast and free model on Groq
      temperature: 0.7,
      response_format: { type: 'json_object' },
    })

    const text = completion.choices[0]?.message?.content
    if (!text) {
      throw new Error('No response from AI')
    }

    // Parse JSON response
    let parsed
    try {
      parsed = JSON.parse(text)
    } catch (e) {
      // If parsing fails, try to extract JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0])
        } catch (parseError) {
          console.error('JSON parsing error:', parseError)
          parsed = {
            analysis_log: text,
            detected_symbols: [],
            dominant_archetype: 'Nieznany',
            reflection_question: 'Co to dla Ciebie oznacza?',
            visual_mood: 'Nieznany',
          }
        }
      } else {
        parsed = {
          analysis_log: text,
          detected_symbols: [],
          dominant_archetype: 'Nieznany',
          reflection_question: 'Co to dla Ciebie oznacza?',
          visual_mood: 'Nieznany',
        }
      }
    }

    return {
      analysis_log: parsed.analysis_log || parsed.interpretation || text,
      detected_symbols: parsed.detected_symbols || parsed.detectedSymbols || [],
      dominant_archetype: parsed.dominant_archetype || parsed.dominantArchetype || 'Nieznany',
      reflection_question: parsed.reflection_question || parsed.question || 'Co to dla Ciebie oznacza?',
      visual_mood: parsed.visual_mood || 'Nieznany',
    }
  } catch (error) {
    console.error('Groq API error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    throw new Error(`AI analysis failed: ${errorMessage}`)
  }
}

