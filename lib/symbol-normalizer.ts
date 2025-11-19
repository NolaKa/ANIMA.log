/**
 * Normalizes symbol names to avoid duplicates like "kot" and "koty"
 * Converts to lowercase and removes pluralization
 */

export function normalizeSymbol(symbol: string): string {
  if (!symbol || symbol.trim().length === 0) {
    return symbol
  }

  // Convert to lowercase and trim
  let normalized = symbol.toLowerCase().trim()

  // Simple pluralization removal for Polish
  // Common patterns: -y, -i, -e, -a (plural endings)
  const pluralEndings = [
    { pattern: /(.*)y$/, replacement: '$1' },      // koty -> kot
    { pattern: /(.*)i$/, replacement: '$1' },      // psy -> ps (but we'll handle this better)
    { pattern: /(.*)e$/, replacement: '$1' },      // drzewa -> drzew (but e is also singular)
    { pattern: /(.*)a$/, replacement: '$1' },     // kobiety -> kobiety (but a can be singular)
  ]

  // More specific rules for common words
  const specificRules: Record<string, string> = {
    'koty': 'kot',
    'psy': 'pies',
    'drzewa': 'drzewo',
    'kobiety': 'kobieta',
    'mężczyźni': 'mężczyzna',
    'dzieci': 'dziecko',
    'ludzie': 'człowiek',
    'zwierzęta': 'zwierzę',
    'ptaki': 'ptak',
    'ryby': 'ryba',
    'kwiaty': 'kwiat',
    'kamienie': 'kamień',
    'wody': 'woda',
    'ogień': 'ogień', // already singular
    'słońce': 'słońce',
    'księżyc': 'księżyc',
    'gwiazdy': 'gwiazda',
    'chmury': 'chmura',
    'góry': 'góra',
    'las': 'las',
    'lasy': 'las',
    'domy': 'dom',
    'miasta': 'miasto',
    'ulice': 'ulica',
    'samochody': 'samochód',
    'pociągi': 'pociąg',
    'mosty': 'most',
    'rzeki': 'rzeka',
    'morza': 'morze',
    'oceany': 'ocean',
  }

  // Check specific rules first
  if (specificRules[normalized]) {
    return specificRules[normalized]
  }

  // Apply general pluralization rules
  for (const { pattern, replacement } of pluralEndings) {
    if (pattern.test(normalized)) {
      const candidate = normalized.replace(pattern, replacement)
      // Only apply if the result makes sense (not too short)
      if (candidate.length >= 2) {
        normalized = candidate
        break
      }
    }
  }

  return normalized
}

/**
 * Normalizes an array of symbols, removing duplicates
 */
export function normalizeSymbols(symbols: string[]): string[] {
  const normalized = symbols.map(normalizeSymbol).filter(Boolean)
  // Remove duplicates while preserving order
  return Array.from(new Set(normalized))
}

