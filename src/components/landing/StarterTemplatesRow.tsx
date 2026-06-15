import { ArrowRight } from 'lucide-react'
import { TEMPLATES } from '@/lib/templates'
import { SHOWCASE_TEMPLATE_IDS } from '@/lib/templates/preview'
import { TemplateThumbnail } from '@/components/templates/TemplateThumbnail'
import { LAYOUT_LABELS } from '@/lib/templates'
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
          <button
            key={template.id}
            type="button"
            onClick={() => onSelect(template)}
            className="group overflow-hidden rounded-2xl border border-white/20 bg-card/70 text-left shadow-lg ring-1 ring-black/5 backdrop-blur transition hover:scale-[1.02] hover:border-primary/30 hover:shadow-xl dark:border-white/10"
          >
            <TemplateThumbnail template={template} className="aspect-[9/19.5] w-full" />
            <div className="border-t border-border/30 p-3">
              <p className="truncate text-sm font-semibold leading-tight">{template.name}</p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {LAYOUT_LABELS[template.layout]}
              </p>
              <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition group-hover:opacity-100">
                Use template
                <ArrowRight size={12} />
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
