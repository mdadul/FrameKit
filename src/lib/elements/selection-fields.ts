/** Returns the shared value when all numbers match, otherwise null (mixed selection). */
export function sharedNumber(values: number[]): number | null {
  if (values.length === 0) return null
  const [first] = values
  return values.every((value) => value === first) ? first : null
}
