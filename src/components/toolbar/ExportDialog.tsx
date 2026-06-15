import * as Dialog from '@radix-ui/react-dialog'
import { useEffect, useMemo, useState } from 'react'
import { STORE_PRESETS } from '@/lib/presets/store-sizes'
import { exportScreensAsZip, exportSingleScreen } from '@/lib/export/zip'
import { renderScreenToDataUrl, autoResizeScreen } from '@/lib/export/renderer'
import { applyFileNamePattern, downloadBlob } from '@/lib/utils'
import { useProjectStore } from '@/stores/project-store'
import { useSettingsStore } from '@/stores/settings-store'
import { toast } from '@/stores/toast-store'
import { Button } from '@/components/ui/Button'

const SMART_PRESETS = ['apple-6-9', 'android-phone']

interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  smartExport?: boolean
}

export function ExportDialog({ open, onOpenChange, smartExport = false }: ExportDialogProps) {
  const project = useProjectStore((state) => state.project)
  const assetUrls = useProjectStore((state) => state.assetUrls)
  const screen = useProjectStore((state) => state.getActiveScreen())
  const exportPrefs = useSettingsStore((state) => state.preferences.export)
  const updateExport = useSettingsStore((state) => state.updateExport)

  const [format, setFormat] = useState(exportPrefs.defaultFormat)
  const [scale, setScale] = useState<1 | 2 | 3>(exportPrefs.defaultScale)
  const [transparentBackground, setTransparentBackground] = useState(
    exportPrefs.transparentBackground,
  )
  const [jpegQuality, setJpegQuality] = useState(exportPrefs.jpegQuality)
  const [currentTarget, setCurrentTarget] = useState<string>('design')
  const [selectedPresets, setSelectedPresets] = useState<string[]>(
    exportPrefs.lastUsedPresets.length > 0
      ? exportPrefs.lastUsedPresets
      : STORE_PRESETS.map((preset) => preset.id),
  )
  const [selectedScreenIds, setSelectedScreenIds] = useState<string[]>([])
  const [organizeByPlatform, setOrganizeByPlatform] = useState(true)
  const [progress, setProgress] = useState<{ completed: number; total: number } | null>(null)
  const [busy, setBusy] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)

  useEffect(() => {
    if (open && project) {
      setSelectedScreenIds(project.screens.map((s) => s.id))
      if (smartExport) {
        setSelectedPresets(SMART_PRESETS)
      }
    }
  }, [open, project, smartExport])

  const assetResolver = (assetId?: string) => (assetId ? assetUrls[assetId] : undefined)

  const targetPreset = useMemo(
    () => STORE_PRESETS.find((preset) => preset.id === currentTarget),
    [currentTarget],
  )

  const exportScreens = useMemo(() => {
    if (!project) return []
    return project.screens.filter((s) => selectedScreenIds.includes(s.id))
  }, [project, selectedScreenIds])

  const currentOutput = useMemo(() => {
    if (!screen) return null
    if (targetPreset) {
      return { width: targetPreset.width, height: targetPreset.height }
    }
    return { width: screen.width * scale, height: screen.height * scale }
  }, [screen, targetPreset, scale])

  const filenamePreview = useMemo(() => {
    if (!project || !screen) return ''
    const extension = format === 'jpeg' ? 'jpg' : 'png'
    if (targetPreset) {
      const name = applyFileNamePattern(exportPrefs.fileNamePattern, {
        project: project.name,
        screen: screen.name,
        preset: targetPreset.id,
      })
      return `${name}.${extension}`
    }
    return `${screen.name}.${extension}`
  }, [project, screen, targetPreset, format, exportPrefs.fileNamePattern])

  useEffect(() => {
    if (!open || !screen) return
    let cancelled = false
    const timer = setTimeout(async () => {
      setPreviewLoading(true)
      try {
        const source = targetPreset
          ? (() => {
              const resized = autoResizeScreen(screen, targetPreset.width, targetPreset.height)
              return {
                ...screen,
                width: resized.width,
                height: resized.height,
                background: resized.background,
                elements: resized.elements,
              }
            })()
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, screen, targetPreset, format, jpegQuality, transparentBackground, scale, assetUrls])

  const persistPrefs = () =>
    updateExport({
      defaultFormat: format,
      defaultScale: scale,
      transparentBackground,
      jpegQuality,
    })

  const exportCurrent = async () => {
    if (!project || !screen) return
    setBusy(true)
    try {
      const blob = await exportSingleScreen(screen, {
        project,
        format,
        scale,
        jpegQuality,
        transparentBackground,
        fileNamePattern: exportPrefs.fileNamePattern,
        assetResolver,
        preset: targetPreset,
      })
      const extension = format === 'jpeg' ? 'jpg' : 'png'
      downloadBlob(blob, filenamePreview || `${screen.name}.${extension}`)
      await persistPrefs()
      toast('Screenshot exported', 'success')
    } finally {
      setBusy(false)
    }
  }

  const exportZip = async (presets: string[]) => {
    if (!project || exportScreens.length === 0) return
    setBusy(true)
    const presetList = STORE_PRESETS.filter((preset) => presets.includes(preset.id))
    setProgress({ completed: 0, total: exportScreens.length * presetList.length })
    try {
      const blob = await exportScreensAsZip({
        project,
        screens: exportScreens,
        presets: presetList,
        format,
        scale,
        jpegQuality,
        transparentBackground,
        fileNamePattern: exportPrefs.fileNamePattern,
        assetResolver,
        organizeByPlatform,
        onProgress: (completed, total) => setProgress({ completed, total }),
      })
      downloadBlob(blob, `${project.name}-export.zip`)
      await updateExport({
        lastUsedPresets: presets,
        defaultFormat: format,
        defaultScale: scale,
        transparentBackground,
        jpegQuality,
      })
      toast('ZIP export complete', 'success')
    } finally {
      setBusy(false)
      setProgress(null)
    }
  }

  const exportAll = () => exportZip(selectedPresets)
  const smartExportZip = () => exportZip(SMART_PRESETS)

  const selectedPresetDetails = STORE_PRESETS.filter((preset) =>
    selectedPresets.includes(preset.id),
  )
  const totalFiles = exportScreens.length * selectedPresets.length

  const toggleAllScreens = (checked: boolean) => {
    if (!project) return
    setSelectedScreenIds(checked ? project.screens.map((s) => s.id) : [])
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 max-h-[90vh] w-[min(94vw,760px)] -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-xl border border-border bg-card p-6 shadow-xl">
          <Dialog.Title className="text-lg font-semibold">Export screenshots</Dialog.Title>
          <p className="mt-1 text-sm text-muted-foreground">
            Design-size exports use the scale multiplier. Store presets always export at exact
            pixel dimensions.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-[1fr_220px]">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <label className="text-sm">
                  Format
                  <select
                    className="mt-1 h-9 w-full rounded-md border border-input bg-card px-3"
                    value={format}
                    onChange={(event) => setFormat(event.target.value as 'png' | 'jpeg')}
                  >
                    <option value="png">PNG</option>
                    <option value="jpeg">JPEG</option>
                  </select>
                </label>
                <label className="text-sm">
                  Scale
                  <span className="ml-1 text-xs text-muted-foreground">(design-size only)</span>
                  <select
                    className="mt-1 h-9 w-full rounded-md border border-input bg-card px-3"
                    value={scale}
                    onChange={(event) => setScale(Number(event.target.value) as 1 | 2 | 3)}
                    disabled={currentTarget !== 'design'}
                  >
                    <option value={1}>1x</option>
                    <option value={2}>2x</option>
                    <option value={3}>3x</option>
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={transparentBackground}
                    onChange={(event) => setTransparentBackground(event.target.checked)}
                  />
                  Transparent background
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={organizeByPlatform}
                    onChange={(event) => setOrganizeByPlatform(event.target.checked)}
                  />
                  ios/ / android/ folders
                </label>
                {format === 'jpeg' && (
                  <label className="col-span-2 text-sm">
                    JPEG quality ({Math.round(jpegQuality * 100)}%)
                    <input
                      type="range"
                      min={0.3}
                      max={1}
                      step={0.01}
                      value={jpegQuality}
                      onChange={(event) => setJpegQuality(Number(event.target.value))}
                      className="mt-1 w-full"
                    />
                  </label>
                )}
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">Screens to export</span>
                  <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={
                        project != null && selectedScreenIds.length === project.screens.length
                      }
                      onChange={(event) => toggleAllScreens(event.target.checked)}
                    />
                    All
                  </label>
                </div>
                <div className="max-h-28 space-y-1 overflow-auto rounded-md border border-border p-2">
                  {project?.screens.map((s) => (
                    <label key={s.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedScreenIds.includes(s.id)}
                        onChange={(event) => {
                          setSelectedScreenIds((current) =>
                            event.target.checked
                              ? [...current, s.id]
                              : current.filter((id) => id !== s.id),
                          )
                        }}
                      />
                      {s.name}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2 text-sm font-medium">Store presets (ZIP)</div>
                <p className="mb-2 text-xs text-muted-foreground">
                  Each preset exports at its exact store dimensions — scale does not apply.
                </p>
                <div className="max-h-36 space-y-2 overflow-auto rounded-md border border-border p-2">
                  {STORE_PRESETS.map((preset) => (
                    <label key={preset.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedPresets.includes(preset.id)}
                        onChange={(event) => {
                          setSelectedPresets((current) =>
                            event.target.checked
                              ? [...current, preset.id]
                              : current.filter((id) => id !== preset.id),
                          )
                        }}
                      />
                      {preset.name} ({preset.width}×{preset.height})
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-sm font-medium">Output preview</div>
              <label className="block text-xs text-muted-foreground">
                Current screen target
                <select
                  className="mt-1 h-9 w-full rounded-md border border-input bg-card px-2 text-sm text-foreground"
                  value={currentTarget}
                  onChange={(event) => setCurrentTarget(event.target.value)}
                >
                  <option value="design">Design size ({scale}x)</option>
                  {STORE_PRESETS.map((preset) => (
                    <option key={preset.id} value={preset.id}>
                      {preset.name}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex aspect-[9/16] w-full items-center justify-center overflow-hidden rounded-md border border-border bg-muted/40">
                {previewLoading ? (
                  <span className="text-xs text-muted-foreground">Rendering…</span>
                ) : previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Export preview"
                    className="max-h-full max-w-full object-contain"
                    style={
                      transparentBackground
                        ? {
                            backgroundImage:
                              'linear-gradient(45deg,#cbd5e1 25%,transparent 25%),linear-gradient(-45deg,#cbd5e1 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#cbd5e1 75%),linear-gradient(-45deg,transparent 75%,#cbd5e1 75%)',
                            backgroundSize: '16px 16px',
                            backgroundPosition: '0 0,0 8px,8px -8px,-8px 0',
                          }
                        : undefined
                    }
                  />
                ) : (
                  <span className="text-xs text-muted-foreground">No preview</span>
                )}
              </div>

              {currentOutput && (
                <div className="rounded-md bg-muted/40 p-2 text-xs text-muted-foreground">
                  Output:{' '}
                  <span className="font-medium text-foreground tabular-nums">
                    {currentOutput.width}×{currentOutput.height}px
                  </span>
                  {targetPreset && (
                    <span className="ml-1 text-emerald-600">(exact store size)</span>
                  )}
                </div>
              )}

              {filenamePreview && (
                <div className="rounded-md bg-muted/40 p-2 text-xs">
                  <span className="text-muted-foreground">Filename: </span>
                  <span className="font-mono text-foreground">{filenamePreview}</span>
                </div>
              )}

              {selectedPresetDetails.length > 0 && (
                <div className="rounded-md bg-muted/40 p-2 text-xs text-muted-foreground">
                  <div className="mb-1 font-medium text-foreground">
                    ZIP: {totalFiles} file{totalFiles === 1 ? '' : 's'}
                  </div>
                  <ul className="space-y-0.5">
                    {selectedPresetDetails.map((preset) => (
                      <li key={preset.id} className="tabular-nums">
                        {preset.name}: {preset.width}×{preset.height}px
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {progress && (
            <div className="mt-4">
              <div className="mb-1 text-sm text-muted-foreground">
                Exporting {progress.completed} / {progress.total}
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${(progress.completed / progress.total) * 100}%` }}
                />
              </div>
            </div>
          )}

          <div className="mt-5 flex flex-wrap justify-end gap-2">
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              variant="secondary"
              disabled={busy || exportScreens.length === 0}
              onClick={() => void smartExportZip()}
            >
              Smart export
            </Button>
            <Button variant="secondary" disabled={busy || !screen} onClick={() => void exportCurrent()}>
              Export current
            </Button>
            <Button
              disabled={busy || selectedPresets.length === 0 || exportScreens.length === 0}
              onClick={() => void exportAll()}
            >
              Export ZIP
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
