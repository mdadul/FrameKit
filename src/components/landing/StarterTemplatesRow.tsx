import { TEMPLATES, SHOWCASE_TEMPLATE_IDS } from '@/lib/templates'
import { TemplateCard } from '@/components/templates/TemplateCard'
import type { TemplateDefinition } from '@/lib/types'

interface StarterTemplatesRowProps {
  onSelect: (template: TemplateDefinition) => void
  title?: string
}

export function StarterTemplatesRow({
  onSelect,
  title = 'Popular templates',
}: StarterTemplatesRowProps) {
  const templates = SHOWCASE_TEMPLATE_IDS.map((id) => TEMPLATES.find((t) => t.id === id)).filter(
    Boolean,
  ) as TemplateDefinition[]

  return (
    <div>
      <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {title}
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            variant="landing"
            onClick={() => onSelect(template)}
          />
        ))}
      </div>
    </div>
  )
}
