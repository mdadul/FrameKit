import { useEffect, useState } from 'react'
import { prepareExportScreen } from '@/lib/export/prepare-export-screen'
import { renderScreenToDataUrl } from '@/lib/export/renderer'
import type { ExportDialogTab } from '@/lib/export/types'
import type { ExportFormat, ResizeStrategy, Screen, StorePreset } from '@/lib/types'
import type { ExportPlanItem } from '@/lib/export/export-plan'

export interface ExportGridPreview {
  id: string
  label: string
  url: string
}

interface UseExportPreviewOptions {
  open: boolean
  tab: ExportDialogTab
  screen: Screen | undefined
  targetPreset: StorePreset | undefined
  format: ExportFormat
  scale: 1 | 2 | 3
  jpegQuality: number
  transparentBackground: boolean
  resizeStrategy: ResizeStrategy
  assetResolver: (assetId?: string) => string | undefined
  exportScreens: Screen[]
  quickPlan: ExportPlanItem[]
}

export function useExportPreview({
  open,
  tab,
  screen,
  targetPreset,
  format,
  scale,
  jpegQuality,
  transparentBackground,
  resizeStrategy,
  assetResolver,
  exportScreens,
  quickPlan,
}: UseExportPreviewOptions) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [gridPreviews, setGridPreviews] = useState<ExportGridPreview[]>([])

  useEffect(() => {
    if (!open || !screen) return
    let cancelled = false
    const timer = setTimeout(async () => {
      setPreviewLoading(true)
      try {
        const source = targetPreset
          ? prepareExportScreen(screen, targetPreset, resizeStrategy)
          : screen
        const url = await renderScreenToDataUrl({
          screen: source,
          assetResolver,
          scale: targetPreset ? 1 : scale,
          format,
          jpegQuality,
          transparentBackground,
        })
        if (!cancelled) setPreviewUrl(url)
      } catch {
        if (!cancelled) setPreviewUrl(null)
      } finally {
        if (!cancelled) setPreviewLoading(false)
      }
    }, 200)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [
    open,
    screen,
    targetPreset,
    format,
    jpegQuality,
    transparentBackground,
    scale,
    resizeStrategy,
    assetResolver,
  ])

  useEffect(() => {
    if (!open || tab !== 'quick' || exportScreens.length === 0) {
      setGridPreviews([])
      return
    }

    let cancelled = false
    const timer = setTimeout(async () => {
      const previews: ExportGridPreview[] = []
      const items = quickPlan.slice(0, 6)

      for (const { screen: itemScreen, preset } of items) {
        try {
          const prepared = prepareExportScreen(itemScreen, preset, resizeStrategy)
          const url = await renderScreenToDataUrl({
            screen: prepared,
            assetResolver,
            scale: 1,
            format: 'png',
            jpegQuality,
            transparentBackground: false,
          })
          previews.push({
            id: `${itemScreen.id}-${preset.id}`,
            label: `${itemScreen.name} · ${preset.name}`,
            url,
          })
        } catch {
          // skip failed preview
        }
      }

      if (!cancelled) setGridPreviews(previews)
    }, 300)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [open, tab, exportScreens, quickPlan, assetResolver, resizeStrategy, jpegQuality])

  return { previewUrl, previewLoading, gridPreviews }
}
