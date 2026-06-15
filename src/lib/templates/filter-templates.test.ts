import { describe, expect, it } from 'vitest'
import { TEMPLATES } from '@/lib/templates/catalog'
import { filterTemplates } from '@/lib/templates/filter-templates'

describe('filterTemplates', () => {
  it('returns all templates when query and tag are empty', () => {
    expect(filterTemplates(TEMPLATES, {})).toHaveLength(TEMPLATES.length)
  })

  it('filters by tag', () => {
    const showcase = filterTemplates(TEMPLATES, { tag: 'showcase' })
    expect(showcase.length).toBeGreaterThan(0)
    expect(showcase.every((template) => template.tags?.includes('showcase'))).toBe(true)
  })

  it('filters by name query', () => {
    const first = TEMPLATES[0]
    const results = filterTemplates(TEMPLATES, { query: first.name.slice(0, 4) })
    expect(results.some((template) => template.id === first.id)).toBe(true)
  })

  it('returns empty when nothing matches', () => {
    expect(filterTemplates(TEMPLATES, { query: 'zzzznonexistent-template' })).toHaveLength(0)
  })
})
