import { useMemo, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Search, Upload, X } from 'lucide-react'
import { TEMPLATES, CATEGORY_LABELS, LAYOUT_LABELS, SHOWCASE_TEMPLATE_IDS } from '@/lib/templates'
import { TemplateThumbnail } from '@/components/templates/TemplateThumbnail'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { TemplateDefinition } from '@/lib/types'

interface TemplatePickerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (template: TemplateDefinition) => void
  onBlank: () => void
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export function TemplatePickerModal({
  open,
  onOpenChange,
  onSelect,
  onBlank,
  onImport,
}: TemplatePickerModalProps) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return TEMPLATES
    return TEMPLATES.filter(
      (t) =>
        t.name.toLowerCase().includes(normalized) ||
        t.category.toLowerCase().includes(normalized) ||
        CATEGORY_LABELS[t.category].toLowerCase().includes(normalized) ||
        LAYOUT_LABELS[t.layout].toLowerCase().includes(normalized),
    )
  }, [query])

  const showcase = filtered.filter((t) => SHOWCASE_TEMPLATE_IDS.includes(t.id as (typeof SHOWCASE_TEMPLATE_IDS)[number]))
  const rest = filtered.filter((t) => !SHOWCASE_TEMPLATE_IDS.includes(t.id as (typeof SHOWCASE_TEMPLATE_IDS)[number]))

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 flex max-h-[min(92vh,800px)] w-[min(900px,calc(100vw-1.5rem))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
          <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
            <div>
              <Dialog.Title className="text-xl font-semibold">New project</Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-muted-foreground">
                Pick a template, start blank, or import a saved project.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close"
                className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>

          <div className="border-b border-border px-5 py-3">
            <div className="relative">
              <Search className="absolute top-2.5 left-3 text-muted-foreground" size={14} />
              <Input
                className="pl-8"
                placeholder="Search templates…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-auto p-5">
            {showcase.length > 0 && (
              <section className="mb-8">
                <h3 className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  App Store showcase
                </h3>
                <TemplateGrid templates={showcase} onSelect={onSelect} />
              </section>
            )}
            {rest.length > 0 && (
              <section>
                <h3 className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  All templates
                </h3>
                <TemplateGrid templates={rest} onSelect={onSelect} />
              </section>
            )}
            {filtered.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">No templates match your search.</p>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-4">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground">
              <Upload size={16} />
              Import .ssgproj
              <input
                type="file"
                accept=".ssgproj,application/json"
                className="hidden"
                onChange={onImport}
              />
            </label>
            <Button variant="secondary" onClick={onBlank}>
              Blank canvas
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function TemplateGrid({
  templates,
  onSelect,
}: {
  templates: TemplateDefinition[]
  onSelect: (template: TemplateDefinition) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {templates.map((template) => (
        <button
          key={template.id}
          type="button"
          onClick={() => onSelect(template)}
          className="group overflow-hidden rounded-xl border border-border bg-card text-left transition hover:border-primary/50 hover:shadow-md"
        >
          <div className="p-1.5 pb-0">
            <TemplateThumbnail template={template} className="aspect-[9/19.5] w-full rounded-lg" />
          </div>
          <div className="p-2.5">
            <p className="truncate text-xs font-semibold">{template.name}</p>
            <p className="truncate text-[10px] text-muted-foreground">
              {LAYOUT_LABELS[template.layout]}
            </p>
          </div>
        </button>
      ))}
    </div>
  )
}
