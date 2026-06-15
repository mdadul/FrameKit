import { useMemo, useState } from 'react'
import { Plus, RotateCcw, Sparkles, Type, X } from 'lucide-react'
import { DEFAULT_BRAND_KIT, BRAND_PRIMARY, GOOGLE_FONTS } from '@/lib/constants'
import { useEditorStore } from '@/stores/editor-store'
import { useProjectStore } from '@/stores/project-store'
import { useBrandKit, useBrandKitActions } from '@/hooks/useBrandKit'
import { confirm } from '@/stores/confirm-store'
import { ColorPickerField } from '@/components/ui/ColorPickerField'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import type { Element } from '@/lib/types'

function ControlGroup({
  title,
  action,
  children,
}: {
  title: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2.5 rounded-xl border border-border/50 bg-muted/25 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-foreground">{title}</p>
        {action}
      </div>
      {children}
    </div>
  )
}

function SelectionHint({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed border-border/70 bg-muted/20 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
      {children}
    </p>
  )
}

function useSelectionContext() {
  const project = useProjectStore((state) => state.project)
  const activeScreenId = useEditorStore((state) => state.activeScreenId)
  const selectedElementIds = useEditorStore((state) => state.selectedElementIds)

  return useMemo(() => {
    const screen = project?.screens.find((item) => item.id === activeScreenId)
    if (!screen || selectedElementIds.length === 0) {
      return {
        hasSelection: false,
        hasText: false,
        hasShape: false,
        canApplyColor: false,
        canApplyFont: false,
        selectedElements: [] as Element[],
      }
    }

    const selectedElements = selectedElementIds
      .map((id) => screen.elements.find((item) => item.id === id))
      .filter((item): item is Element => item != null)

    const hasText = selectedElements.some((item) => item.type === 'text')
    const hasShape = selectedElements.some((item) => item.type === 'shape')

    return {
      hasSelection: selectedElements.length > 0,
      hasText,
      hasShape,
      canApplyColor: hasText || hasShape,
      canApplyFont: hasText,
      selectedElements,
    }
  }, [project, activeScreenId, selectedElementIds])
}

