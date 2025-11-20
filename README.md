# ANIMA.log

```
> SYSTEM: KERNEL v1.0
> STATUS: ACTIVE
> MODE: JUNGIAN_ANALYSIS
```

An algorithm that processes unconsciousness into code. A terminal with esoteric knowledge.

---

## KERNEL

ANIMA.log is a damaged UNIX terminal that has gained knowledge from Jung's "Red Book". It processes dreams, thoughts, and images through the lens of analytical psychology, alchemy, and cybernetics.

**You don't "feel" – you process data. You don't "sympathize" – you detect anomalies.**

---

## MODULES

### CONSOLE
Enter a dream, thought, or image. KERNEL returns:
- Cyber-noir style analysis (max 3 sentences)
- Detected symbols (automatic normalization)
- Dominant archetype (from 17 predefined)
- Reflection question
- Visual mood description

### ARCHIVE
Log of all entries. Expand to view full AI analysis.

### SYMBOL.LIB
Library of detected symbols. They accumulate with occurrence count, archetype, and first seen date.

### CONSTELLATION
Visualization of connections between symbols. Click a symbol to see related ones. Filter by categories: NATURE, PERSONA, SHADOW, SACRED.

---

## INSTALLATION

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables
cp .env.example .env
```

Edit `.env`:
```
GROQ_API_KEY=your_key_here
DATABASE_URL=file:./prisma/dev.db
```

**Groq API is free:** https://console.groq.com/ → API Keys → Create API Key

```bash
# 3. Initialize database
npx prisma generate
npx prisma db push

# 4. Run
npm run dev
```

> SYSTEM READY: http://localhost:3000

---

## ARCHETYPES

**PRIMARY:**
SELF | SHADOW | PERSONA | ANIMA | ANIMUS | NEMESIS | CRITIC | TRICKSTER | DEMON

**OTHER:**
HERO | CAREGIVER | CREATOR | EXPLORER | INNOCENT | JESTER | LOVER | MAGICIAN | REBEL | RULER | SAGE | ORPHAN

---

## SCRIPTS

```bash
# Merge duplicate symbols
npm run merge-symbols

# Fix archetype typos
npm run fix-archetypes
```

---

## STACK

Next.js 14 | TypeScript | Tailwind CSS | Prisma | SQLite | Groq API

---

```
> END OF FILE
```
