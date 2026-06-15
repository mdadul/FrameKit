import { describe, expect, it } from 'vitest'
import { createTextElement } from '@/lib/factories'
import { applyTemplateToScreen } from '@/lib/templates/apply-template-to-screen'
import { minimalBackground } from '@/test/fixtures/minimal-screen'
import { minimalScreen } from '@/test/fixtures/minimal-screen'

describe('applyTemplateToScreen', () => {
  const templateElements = [
    createTextElement({ name: 'Template Text', text: 'From template', zIndex: 0 }),
  ]
  const background = minimalBackground()

  it('replace mode replaces background and elements', () => {
    const screen = minimalScreen()
    const result = applyTemplateToScreen(screen, templateElements, background, 'replace')

    expect(result.background).toEqual(background)
    expect(result.elements).toHaveLength(1)
    expect(result.elements[0]?.type).toBe('text')
    if (result.elements[0]?.type === 'text') {
      expect(result.elements[0].text).toBe('From template')
    }
    expect(result.elements[0]?.id).not.toBe('existing-text')
  })

  it('background mode only updates background', () => {
    const screen = minimalScreen()
    const result = applyTemplateToScreen(screen, templateElements, background, 'background')

    expect(result.background).toEqual(background)
    expect(result.elements).toHaveLength(1)
    expect(result.elements[0]?.id).toBe('existing-text')
  })

  it('add-elements mode appends with higher z-index', () => {
    const screen = minimalScreen()
    const result = applyTemplateToScreen(screen, templateElements, background, 'add-elements')

    expect(result.elements).toHaveLength(2)
    expect(result.elements[0]?.id).toBe('existing-text')
    expect(result.elements[1]?.zIndex).toBeGreaterThan(result.elements[0]?.zIndex ?? 0)
  })
})
