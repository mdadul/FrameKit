import { CATEGORY_LABELS, LAYOUT_LABELS } from '@/lib/templates/types'
import type { TemplateDefinition } from '@/lib/templates/types'

export interface FilterTemplatesOptions {
  query?: string
  tag?: string
}

export function filterTemplates(
  templates: TemplateDefinition[],
  options: FilterTemplatesOptions,
): TemplateDefinition[] {
  const normalized = options.query?.trim().toLowerCase() ?? ''
  const tag = options.tag

  return templates.filter((template) => {
    if (tag && tag !== 'all' && !template.tags?.includes(tag)) return false
    if (!normalized) return true
    return (
      template.name.toLowerCase().includes(normalized) ||
      template.category.toLowerCase().includes(normalized) ||
      CATEGORY_LABELS[template.category].toLowerCase().includes(normalized) ||
      LAYOUT_LABELS[template.layout].toLowerCase().includes(normalized) ||
      template.tags?.some((item) => item.toLowerCase().includes(normalized))
    )
  })
}
