import { ArrowRight } from 'lucide-react'
import { TemplateThumbnail } from '@/components/templates/TemplateThumbnail'
import { LAYOUT_LABELS } from '@/lib/templates'
import type { TemplateDefinition } from '@/lib/types'
import { cn } from '@/lib/utils'

export type TemplateCardVariant = 'landing' | 'grid' | 'panel'

interface TemplateCardProps {
  template: TemplateDefinition
  variant: TemplateCardVariant
  onClick: () => void
}

const THUMBNAIL_CLASS = 'aspect-[9/19.5] w-full'

export function TemplateCard({ template, variant, onClick }: TemplateCardProps) {
  if (variant === 'landing') {
    return (
      <button
        type="button"
        onClick={onClick}
        className="group overflow-hidden rounded-2xl border border-white/20 bg-card/70 text-left shadow-lg ring-1 ring-black/5 backdrop-blur transition hover:scale-[1.02] hover:border-primary/30 hover:shadow-xl dark:border-white/10"
      >
        <TemplateThumbnail template={template} className={THUMBNAIL_CLASS} />
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
    )
  }

  if (variant === 'grid') {
    return (
      <button
        type="button"
        onClick={onClick}
        className="group overflow-hidden rounded-xl border border-border bg-card text-left transition hover:border-primary/50 hover:shadow-md"
      >
        <div className="p-1.5 pb-0">
          <TemplateThumbnail
            template={template}
            className={cn(THUMBNAIL_CLASS, 'rounded-lg')}
          />
        </div>
        <div className="p-2.5">
          <p className="truncate text-xs font-semibold">{template.name}</p>
          <p className="truncate text-[10px] text-muted-foreground">
            {LAYOUT_LABELS[template.layout]}
          </p>
        </div>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      title={`Preview ${template.name}`}
      className="group flex w-full flex-col overflow-hidden rounded-xl border border-border bg-card text-left shadow-sm transition hover:border-primary/50 hover:shadow-md focus-visible:border-primary focus-visible:outline-none"
    >
      <div className="relative p-2 pb-0">
        <div className="overflow-hidden rounded-lg border border-border/60 bg-black/5 shadow-inner">
          <TemplateThumbnail template={template} className={THUMBNAIL_CLASS} />
        </div>
        <div className="pointer-events-none absolute inset-2 flex items-end justify-center rounded-lg bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition group-hover:opacity-100">
          <span className="mb-3 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-lg">
            Use template
          </span>
        </div>
      </div>
      <div className="space-y-1.5 px-3 py-2.5">
        <p className="truncate text-sm font-semibold text-foreground">{template.name}</p>
        <p className="truncate text-[11px] text-muted-foreground">
          {LAYOUT_LABELS[template.layout]}
        </p>
        {template.tags && template.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {template.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border bg-muted/60 px-2 py-0.5 text-[9px] font-medium capitalize text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </button>
  )
}
