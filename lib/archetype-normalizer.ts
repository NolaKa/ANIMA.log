/**
 * Normalizes archetype names to fix typos and standardize naming
 * Example: "KIEŃ" -> "CIEŃ", "Cień" -> "CIEŃ"
 */

// Standard archetype names (uppercase) - ONLY these archetypes are allowed
// Primary archetypes
const PRIMARY_ARCHETYPES = [
  'JAŹŃ',      // The Self
  'CIEŃ',      // The Shadow
  'PERSONA',   // The Persona
  'ANIMA',     // The Anima
  'ANIMUS',    // The Animus
  'NEMESIS',   // Nemesis
  'KRYTYK',    // The Critic
  'TRICKSTER', // The Trickster
  'DEMON',     // The Demon
] as const

// Other notable archetypes
const OTHER_ARCHETYPES = [
  'HEROS',     // The Hero
  'OPIEKUN',   // The Caregiver
  'TWÓRCA',    // The Creator
  'ODKRYWCA',  // The Explorer
  'NIEWINNY',  // The Innocent
  'BŁAZEN',    // The Jester
  'KOCHANEK',  // The Lover
  'MAG',       // The Magician
  'BUNTOWNIK', // The Rebel/Outlaw
  'WŁADCA',    // The Ruler
  'MĘDRZEC',   // The Sage
  'SIEROTA',   // The Orphan/Everyman
] as const

const STANDARD_ARCHETYPES = [...PRIMARY_ARCHETYPES, ...OTHER_ARCHETYPES] as const

// Common typos and variations mapping
const ARCHETYPE_CORRECTIONS: Record<string, string> = {
  // Primary archetypes
  
  // JAŹŃ (The Self) variations
  'JAŹŃ': 'JAŹŃ',
  'JAŹN': 'JAŹŃ',
  'jaźń': 'JAŹŃ',
  'Jaźń': 'JAŹŃ',
  'SELF': 'JAŹŃ',
  'self': 'JAŹŃ',
  'The Self': 'JAŹŃ',
  'THE SELF': 'JAŹŃ',
  
  // CIEŃ (The Shadow) variations
  'KIEŃ': 'CIEŃ',
  'CIEN': 'CIEŃ',
  'CIENI': 'CIEŃ',
  'CIENIE': 'CIEŃ',
  'Cień': 'CIEŃ',
  'Cien': 'CIEŃ',
  'cień': 'CIEŃ',
  'SHADOW': 'CIEŃ',
  'shadow': 'CIEŃ',
  'The Shadow': 'CIEŃ',
  'THE SHADOW': 'CIEŃ',
  
  // PERSONA variations
  'persona': 'PERSONA',
  'Persona': 'PERSONA',
  'PERSONA': 'PERSONA',
  'The Persona': 'PERSONA',
  'THE PERSONA': 'PERSONA',
  
  // ANIMA variations
  'anima': 'ANIMA',
  'Anima': 'ANIMA',
  'ANIMA': 'ANIMA',
  'The Anima': 'ANIMA',
  'THE ANIMA': 'ANIMA',
  
  // ANIMUS variations
  'animus': 'ANIMUS',
  'Animus': 'ANIMUS',
  'ANIMUS': 'ANIMUS',
  'The Animus': 'ANIMUS',
  'THE ANIMUS': 'ANIMUS',
  
  // NEMESIS variations
  'nemesis': 'NEMESIS',
  'Nemesis': 'NEMESIS',
  'NEMESIS': 'NEMESIS',
  'The Nemesis': 'NEMESIS',
  'THE NEMESIS': 'NEMESIS',
  
  // KRYTYK (The Critic) variations
  'krytyk': 'KRYTYK',
  'Krytyk': 'KRYTYK',
  'KRYTYK': 'KRYTYK',
  'CRITIC': 'KRYTYK',
  'critic': 'KRYTYK',
  'The Critic': 'KRYTYK',
  'THE CRITIC': 'KRYTYK',
  
  // TRICKSTER variations (moved from other to primary)
  'trickster': 'TRICKSTER',
  'Trickster': 'TRICKSTER',
  'TRICKSTER': 'TRICKSTER',
  'The Trickster': 'TRICKSTER',
  'THE TRICKSTER': 'TRICKSTER',
  
  // DEMON variations
  'demon': 'DEMON',
  'Demon': 'DEMON',
  'DEMON': 'DEMON',
  'The Demon': 'DEMON',
  'THE DEMON': 'DEMON',
  
  // Other archetypes
  
  // HEROS (The Hero) variations
  'heros': 'HEROS',
  'Heros': 'HEROS',
  'HERO': 'HEROS',
  'hero': 'HEROS',
  'The Hero': 'HEROS',
  'THE HERO': 'HEROS',
  
  // OPIEKUN (The Caregiver) variations
  'opiekun': 'OPIEKUN',
  'Opiekun': 'OPIEKUN',
  'CAREGIVER': 'OPIEKUN',
  'caregiver': 'OPIEKUN',
  'The Caregiver': 'OPIEKUN',
  'THE CAREGIVER': 'OPIEKUN',
  
  // TWÓRCA (The Creator) variations
  'twórca': 'TWÓRCA',
  'Twórca': 'TWÓRCA',
  'TWORCA': 'TWÓRCA',
  'CREATOR': 'TWÓRCA',
  'creator': 'TWÓRCA',
  'The Creator': 'TWÓRCA',
  'THE CREATOR': 'TWÓRCA',
  
  // ODKRYWCA (The Explorer) variations
  'odkrywca': 'ODKRYWCA',
  'Odkrywca': 'ODKRYWCA',
  'EXPLORER': 'ODKRYWCA',
  'explorer': 'ODKRYWCA',
  'The Explorer': 'ODKRYWCA',
  'THE EXPLORER': 'ODKRYWCA',
  
  // NIEWINNY (The Innocent) variations
  'niewinny': 'NIEWINNY',
  'Niewinny': 'NIEWINNY',
  'INNOCENT': 'NIEWINNY',
  'innocent': 'NIEWINNY',
  'The Innocent': 'NIEWINNY',
  'THE INNOCENT': 'NIEWINNY',
  
  // BŁAZEN (The Jester) variations
  'błazen': 'BŁAZEN',
  'Błazen': 'BŁAZEN',
  'BLAZEN': 'BŁAZEN',
  'JESTER': 'BŁAZEN',
  'jester': 'BŁAZEN',
  'The Jester': 'BŁAZEN',
  'THE JESTER': 'BŁAZEN',
  
  // KOCHANEK (The Lover) variations
  'kochanek': 'KOCHANEK',
  'Kochanek': 'KOCHANEK',
  'LOVER': 'KOCHANEK',
  'lover': 'KOCHANEK',
  'The Lover': 'KOCHANEK',
  'THE LOVER': 'KOCHANEK',
  
  // MAG (The Magician) variations
  'mag': 'MAG',
  'Mag': 'MAG',
  'MAGICIAN': 'MAG',
  'magician': 'MAG',
  'The Magician': 'MAG',
  'THE MAGICIAN': 'MAG',
  
  // BUNTOWNIK (The Rebel/Outlaw) variations
  'buntownik': 'BUNTOWNIK',
  'Buntownik': 'BUNTOWNIK',
  'REBEL': 'BUNTOWNIK',
  'rebel': 'BUNTOWNIK',
  'OUTLAW': 'BUNTOWNIK',
  'outlaw': 'BUNTOWNIK',
  'The Rebel': 'BUNTOWNIK',
  'The Outlaw': 'BUNTOWNIK',
  'THE REBEL': 'BUNTOWNIK',
  'THE OUTLAW': 'BUNTOWNIK',
  
  // WŁADCA (The Ruler) variations
  'władca': 'WŁADCA',
  'Władca': 'WŁADCA',
  'WLADCA': 'WŁADCA',
  'RULER': 'WŁADCA',
  'ruler': 'WŁADCA',
  'The Ruler': 'WŁADCA',
  'THE RULER': 'WŁADCA',
  
  // MĘDRZEC (The Sage) variations
  'mędrzec': 'MĘDRZEC',
  'Mędrzec': 'MĘDRZEC',
  'MEDRZEC': 'MĘDRZEC',
  'SAGE': 'MĘDRZEC',
  'sage': 'MĘDRZEC',
  'STARY MĘDRZEC': 'MĘDRZEC', // Old Wise Man = Sage
  'stary mędrzec': 'MĘDRZEC',
  'OLD WISE MAN': 'MĘDRZEC',
  'The Sage': 'MĘDRZEC',
  'THE SAGE': 'MĘDRZEC',
  
  // SIEROTA (The Orphan/Everyman) variations
  'sierota': 'SIEROTA',
  'Sierota': 'SIEROTA',
  'ORPHAN': 'SIEROTA',
  'orphan': 'SIEROTA',
  'EVERYMAN': 'SIEROTA',
  'everyman': 'SIEROTA',
  'The Orphan': 'SIEROTA',
  'The Everyman': 'SIEROTA',
  'THE ORPHAN': 'SIEROTA',
  'THE EVERYMAN': 'SIEROTA',
}

