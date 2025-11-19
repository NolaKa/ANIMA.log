# ANIMA.log

A Jungian digital analyst - web application for exploring the unconscious through dream and image analysis.

## Features

- **Console Input**: Enter dreams and thoughts or upload images
- **Archive**: Browse all entries in system log style
- **Symbol Dex**: Personal library of detected symbols
- **AI Analysis**: Jungian analysis with archetype and symbol detection
- **Constellation System**: Automatic pattern detection from the last 7 days
- **Visual Mood**: Color/mood description for each entry (preparation for mandalas)

## System Prompt

The application uses a specially designed system prompt that:
- Acts as an "operating system of the unconscious"
- Uses technical terminology mixed with mystical
- Applies Jungian amplification
- Always ends with a reflective question
- Returns data in JSON format with fields:
  - `analysis_log` - short, raw interpretation
  - `detected_symbols` - detected symbols
  - `dominant_archetype` - dominant archetype
  - `reflection_question` - introspection question
  - `visual_mood` - color/mood description

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add:
- `GROQ_API_KEY` - Your Groq API key (free: https://console.groq.com/)
- `DATABASE_URL` - Database URL (default SQLite)

3. Initialize the database:
```bash
npx prisma generate
npx prisma db push
```

4. Run the application:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Groq API Configuration

The application uses Groq API, which is **completely free**:

1. Go to: https://console.groq.com/
2. Sign in (Google/GitHub)
3. Click "API Keys" → "Create API Key"
4. Copy the key and add it to `.env`:
   ```
   GROQ_API_KEY=your_key_here
   ```

## Design

The application uses a brutalist "Jungian" design:
- Color palette: True Black (#000000), Terminal Green (#33FF00), Error Red (#FF3333)
- Typography: VT323 (titles), JetBrains Mono (body)
- Effects: CRT scanlines, glitch effects, image dithering

## Technologies

- Next.js 14 (React)
- TypeScript
- Tailwind CSS
- Prisma (ORM)
- SQLite (database)
- Groq API (Jungian analysis - free and fast)
- Framer Motion (animations)
