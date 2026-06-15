import * as Dialog from '@radix-ui/react-dialog'
import { useEffect, useMemo } from 'react'
import { STORE_PRESETS } from '@/lib/presets/store-sizes'
import {
  buildExportPlan,
  getSmartExportPresetIds,
  summarizeExportPlan,
} from '@/lib/export/export-plan'
import { exportScreensAsZip, exportSingleScreen } from '@/lib/export/zip'
import { applyFileNamePattern, downloadBlob } from '@/lib/utils'
import { useExportFormReducer } from '@/hooks/useExportFormReducer'
import { useExportPreview } from '@/hooks/useExportPreview'
import { useProjectStore } from '@/stores/project-store'
import { useEditorStore } from '@/stores/editor-store'
import { useSettingsStore } from '@/stores/settings-store'
import { toast } from '@/stores/toast-store'
import { Button } from '@/components/ui/Button'
import { ExportQuickTab } from '@/components/toolbar/export/ExportQuickTab'
import { ExportAdvancedTab } from '@/components/toolbar/export/ExportAdvancedTab'
import { cn } from '@/lib/utils'

const EXPORT_COMPLETE_KEY = 'ssg-export-complete'

interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ExportDialog({ open, onOpenChange }: ExportDialogProps) {
  const project = useProjectStore((state) => state.project)
  const assetUrls = useProjectStore((state) => state.assetUrls)
  const screen = useProjectStore((state) => state.getActiveScreen())
  const exportPrefs = useSettingsStore((state) => state.preferences.export)
  const updateExport = useSettingsStore((state) => state.updateExport)
  const konvaStageBridge = useEditorStore((state) => state.konvaStageBridge)

  const defaultPresets = useMemo(() => getSmartExportPresetIds(), [])
  const [form, dispatch] = useExportFormReducer(exportPrefs, defaultPresets)

  useEffect(() => {
    if (open && project) {
      dispatch({ type: 'init_screens', screenIds: project.screens.map((s) => s.id) })
    }
  }, [open, project, dispatch])

  const assetResolver = (assetId?: string) => (assetId ? assetUrls[assetId] : undefined)

  const targetPreset = useMemo(
    () => STORE_PRESETS.find((preset) => preset.id === form.currentTarget),
    [form.currentTarget],
  )

  const exportScreens = useMemo(() => {
    if (!project) return []
    return project.screens.filter((s) => form.selectedScreenIds.includes(s.id))
  }, [project, form.selectedScreenIds])

  const quickPlan = useMemo(
    () => buildExportPlan(exportScreens, getSmartExportPresetIds(), { platformAware: true }),
    [exportScreens],
  )
  const quickSummary = useMemo(() => summarizeExportPlan(quickPlan), [quickPlan])

  const advancedPlan = useMemo(
    () => buildExportPlan(exportScreens, form.selectedPresets, { platformAware: form.platformAware }),
    [exportScreens, form.selectedPresets, form.platformAware],
  )
  const advancedSummary = useMemo(() => summarizeExportPlan(advancedPlan), [advancedPlan])

  const currentOutput = useMemo(() => {
    if (!screen) return null
    if (targetPreset) {
      return { width: targetPreset.width, height: targetPreset.height }
    }
    return { width: screen.width * form.scale, height: screen.height * form.scale }
  }, [screen, targetPreset, form.scale])

  const filenamePreview = useMemo(() => {
    if (!project || !screen) return ''
    const extension = form.format === 'jpeg' ? 'jpg' : 'png'
    if (targetPreset) {
      const name = applyFileNamePattern(exportPrefs.fileNamePattern, {
        project: project.name,
        screen: screen.name,
        preset: targetPreset.id,
      })
      return `${name}.${extension}`
    }
    return `${screen.name}.${extension}`
  }, [project, screen, targetPreset, form.format, exportPrefs.fileNamePattern])

  const { previewUrl, previewLoading, gridPreviews } = useExportPreview({
    open,
    tab: form.tab,
    screen: screen ?? undefined,
    targetPreset,
    format: form.format,
    scale: form.scale,
    jpegQuality: form.jpegQuality,
    transparentBackground: form.transparentBackground,
    resizeStrategy: form.resizeStrategy,
    assetResolver,
    exportScreens,
    quickPlan,
  })

  const persistPrefs = () =>
    updateExport({
      defaultFormat: form.format,
      defaultScale: form.scale,
      transparentBackground: form.transparentBackground,
      jpegQuality: form.jpegQuality,
      resizeStrategy: form.resizeStrategy,
    })

  const markExportComplete = () => {
    localStorage.setItem(EXPORT_COMPLETE_KEY, '1')
    window.dispatchEvent(new Event('ssg-export-complete'))
  }

  const exportCurrent = async () => {
    if (!project || !screen) return
    dispatch({ type: 'set_busy', busy: true })
    try {
      const blob = await exportSingleScreen(screen, {
        project,
        format: form.format,
        scale: form.scale,
        jpegQuality: form.jpegQuality,
        transparentBackground: form.transparentBackground,
        fileNamePattern: exportPrefs.fileNamePattern,
        assetResolver,
        preset: targetPreset,
        resizeStrategy: form.resizeStrategy,
        konvaStageBridge,
      })
      const extension = form.format === 'jpeg' ? 'jpg' : 'png'
      downloadBlob(blob, filenamePreview || `${screen.name}.${extension}`)
      await persistPrefs()
      markExportComplete()
      toast('Screenshot exported', 'success')
    } finally {
      dispatch({ type: 'set_busy', busy: false })
    }
  }

  const exportZip = async (presetIds: string[], usePlatformAware = form.platformAware) => {
    if (!project || exportScreens.length === 0) return
    dispatch({ type: 'set_busy', busy: true })
    const presetList = STORE_PRESETS.filter((preset) => presetIds.includes(preset.id))
    const plan = buildExportPlan(exportScreens, presetIds, { platformAware: usePlatformAware })
    dispatch({ type: 'set_progress', progress: { completed: 0, total: plan.length } })
    try {
      const blob = await exportScreensAsZip({
        project,
        screens: exportScreens,
        presets: presetList,
        format: form.format,
        scale: form.scale,
        jpegQuality: form.jpegQuality,
        transparentBackground: form.transparentBackground,
        fileNamePattern: exportPrefs.fileNamePattern,
        assetResolver,
        organizeByPlatform: form.organizeByPlatform,
        platformAware: usePlatformAware,
        resizeStrategy: form.resizeStrategy,
        onProgress: (completed, total) =>
          dispatch({ type: 'set_progress', progress: { completed, total } }),
      })
      downloadBlob(blob, `${project.name}-export.zip`)
      await updateExport({
        lastUsedPresets: presetIds,
        defaultFormat: form.format,
        defaultScale: form.scale,
        transparentBackground: form.transparentBackground,
        jpegQuality: form.jpegQuality,
        resizeStrategy: form.resizeStrategy,
      })
      markExportComplete()
      toast('ZIP export complete', 'success')
    } finally {
      dispatch({ type: 'set_busy', busy: false })
      dispatch({ type: 'set_progress', progress: null })
    }
  }

  const quickExport = () => exportZip(getSmartExportPresetIds(), true)
  const advancedExport = () => exportZip(form.selectedPresets, form.platformAware)

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 max-h-[90vh] w-[min(94vw,760px)] -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-xl border border-border bg-card p-6 shadow-xl">
          <Dialog.Title className="text-lg font-semibold">Export screenshots</Dialog.Title>
          <p className="mt-1 text-sm text-muted-foreground">
            Quick export uses store-ready sizes for each platform. Advanced options are below.
          </p>

          <div className="mt-4 flex gap-1 rounded-lg bg-muted/80 p-0.5">
            {(['quick', 'advanced'] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => dispatch({ type: 'set_tab', tab: value })}
                className={cn(
                  'flex-1 rounded-md px-3 py-1.5 text-sm font-medium capitalize transition',
                  form.tab === value
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {value}
              </button>
            ))}
          </div>

          {form.tab === 'quick' ? (
            <ExportQuickTab
              exportScreenCount={exportScreens.length}
              quickSummary={quickSummary}
              gridPreviews={gridPreviews}
              organizeByPlatform={form.organizeByPlatform}
              onOrganizeByPlatformChange={(value) =>
                dispatch({ type: 'set_organize_by_platform', value })
              }
            />
          ) : (
            <ExportAdvancedTab
              project={project}
              screen={screen ?? undefined}
              format={form.format}
              scale={form.scale}
              jpegQuality={form.jpegQuality}
              transparentBackground={form.transparentBackground}
              resizeStrategy={form.resizeStrategy}
              currentTarget={form.currentTarget}
              selectedScreenIds={form.selectedScreenIds}
              selectedPresets={form.selectedPresets}
              organizeByPlatform={form.organizeByPlatform}
              platformAware={form.platformAware}
              previewUrl={previewUrl}
              previewLoading={previewLoading}
              currentOutput={currentOutput}
              advancedSummary={advancedSummary}
              onFormatChange={(format) => dispatch({ type: 'set_format', format })}
              onScaleChange={(scale) => dispatch({ type: 'set_scale', scale })}
              onJpegQualityChange={(value) => dispatch({ type: 'set_jpeg_quality', value })}
              onTransparentBackgroundChange={(value) =>
                dispatch({ type: 'set_transparent_background', value })
              }
              onResizeStrategyChange={(value) =>
                dispatch({ type: 'set_resize_strategy', value })
              }
              onCurrentTargetChange={(value) => dispatch({ type: 'set_current_target', value })}
              onToggleAllScreens={(checked) =>
                dispatch({
                  type: 'toggle_all_screens',
                  checked,
                  allIds: project?.screens.map((s) => s.id) ?? [],
                })
              }
              onToggleScreen={(screenId, checked) =>
                dispatch({ type: 'toggle_screen', screenId, checked })
              }
              onTogglePreset={(presetId, checked) =>
                dispatch({ type: 'toggle_preset', presetId, checked })
              }
              onOrganizeByPlatformChange={(value) =>
                dispatch({ type: 'set_organize_by_platform', value })
              }
              onPlatformAwareChange={(value) =>
                dispatch({ type: 'set_platform_aware', value })
              }
            />
          )}

          {form.progress && (
            <div className="mt-4">
              <div className="mb-1 text-sm text-muted-foreground">
                Exporting {form.progress.completed} / {form.progress.total}
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all"
                  style={{
                    width: `${(form.progress.completed / form.progress.total) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}

          <div className="mt-5 flex flex-wrap justify-end gap-2">
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            {form.tab === 'quick' ? (
              <Button
                disabled={form.busy || exportScreens.length === 0 || quickSummary.totalFiles === 0}
                onClick={() => void quickExport()}
              >
                Export store ZIP
              </Button>
            ) : (
              <>
                <Button
                  variant="secondary"
                  disabled={form.busy || !screen}
                  onClick={() => void exportCurrent()}
                >
                  Export current
                </Button>
                <Button
                  disabled={
                    form.busy || form.selectedPresets.length === 0 || advancedSummary.totalFiles === 0
                  }
                  onClick={() => void advancedExport()}
                >
                  Export ZIP
                </Button>
              </>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export { EXPORT_COMPLETE_KEY }
