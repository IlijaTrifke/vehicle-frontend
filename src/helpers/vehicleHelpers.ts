// Helper functions
export function parseYearRange(
  yearStr: string,
  defaultRange: [number, number],
  currentYear: number
): [number, number] {
  if (!yearStr) return defaultRange
  const parts = yearStr.split('-')
  if (parts.length === 2) {
    const from = Number(parts[0].trim()) || 1900
    const to = Number(parts[1].trim()) || currentYear
    return [from, to]
  }
  // Single year - set both handles to same position
  const singleYear = Number(yearStr.trim()) || 1900
  return [singleYear, singleYear]
}

export function formatYearRange(
  yearRange: [number, number],
  defaultRange: [number, number],
  currentYear: number
): string {
  const [from, to] = yearRange
  if (from === defaultRange[0] && to === currentYear) return ''
  if (from === to) return from.toString()
  return `${from}-${to}`
}

export function formatFuel(fuel: string): string {
  return fuel.charAt(0).toUpperCase() + fuel.slice(1)
}
