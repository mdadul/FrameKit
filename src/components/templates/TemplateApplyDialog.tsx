import * as Dialog from '@radix-ui/react-dialog'
import { useEffect, useMemo, useState } from 'react'
import { CATEGORY_LABELS, LAYOUT_LABELS } from '@/lib/templates'
import { renderTemplatePreview } from '@/lib/templates/preview'
import { useProjectStore } from '@/stores/project-store'
import { useEditorStore } from '@/stores/editor-store'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import type { TemplateApplyMode, TemplateDefinition } from '@/lib/types'

interface TemplateApplyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template: TemplateDefinition | null
  onApply: (scope: 'current' | 'all', mode: TemplateApplyMode) => void
}

const MODE_OPTIONS: Array<{
  id: TemplateApplyMode
  title: string
  description: string
}> = [
  {
    id: 'replace',
    title: 'Replace all',
    description: 'Replace background and all elements with the template layout.',
  },
  {
    id: 'background',
    title: 'Background only',
    description: 'Keep your screenshots and copy — update the background style only.',
  },
  {
    id: 'add-elements',
    title: 'Add elements',
    description: 'Layer template headlines and accents on top of your existing design.',
  },
]

export function TemplateApplyDialog({
  open,
  onOpenChange,
  template,
  onApply,
}: TemplateApplyDialogProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [mode, setMode] = useState<TemplateApplyMode>('replace')
  const project = useProjectStore((state) => state.project)
  const activeScreenId = useEditorStore((state) => state.activeScreenId)

  const activeScreen = useMemo(() => {
    if (!project) return null
    const screenId = activeScreenId ?? project.screens[0]?.id
    return project.screens.find((screen) => screen.id === screenId) ?? null
  }, [project, activeScreenId])

  const hasExistingContent = useMemo(() => {
    if (!activeScreen) return false
    const nonDeviceElements = activeScreen.elements.filter((element) => element.type !== 'device')
    return nonDeviceElements.length > 0
  }, [activeScreen])

  useEffect(() => {
    if (!open) return
    setMode(hasExistingContent ? 'background' : 'replace')
  }, [open, hasExistingContent, template?.id])

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
              Choose how to apply this layout to your screen{hasExistingContent ? ' with existing content' : ''}.
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
                    <span className="animate-pulse text-xs text-muted-foreground">Rendering…</span>
                  )}
                </div>
              </div>
            </div>

            <div className="min-w-0 flex-1 space-y-4">
              <dl className="space-y-3 text-sm">
                <MetaRow label="Category" value={CATEGORY_LABELS[template.category]} />
                <MetaRow label="Layout" value={LAYOUT_LABELS[template.layout]} />
              </dl>

              <div className="space-y-2">
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Apply mode
                </p>
                {MODE_OPTIONS.map((option) => (
                  <label
                    key={option.id}
                    className={cn(
                      'flex cursor-pointer gap-3 rounded-lg border p-3 transition',
                      mode === option.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/40',
                    )}
                  >
                    <input
                      type="radio"
                      name="template-apply-mode"
                      checked={mode === option.id}
                      onChange={() => setMode(option.id)}
                      className="mt-0.5"
                    />
                    <span>
                      <span className="text-sm font-medium text-foreground">{option.title}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {option.description}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-2 border-t border-border px-5 py-4">
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                onApply('current', mode)
                onOpenChange(false)
              }}
            >
              Current screen
            </Button>
            <Button
              onClick={() => {
                onApply('all', mode)
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
