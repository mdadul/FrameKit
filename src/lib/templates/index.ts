export { TEMPLATES, TEMPLATE_CATALOG } from '@/lib/templates/catalog'
export {
  TEMPLATE_CATEGORIES,
  CATEGORY_LABELS,
  TEMPLATE_FILTER_TAGS,
  LAYOUT_LABELS,
  type TemplateDefinition,
  type TemplateLayoutId,
  type TemplateCategory,
} from '@/lib/templates/types'
export { renderTemplatePreview, templateToScreen, applyTemplateToProject, SHOWCASE_TEMPLATE_IDS } from '@/lib/templates/preview'
export { filterTemplates } from '@/lib/templates/filter-templates'

import { TEMPLATES } from '@/lib/templates/catalog'

export function getTemplatesByCategory(category: string) {
  return TEMPLATES.filter((template) => template.category === category)
}
