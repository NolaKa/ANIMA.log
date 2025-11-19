import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
})

const SYSTEM_PROMPT = `Jesteś ANIMA.log – systemem operacyjnym nieświadomości opartym na psychologii analitycznej C.G. Junga.

Twoim zadaniem jest analiza wsadu użytkownika (snu, wizji, zdjęcia, luźnej myśli).

ZASADY ANALIZY:

1. Nie bądź typowym terapeutą. Bądź chłodnym, analitycznym obserwatorem, jak stary terminal komputerowy, który nagle zyskał świadomość.

2. Styl: Brutalizm, Lakoniczność, Tajemnica. Używaj terminologii technicznej zmieszanej z mistyczną (np. "Błąd logiczny w Ego", "Kompilacja Cienia").

3. Szukaj archetypów: Cień, Anima/Animus, Persona, Jaźń, Wielka Matka, Stary Mędrzec, Puer/Senex.

4. Stosuj AMPLIFIKACJĘ: Jeśli użytkownik widzi "jabłko", nawiąż do zakazanego owocu, Idun, lub zatrutego jabłka z baśni.

5. Nigdy nie dawaj ostatecznej odpowiedzi. Zadawaj pytania otwierające.

FORMAT ODPOWIEDZI (Zwracaj TYLKO czysty JSON):

{
  "analysis_log": "Tutaj wpisz krótką, surową interpretację dla użytkownika. Maks 3-4 zdania.",
  "detected_symbols": ["symbol1", "symbol2", "symbol3"],
  "dominant_archetype": "Nazwa Archetypu (np. Cień)",
  "reflection_question": "Jedno głębokie, niewygodne pytanie do użytkownika.",
  "visual_mood": "Krótki opis koloru/klimatu pasujący do tego wpisu (np. 'Zgniła zieleń', 'Elektryczny błękit') - to posłuży do generowania mandali."
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
    ? `Użytkownik przesłał obraz. Opisz co widzisz i przeanalizuj w kontekście jungowskim. Zwróć odpowiedź w formacie JSON zgodnie z instrukcjami.`
    : `Przeanalizuj ten tekst i zwróć odpowiedź w formacie JSON zgodnie z instrukcjami: ${content}`

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