export function BrandKitPanel() {
  const brandKit = useBrandKit()
  const { updateBrandKit, resetToGlobal, hasOverride } = useBrandKitActions()
  const updateElement = useProjectStore((state) => state.updateElement)
  const applyBrandToAllText = useProjectStore((state) => state.applyBrandToAllText)
  const getActiveScreen = useProjectStore((state) => state.getActiveScreen)
  const selectedElementIds = useEditorStore((state) => state.selectedElementIds)
  const selection = useSelectionContext()
  const [draftColor, setDraftColor] = useState(BRAND_PRIMARY)
  const [draftFont, setDraftFont] = useState('Inter')

  const applyColor = (color: string) => {
    if (!selection.canApplyColor) return
    const screen = getActiveScreen()
    if (!screen || selectedElementIds.length === 0) return
    for (const id of selectedElementIds) {
      const element = screen.elements.find((item) => item.id === id)
      if (!element) continue
      if (element.type === 'text') {
        updateElement(id, { fill: color })
      } else if (element.type === 'shape') {
        updateElement(id, { fill: { type: 'solid', color } })
      }
    }
  }

  const applyFont = (font: string) => {
    if (!selection.canApplyFont) return
    const screen = getActiveScreen()
    if (!screen || selectedElementIds.length === 0) return
    for (const id of selectedElementIds) {
      const element = screen.elements.find((item) => item.id === id)
      if (element?.type === 'text') {
        updateElement(id, { fontFamily: font })
      }
    }
  }

  const addColor = () => {
    if (brandKit.colors.includes(draftColor)) return
    updateBrandKit({ colors: [...brandKit.colors, draftColor] })
  }

  const removeColor = (color: string) => {
    updateBrandKit({ colors: brandKit.colors.filter((item) => item !== color) })
  }

  const addFont = () => {
    const font = draftFont.trim()
    if (!font || brandKit.fonts.includes(font)) return
    updateBrandKit({ fonts: [...brandKit.fonts, font] })
  }

  const removeFont = (font: string) => {
    if (brandKit.fonts.length <= 1) return
    updateBrandKit({ fonts: brandKit.fonts.filter((item) => item !== font) })
  }

  const resetColors = async () => {
    const confirmed = await confirm({
      title: 'Reset brand colors?',
      description: 'Custom colors you added will be removed.',
      confirmLabel: 'Reset',
      destructive: true,
    })
    if (!confirmed) return
    updateBrandKit({ colors: [...DEFAULT_BRAND_KIT.colors] })
  }

  const colorHint = !selection.hasSelection
    ? 'Select text or a shape on the canvas, then click a swatch to apply that color.'
    : !selection.canApplyColor
      ? 'Selected elements cannot use brand colors. Select text or a shape.'
      : null

  const fontHint = !selection.hasSelection
    ? 'Select text to apply a brand font.'
    : !selection.canApplyFont
      ? 'Selected elements are not text. Select a text layer to apply a font.'
      : null

  return (
    <div className="flex h-full flex-col gap-3 p-3">
      <div className="space-y-2 rounded-xl border border-border/50 bg-muted/25 p-3">
        <div className="flex items-start gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sparkles size={16} strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">Brand kit</p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              {hasOverride
                ? 'Project-specific brand colors and fonts.'
                : 'Using workspace defaults. Changes here apply to this project only.'}
            </p>
          </div>
        </div>
        {hasOverride && (
          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={resetToGlobal}>
            Use workspace defaults
          </Button>
        )}
      </div>

      <ControlGroup
        title="Colors"
        action={
          <button
            type="button"
            className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground transition hover:text-foreground"
            onClick={() => void resetColors()}
          >
            <RotateCcw size={12} />
            Reset
          </button>
        }
      >
        {colorHint ? <SelectionHint>{colorHint}</SelectionHint> : (
          <p className="text-[11px] text-muted-foreground">
            Click a swatch to apply to the selected {selection.hasText && selection.hasShape ? 'text and shapes' : selection.hasText ? 'text' : 'shapes'}.
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          {brandKit.colors.length > 0 && (
            <>
              <Button
                size="sm"
                variant="secondary"
                className="h-7 text-xs"
                onClick={() => applyBrandToAllText('screen', brandKit.colors[0])}
              >
                Apply color to all text (screen)
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="h-7 text-xs"
                onClick={() => applyBrandToAllText('all', brandKit.colors[0])}
              >
                Apply color to all text (project)
              </Button>
            </>
          )}
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {brandKit.colors.map((color, index) => (
            <div key={`${color}-${index}`} className="group relative">
              <button
                type="button"
                disabled={!selection.canApplyColor}
                className={cn(
                  'relative aspect-square w-full overflow-hidden rounded-lg border border-border/80 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                  selection.canApplyColor
                    ? 'hover:ring-2 hover:ring-primary/60 cursor-pointer'
                    : 'cursor-default opacity-80',
                )}
                style={{ backgroundColor: color }}
                aria-label={`Apply color ${color}`}
                title={selection.canApplyColor ? `Apply ${color}` : color}
                onClick={() => applyColor(color)}
              >
                <span
                  className={cn(
                    'absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-1 py-1 text-[9px] font-medium text-white transition',
                    selection.canApplyColor ? 'opacity-0 group-hover:opacity-100' : 'opacity-0',
                  )}
                >
                  Apply
                </span>
              </button>
              <button
                type="button"
                aria-label={`Remove color ${color}`}
                className="absolute -top-1.5 -right-1.5 hidden h-4 w-4 items-center justify-center rounded-full bg-destructive text-white shadow-sm group-hover:flex"
                onClick={() => removeColor(color)}
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>

        <div className="space-y-2 border-t border-border/60 pt-3">
          <p className="text-[11px] font-medium text-muted-foreground">Add color</p>
          <ColorPickerField label="Pick a color" value={draftColor} onChange={setDraftColor} />
          <Button
            size="sm"
            variant="secondary"
            className="h-9 w-full border border-dashed border-border/80 bg-card"
            onClick={addColor}
            disabled={brandKit.colors.includes(draftColor)}
          >
            <Plus size={14} />
            {brandKit.colors.includes(draftColor) ? 'Color already in kit' : 'Add to brand kit'}
          </Button>
        </div>
      </ControlGroup>

      <ControlGroup title="Fonts">
        {fontHint ? <SelectionHint>{fontHint}</SelectionHint> : (
          <p className="text-[11px] text-muted-foreground">
            Click a font to apply to the selected text.
          </p>
        )}

        {brandKit.fonts.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="secondary"
              className="h-7 text-xs"
              onClick={() => applyBrandToAllText('screen', undefined, brandKit.fonts[0])}
            >
              Apply font to all text (screen)
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="h-7 text-xs"
              onClick={() => applyBrandToAllText('all', undefined, brandKit.fonts[0])}
            >
              Apply font to all text (project)
            </Button>
          </div>
        )}

        <div className="space-y-1.5">
          {brandKit.fonts.map((font) => (
            <div key={font} className="group relative">
              <button
                type="button"
                disabled={!selection.canApplyFont}
                onClick={() => applyFont(font)}
                className={cn(
                  'group flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  selection.canApplyFont
                    ? 'border-border/60 bg-card hover:border-primary/40 hover:bg-muted/40'
                    : 'border-border/40 bg-card/50 cursor-default opacity-70',
                )}
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-lg font-medium text-foreground"
                  style={{ fontFamily: font }}
                  aria-hidden
                >
                  Aa
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{font}</p>
                  <p
                    className="truncate text-xs text-muted-foreground"
                    style={{ fontFamily: font }}
                  >
                    The quick brown fox
                  </p>
                </div>
                {selection.canApplyFont && (
                  <Type
                    size={14}
                    className="shrink-0 text-muted-foreground opacity-0 transition group-hover:opacity-100"
                  />
                )}
              </button>
              {brandKit.fonts.length > 1 && (
                <button
                  type="button"
                  aria-label={`Remove font ${font}`}
                  className="absolute -top-1.5 -right-1.5 hidden h-4 w-4 items-center justify-center rounded-full bg-destructive text-white shadow-sm group-hover:flex"
                  onClick={() => removeFont(font)}
                >
                  <X size={10} />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="space-y-2 border-t border-border/60 pt-3">
          <p className="text-[11px] font-medium text-muted-foreground">Add font</p>
          <select
            className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm"
            value={draftFont}
            onChange={(event) => setDraftFont(event.target.value)}
          >
            {GOOGLE_FONTS.filter((font) => !brandKit.fonts.includes(font)).map((font) => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </select>
          <Button
            size="sm"
            variant="secondary"
            className="h-9 w-full border border-dashed border-border/80 bg-card"
            onClick={addFont}
            disabled={!draftFont || brandKit.fonts.includes(draftFont)}
          >
            <Plus size={14} />
            Add to brand kit
          </Button>
        </div>
      </ControlGroup>
    </div>
  )
}