/**
 * Normalizes an archetype name, fixing typos and standardizing to uppercase
 */
export function normalizeArchetype(archetype: string | null | undefined): string | null {
  if (!archetype || archetype.trim().length === 0) {
    return null
  }

  const trimmed = archetype.trim()
  
  // Check direct corrections first
  if (ARCHETYPE_CORRECTIONS[trimmed]) {
    return ARCHETYPE_CORRECTIONS[trimmed]
  }
  
  // Check case-insensitive corrections
  const upperTrimmed = trimmed.toUpperCase()
  if (ARCHETYPE_CORRECTIONS[upperTrimmed]) {
    return ARCHETYPE_CORRECTIONS[upperTrimmed]
  }
  
  // Fuzzy matching for common typos
  // Fix "KIEŃ" -> "CIEŃ" (common OCR/typing error)
  if (upperTrimmed.includes('KIEŃ') || upperTrimmed === 'KIEN') {
    return 'CIEŃ'
  }
  
  // Check if it's close to any standard archetype (Levenshtein-like)
  for (const standard of STANDARD_ARCHETYPES) {
    const similarity = calculateSimilarity(upperTrimmed, standard)
    // If similarity is high (>= 0.8), use the standard
    if (similarity >= 0.8) {
      return standard
    }
  }
  
  // If no match found and it's not a known archetype, return null
  // This will be handled by the calling code
  console.warn(`Unknown archetype detected: "${archetype}". Normalized to: "${upperTrimmed}". Consider adding to ARCHETYPE_CORRECTIONS.`)
  return null
}

/**
 * Simple similarity calculation (0-1)
 * Checks how many characters match in similar positions
 */
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2
  const shorter = str1.length > str2.length ? str2 : str1
  
  if (longer.length === 0) return 1.0
  
  // Simple character-based similarity
  let matches = 0
  for (let i = 0; i < shorter.length; i++) {
    if (longer.includes(shorter[i])) {
      matches++
    }
  }
  
  return matches / longer.length
}

/**
 * Validates if an archetype is a known standard archetype
 */
export function isValidArchetype(archetype: string | null | undefined): boolean {
  if (!archetype) return false
  const normalized = normalizeArchetype(archetype)
  return STANDARD_ARCHETYPES.includes(normalized as any)
}

