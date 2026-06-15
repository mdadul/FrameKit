import { describe, expect, it } from 'vitest'
import { sharedNumber } from '@/lib/elements/selection-fields'

describe('sharedNumber', () => {
  it('returns null for an empty list', () => {
    expect(sharedNumber([])).toBeNull()
  })

  it('returns the value when all match', () => {
    expect(sharedNumber([10, 10, 10])).toBe(10)
  })

  it('returns null when values differ', () => {
    expect(sharedNumber([10, 20])).toBeNull()
  })
})
