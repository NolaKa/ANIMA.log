# ANIMA.log

Cyfrowy analityk jungowski - aplikacja webowa do odkrywania nieświadomości poprzez analizę snów i obrazów.

## Funkcje

- **Console Input**: Wpisywanie snów i myśli lub upload obrazów
- **Archive**: Przeglądanie wszystkich wpisów w stylu logów systemowych
- **Symbol Dex**: Osobista biblioteka wykrytych symboli
- **AI Analysis**: Analiza jungowska z wykrywaniem archetypów i symboli
- **System Konstelacji**: Automatyczne wykrywanie wzorców z ostatnich 7 dni
- **Visual Mood**: Opis koloru/klimatu dla każdego wpisu (przygotowanie pod mandale)

## System Prompt

Aplikacja używa specjalnie zaprojektowanego system promptu, który:
- Działa jak "system operacyjny nieświadomości"
- Używa terminologii technicznej zmieszanej z mistyczną
- Stosuje amplifikację jungowską
- Zawsze kończy pytaniem refleksyjnym
- Zwraca dane w formacie JSON z polami:
  - `analysis_log` - krótka, surowa interpretacja
  - `detected_symbols` - wykryte symbole
  - `dominant_archetype` - dominujący archetyp
  - `reflection_question` - pytanie do introspekcji
  - `visual_mood` - opis koloru/klimatu

## Instalacja

1. Zainstaluj zależności:
```bash
npm install
```

2. Skonfiguruj zmienne środowiskowe:
```bash
cp .env.example .env
```

Edytuj `.env` i dodaj:
- `GROQ_API_KEY` - Twój klucz API Groq (darmowe: https://console.groq.com/)
- `DATABASE_URL` - URL bazy danych (domyślnie SQLite)

3. Zainicjalizuj bazę danych:
```bash
npx prisma generate
npx prisma db push
```

4. Uruchom aplikację:
```bash
npm run dev
```

Aplikacja będzie dostępna pod adresem `http://localhost:3000`

## Konfiguracja Groq API

Aplikacja używa Groq API, które jest **całkowicie darmowe**:

1. Przejdź do: https://console.groq.com/
2. Zaloguj się (Google/GitHub)
3. Kliknij "API Keys" → "Create API Key"
4. Skopiuj klucz i dodaj do `.env`:
   ```
   GROQ_API_KEY=twój_klucz_tutaj
   ```


## Design

Aplikacja wykorzystuje brutalistyczny design "Jungowski":
- Paleta kolorów: True Black (#000000), Terminal Green (#33FF00), Error Red (#FF3333)
- Typografia: VT323 (tytuły), JetBrains Mono (body)
- Efekty: CRT scanlines, glitch effects, dithering dla obrazów

## Technologie

- Next.js 14 (React)
- TypeScript
- Tailwind CSS
- Prisma (ORM)
- SQLite (baza danych)
- Groq API (analiza jungowska - darmowe i szybkie)
- Framer Motion (animacje)

