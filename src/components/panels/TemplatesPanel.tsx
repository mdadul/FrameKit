import { useMemo, useState } from 'react'
import { LayoutTemplate, Search, Sparkles } from 'lucide-react'
import {
  TEMPLATES,
  LAYOUT_LABELS,
  CATEGORY_LABELS,
  TEMPLATE_FILTER_TAGS,
} from '@/lib/templates'
import { createId } from '@/lib/utils'
import { useProjectStore } from '@/stores/project-store'
import { useEditorStore } from '@/stores/editor-store'
import { Input } from '@/components/ui/Input'
import { TemplateApplyDialog } from '@/components/templates/TemplateApplyDialog'
import { TemplateThumbnail } from '@/components/templates/TemplateThumbnail'
import type { Element, TemplateApplyMode, TemplateDefinition } from '@/lib/types'

type FilterTag = (typeof TEMPLATE_FILTER_TAGS)[number] | 'all'

export function TemplatesPanel() {
  const applyTemplateToScreen = useProjectStore((state) => state.applyTemplateToScreen)
  const applyTemplateToAllScreens = useProjectStore((state) => state.applyTemplateToAllScreens)
  const activeScreenId = useEditorStore((state) => state.activeScreenId)
  const project = useProjectStore((state) => state.project)
  const [query, setQuery] = useState('')
  const [activeTag, setActiveTag] = useState<FilterTag>('all')
  const [pendingTemplate, setPendingTemplate] = useState<TemplateDefinition | null>(null)

  const filteredTemplates = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return TEMPLATES.filter((template) => {
      if (activeTag !== 'all' && !template.tags?.includes(activeTag)) return false
      if (!normalized) return true
      return (
        template.name.toLowerCase().includes(normalized) ||
        template.category.toLowerCase().includes(normalized) ||
        CATEGORY_LABELS[template.category].toLowerCase().includes(normalized) ||
        LAYOUT_LABELS[template.layout].toLowerCase().includes(normalized) ||
        template.tags?.some((tag) => tag.toLowerCase().includes(normalized))
      )
    })
  }, [query, activeTag])

  const groups = useMemo(() => {
    return [...new Set(filteredTemplates.map((t) => t.category))]
      .map((category) => ({
        category,
        label: CATEGORY_LABELS[category],
        templates: filteredTemplates.filter((t) => t.category === category),
      }))
      .filter((group) => group.templates.length > 0)
  }, [filteredTemplates])

  const handleApply = (scope: 'current' | 'all', mode: TemplateApplyMode) => {
    const template = pendingTemplate
    const screenId = activeScreenId ?? project?.screens[0]?.id
    if (!template || !screenId) return

    const elements = template.elements.map((element, index) => ({
      ...structuredClone(element),
      id: createId(),
      name: element.name ?? `Element ${index + 1}`,
      zIndex: index,
    })) as Element[]

    const background = structuredClone(template.background)

    if (scope === 'all') {
      applyTemplateToAllScreens(elements, background, mode)
    } else {
      applyTemplateToScreen(screenId, elements, background, mode)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-2.5 border-b border-border bg-card/60 p-3">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-primary" />
          <p className="text-xs font-medium text-foreground">App Store templates</p>
        </div>
        <div className="relative">
          <Search className="absolute top-2.5 left-3 text-muted-foreground" size={14} />
          <Input
            className="pl-8"
            placeholder="Search by name, layout, or style"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <FilterChip
            label="All"
            active={activeTag === 'all'}
            onClick={() => setActiveTag('all')}
          />
          {TEMPLATE_FILTER_TAGS.map((tag) => (
            <FilterChip
              key={tag}
              label={tag}
              active={activeTag === tag}
              onClick={() => setActiveTag(tag)}
            />
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        {groups.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-12 text-center text-muted-foreground">
            <LayoutTemplate size={24} className="opacity-60" />
            <p className="text-sm">No templates match your filters.</p>
            <p className="text-xs">Clear search or try a different style tag.</p>
          </div>
        ) : (
          <div className="space-y-6 p-3">
            {groups.map((group) => (
              <section key={group.category} className="space-y-2.5">
                <div className="sticky top-0 z-10 -mx-3 flex items-center justify-between bg-background/95 px-3 py-1.5 backdrop-blur supports-[backdrop-filter]:bg-background/80">
                  <h3 className="text-xs font-semibold tracking-wide text-foreground">
                    {group.label}
                  </h3>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                    {group.templates.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {group.templates.map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => setPendingTemplate(template)}
                      title={`Preview ${template.name}`}
                      className="group flex w-full flex-col overflow-hidden rounded-xl border border-border bg-card text-left shadow-sm transition hover:border-primary/50 hover:shadow-md focus-visible:border-primary focus-visible:outline-none"
                    >
                      <div className="relative p-2 pb-0">
                        <div className="overflow-hidden rounded-lg border border-border/60 bg-black/5 shadow-inner">
                          <TemplateThumbnail
                            template={template}
                            className="aspect-[9/19.5] w-full"
                          />
                        </div>
                        <div className="pointer-events-none absolute inset-2 flex items-end justify-center rounded-lg bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition group-hover:opacity-100">
                          <span className="mb-3 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-lg">
                            Use template
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1.5 px-3 py-2.5">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {template.name}
                        </p>
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
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      <TemplateApplyDialog
        open={pendingTemplate != null}
        onOpenChange={(open) => {
          if (!open) setPendingTemplate(null)
        }}
        template={pendingTemplate}
        onApply={handleApply}
      />
    </div>
  )
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-2.5 py-1 text-[10px] font-medium capitalize transition ${
        active
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'bg-muted text-muted-foreground hover:bg-muted/80'
      }`}
    >
      {label}
    </button>
  )
}
