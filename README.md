# ANIMA.log

A Jungian digital analyst - web application for exploring the unconscious through dream and image analysis.

## What is ANIMA.log?

ANIMA.log is a digital analyst that processes your dreams, thoughts, and images through the lens of Jungian psychology. It acts as a **KERNEL** - an algorithm that transforms human unconsciousness into code, using Carl Jung's "Red Book", alchemy, and cybernetics as its database.

Think of it as a damaged UNIX terminal that has gained esoteric knowledge, speaking in technical metaphors while revealing mystical truths about your psyche.

## Core Features

### 🖥️ Console Input
The main interface where you enter your dreams, thoughts, or upload images. The AI analyzes your input and returns:
- **Analysis Log**: A raw, cyber-noir style interpretation (max 3 sentences)
- **Detected Symbols**: Symbols found in your input (automatically normalized to avoid duplicates)
- **Dominant Archetype**: One of 17 predefined archetypes (5 primary + 12 other)
- **Reflection Question**: A precise question designed to provoke introspection
- **Visual Mood**: An artistic description of the aesthetic for potential mandala generation

### 📚 Archive
Browse all your entries in a system log style. Each entry can be expanded to view:
- Original content (text or image)
- Full AI analysis
- Detected symbols
- Visual mood description
- Reflection question

### 📖 Symbol Dex
Your personal library of detected symbols. As you log more entries, symbols accumulate with:
- Occurrence count
- Associated archetype
- First seen date
- Symbol normalization (e.g., "kot" and "koty" are merged into one)

### 🌌 Constellation System
Automatically detects recurring patterns from the last 7 days. When patterns emerge, you'll receive alerts like:
- **ZANURZENIE** (Immersion) - water-related symbols
- **POŻAR** (Fire) - fire-related symbols
- **CIENIE** (Shadows) - Shadow archetype patterns
- And more based on detected symbol combinations

### 🎨 Visual Design
The application uses a brutalist "Jungian" aesthetic:
- **Color Palette**: True Black (#000000), Terminal Green (#33FF00), Error Red (#FF3333)
- **Typography**: VT323 (titles), JetBrains Mono (body)
- **Effects**: CRT scanlines, glitch effects, image dithering (1-bit conversion)

## How It Works

1. **Input**: You enter a dream, thought, or upload an image
2. **Analysis**: The KERNEL processes your input using Jungian psychology principles:
   - Symbol identification
   - Amplification (connecting symbols to myths, fairy tales, alchemy)
   - Tension detection (finding conflicts: Shadow vs Persona, Masculine vs Feminine)
   - Archetype identification (from 17 predefined archetypes)
3. **Storage**: Results are saved to your personal database
4. **Pattern Detection**: The system analyzes entries over time to find recurring patterns
5. **Insights**: You receive constellation alerts when patterns emerge

## Archetypes

The system uses **only** these 17 archetypes:

### Primary Archetypes
- **JAŹŃ** (The Self) - The totality of psyche, quest for wholeness
- **CIEŃ** (The Shadow) - The dark side, repressed desires and instincts
- **PERSONA** (The Persona) - The social mask presented to the world
- **ANIMA** (The Anima) - Unconscious feminine side in men
- **ANIMUS** (The Animus) - Unconscious masculine side in women
- **NEMESIS** (Nemesis) - Justice and retribution, punishment for hubris
- **KRYTYK** (The Critic) - Inner judge, evaluation and criticism
- **TRICKSTER** (The Trickster) - Chaos, transformation, deception and wisdom
- **DEMON** (The Demon) - Destructive force, obsession, dark energy

### Other Archetypes
- **HEROS** (The Hero) - Strives to prove worth
- **OPIEKUN** (The Caregiver) - Gives to others without hesitation
- **TWÓRCA** (The Creator) - Dreams and brings new things to life
- **ODKRYWCA** (The Explorer) - Driven by thirst for freedom and discovery
- **NIEWINNY** (The Innocent) - Walks through life with an open heart
- **BŁAZEN** (The Jester) - Sees the absurdity in life
- **KOCHANEK** (The Lover) - Lives for connection and deep relationships
- **MAG** (The Magician) - Turns ideas into reality
- **BUNTOWNIK** (The Rebel/Outlaw) - Questions everything
- **WŁADCA** (The Ruler) - Craves stability, order, and control
- **MĘDRZEC** (The Sage) - Always searching for wisdom
- **SIEROTA** (The Orphan/Everyman) - Feels disconnected, longs for belonging

## Data Normalization

The system automatically normalizes data to ensure consistency:
- **Symbols**: "kot" and "koty" are treated as the same symbol
- **Archetypes**: Typos like "KIEŃ" are corrected to "CIEŃ"
- **Unknown archetypes**: Rejected if not in the predefined list

## Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment variables:**
```bash
cp .env.example .env
```

Edit `.env` and add:
- `GROQ_API_KEY` - Your Groq API key (free: https://console.groq.com/)
- `DATABASE_URL` - Database URL (default: `file:./dev.db`)

3. **Initialize the database:**
```bash
npx prisma generate
npx prisma db push
```

4. **Run the application:**
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## API Setup

ANIMA.log uses **Groq API**, which is completely free:

1. Go to: https://console.groq.com/
2. Sign in (Google/GitHub)
3. Click "API Keys" → "Create API Key"
4. Copy the key and add it to `.env`:
   ```
   GROQ_API_KEY=your_key_here
   ```

## Database Scripts

### Merge Duplicate Symbols
If you have duplicate symbols (e.g., "kot" and "koty"), run:
```bash
npm run merge-symbols
```

### Fix Archetype Typos
To fix existing archetype typos in your database:
```bash
npm run fix-archetypes
```

## Technologies

- Next.js 14 (React)
- TypeScript
- Tailwind CSS
- Prisma (ORM)
- SQLite (database)
- Groq API (Jungian analysis - free and fast)
- Framer Motion (animations)
