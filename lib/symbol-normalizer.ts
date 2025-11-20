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

  // Since AI already returns symbols in nominative singular form,
  // we should be very conservative with normalization.
  // Only handle obvious plural forms that AI might occasionally return.

  // Specific rules for known plural forms
  const specificRules: Record<string, string> = {
    // Animals
    'koty': 'kot',
    'psy': 'pies',
    'ptaki': 'ptak',
    'ryby': 'ryba',
    'zwierzęta': 'zwierzę',
    // People
    'kobiety': 'kobieta',
    'mężczyźni': 'mężczyzna',
    'dzieci': 'dziecko',
    'ludzie': 'człowiek',
    // Nature
    'drzewa': 'drzewo',
    'kwiaty': 'kwiat',
    'kamienie': 'kamień',
    'wody': 'woda',
    'gwiazdy': 'gwiazda',
    'chmury': 'chmura',
    'góry': 'góra',
    'lasy': 'las',
    'rzeki': 'rzeka',
    'morza': 'morze',
    'oceany': 'ocean',
    // Objects
    'domy': 'dom',
    'miasta': 'miasto',
    'ulice': 'ulica',
    'samochody': 'samochód',
    'pociągi': 'pociąg',
    'mosty': 'most',
  }

  // Check specific rules first - only normalize if it's a known plural form
  if (specificRules[normalized]) {
    return specificRules[normalized]
  }

  // VERY CONSERVATIVE: Since AI already returns nominative singular,
  // we should NOT apply any automatic pluralization removal.
  // Only use specific rules for known plural forms.
  
  // DO NOT remove -a or -e endings automatically!
  // These are common singular endings in Polish:
  // - "praca" (work), "woda" (water), "kobieta" (woman) - all singular!
  // - "dawanie" (giving), "życie" (life), "słońce" (sun) - also singular!
  
  // DO NOT remove -y ending automatically either, as it might be part of the word
  // Only specific rules above handle known plural forms.

  // Return as-is - AI already provides correct nominative singular form
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

