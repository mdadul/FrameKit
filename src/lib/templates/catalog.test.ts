import { describe, expect, it } from 'vitest'
import { TEMPLATES } from '@/lib/templates/catalog'
import { TEMPLATE_CATEGORIES } from '@/lib/templates/types'
import { LAYOUT_LABELS, type TemplateElement } from '@/lib/templates/types'

function elementSignature(elements: TemplateElement[]): string {
  return elements
    .map((el) => `${el.type}:${el.x}:${el.y}:${el.width}:${el.height}`)
    .sort()
    .join('|')
}

describe('template catalog', () => {
  it('has exactly 13 curated templates', () => {
    expect(TEMPLATES).toHaveLength(13)
  })

  it('has unique template ids', () => {
    const ids = TEMPLATES.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('uses each layout exactly once', () => {
    const layouts = TEMPLATES.map((t) => t.layout)
    expect(new Set(layouts).size).toBe(layouts.length)
  })

  it('has four showcase templates', () => {
    const showcase = TEMPLATES.filter((t) => t.category === 'showcase')
    expect(showcase).toHaveLength(4)
  })

  it('has at most one template per non-showcase category', () => {
    for (const category of TEMPLATE_CATEGORIES) {
      if (category === 'showcase') continue
      const inCategory = TEMPLATES.filter((t) => t.category === category)
      expect(inCategory.length).toBeLessThanOrEqual(1)
    }
  })

  it('each phone template has a device and headline text', () => {
    for (const template of TEMPLATES) {
      if (template.layout === 'featureGraphic') continue
      const devices = template.elements.filter((e) => e.type === 'device')
      const headlines = template.elements.filter(
        (e) => e.type === 'text' && e.name === 'Title',
      )
      expect(devices).toHaveLength(1)
      expect(headlines).toHaveLength(1)
      expect(typeof headlines[0].text).toBe('string')
    }
  })

  it('uses bold headline typography', () => {
    for (const template of TEMPLATES) {
      const headline = template.elements.find((e) => e.type === 'text' && e.name === 'Title')
      expect(headline?.fontSize).toBeGreaterThanOrEqual(72)
      expect(headline?.fontWeight).toBeGreaterThanOrEqual(800)
    }
  })

  it('assigns a human-readable layout label to every layout id', () => {
    for (const template of TEMPLATES) {
      expect(LAYOUT_LABELS[template.layout]).toBeTruthy()
    }
  })

  it('no two templates share identical element geometry', () => {
    const signatures = TEMPLATES.map((t) => elementSignature(t.elements))
    expect(new Set(signatures).size).toBe(signatures.length)
  })
})
