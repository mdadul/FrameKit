import * as Dialog from '@radix-ui/react-dialog'
import { useEffect, useState } from 'react'
import { CATEGORY_LABELS, LAYOUT_LABELS } from '@/lib/templates'
import { renderTemplatePreview } from '@/lib/templates/preview'
import { Button } from '@/components/ui/Button'
import type { TemplateDefinition } from '@/lib/types'

interface TemplateApplyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template: TemplateDefinition | null
  onApply: (scope: 'current' | 'all') => void
}

export function TemplateApplyDialog({
  open,
  onOpenChange,
  template,
  onApply,
}: TemplateApplyDialogProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !template) {
      setPreviewUrl(null)
      return
    }

    let cancelled = false
    void renderTemplatePreview(template, () => undefined, 2)
      .then((url) => {
        if (!cancelled) setPreviewUrl(url)
      })
      .catch(() => {
        if (!cancelled) setPreviewUrl(null)
      })

    return () => {
      cancelled = true
    }
  }, [open, template])

  if (!template) return null

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[1px]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 flex max-h-[min(90vh,720px)] w-[min(560px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
          <div className="border-b border-border px-5 py-4">
            <Dialog.Title className="text-lg font-semibold">{template.name}</Dialog.Title>
            <Dialog.Description className="mt-1 text-sm text-muted-foreground">
              Replaces elements on the target screen(s) with this App Store-ready layout.
            </Dialog.Description>
          </div>

          <div className="flex min-h-0 flex-1 gap-4 overflow-auto p-5">
            <div className="flex shrink-0 flex-col items-center">
              <div className="overflow-hidden rounded-xl border border-border bg-muted/30 p-2 shadow-inner">
                <div className="flex aspect-[9/19.5] w-[200px] items-center justify-center overflow-hidden rounded-lg bg-muted">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt={template.name}
                      className="h-full w-full object-cover object-top"
                    />
                  ) : (
                    <span className="animate-pulse text-xs text-muted-foreground">
                      Rendering…
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="min-w-0 flex-1 space-y-4">
              <dl className="space-y-3 text-sm">
                <MetaRow label="Category" value={CATEGORY_LABELS[template.category]} />
                <MetaRow label="Layout" value={LAYOUT_LABELS[template.layout]} />
                {template.tags && template.tags.length > 0 && (
                  <div>
                    <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                      Style
                    </dt>
                    <dd className="mt-1.5 flex flex-wrap gap-1.5">
                      {template.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs capitalize"
                        >
                          {tag}
                        </span>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>

              <p className="text-xs leading-relaxed text-muted-foreground">
                Includes headline, subtitle, device frame, and App Store-style accents. Customize
                copy and colors after applying.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-2 border-t border-border px-5 py-4">
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                onApply('current')
                onOpenChange(false)
              }}
            >
              Current screen
            </Button>
            <Button
              onClick={() => {
                onApply('all')
                onOpenChange(false)
              }}
            >
              All screens
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</dt>
      <dd className="mt-0.5 font-medium text-foreground">{value}</dd>
    </div>
  )
}
