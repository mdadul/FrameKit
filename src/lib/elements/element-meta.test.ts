import { describe, expect, it } from 'vitest'
import { ELEMENT_TYPE_META, getElementTypeLabel, isTextElement } from '@/lib/elements/element-meta'
import { createTextElement, createShapeElement } from '@/lib/factories'

describe('element-meta', () => {
  it('defines metadata for every element type', () => {
    const types = ['text', 'shape', 'image', 'device', 'group'] as const
    for (const type of types) {
      expect(ELEMENT_TYPE_META[type].label.length).toBeGreaterThan(0)
      expect(ELEMENT_TYPE_META[type].icon).toBeTruthy()
    }
  })

  it('narrows text elements', () => {
    const text = createTextElement()
    expect(isTextElement(text)).toBe(true)
    expect(isTextElement(createShapeElement())).toBe(false)
  })

  it('returns human-readable labels', () => {
    expect(getElementTypeLabel(createTextElement())).toBe('Text')
  })
})
