import { STORE_PRESETS } from '@/lib/presets/store-sizes'
import type { ExportPlanSummary } from '@/lib/export/export-plan'
import type { ExportFormat, Project, ResizeStrategy, Screen } from '@/lib/types'
import type { StorePreset } from '@/lib/types'

interface ExportAdvancedTabProps {
  project: Project | null
  screen: Screen | undefined
  format: ExportFormat
  scale: 1 | 2 | 3
  jpegQuality: number
  transparentBackground: boolean
  resizeStrategy: ResizeStrategy
  currentTarget: string
  selectedScreenIds: string[]
  selectedPresets: string[]
  organizeByPlatform: boolean
  platformAware: boolean
  previewUrl: string | null
  previewLoading: boolean
  currentOutput: { width: number; height: number } | null
  advancedSummary: ExportPlanSummary
  onFormatChange: (format: ExportFormat) => void
  onScaleChange: (scale: 1 | 2 | 3) => void
  onJpegQualityChange: (value: number) => void
  onTransparentBackgroundChange: (value: boolean) => void
  onResizeStrategyChange: (value: ResizeStrategy) => void
  onCurrentTargetChange: (value: string) => void
  onToggleAllScreens: (checked: boolean) => void
  onToggleScreen: (screenId: string, checked: boolean) => void
  onTogglePreset: (presetId: string, checked: boolean) => void
  onOrganizeByPlatformChange: (value: boolean) => void
  onPlatformAwareChange: (value: boolean) => void
}

export function ExportAdvancedTab({
  project,
  screen,
  format,
  scale,
  jpegQuality,
  transparentBackground,
  resizeStrategy,
  currentTarget,
  selectedScreenIds,
  selectedPresets,
  organizeByPlatform,
  platformAware,
  previewUrl,
  previewLoading,
  currentOutput,
  advancedSummary,
  onFormatChange,
  onScaleChange,
  onJpegQualityChange,
  onTransparentBackgroundChange,
  onResizeStrategyChange,
  onCurrentTargetChange,
  onToggleAllScreens,
  onToggleScreen,
  onTogglePreset,
  onOrganizeByPlatformChange,
  onPlatformAwareChange,
}: ExportAdvancedTabProps) {
  return (
    <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-[1fr_220px]">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">
            Format
            <select
              className="mt-1 h-9 w-full rounded-md border border-input bg-card px-3"
              value={format}
              onChange={(event) => onFormatChange(event.target.value as ExportFormat)}
            >
              <option value="png">PNG</option>
              <option value="jpeg">JPEG</option>
            </select>
          </label>
          <label className="text-sm">
            Resize strategy
            <select
              className="mt-1 h-9 w-full rounded-md border border-input bg-card px-3"
              value={resizeStrategy}
              onChange={(event) => onResizeStrategyChange(event.target.value as ResizeStrategy)}
            >
              <option value="fit">Fit (letterbox)</option>
              <option value="fill">Fill (center crop)</option>
              <option value="crop">Crop (top-left)</option>
            </select>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">
            Scale
            <span className="ml-1 text-xs text-muted-foreground">(design-size only)</span>
            <select
              className="mt-1 h-9 w-full rounded-md border border-input bg-card px-3"
              value={scale}
              onChange={(event) => onScaleChange(Number(event.target.value) as 1 | 2 | 3)}
              disabled={currentTarget !== 'design'}
            >
              <option value={1}>1x</option>
              <option value={2}>2x</option>
              <option value={3}>3x</option>
            </select>
          </label>
          {format === 'jpeg' && (
            <label className="text-sm">
              JPEG quality ({Math.round(jpegQuality * 100)}%)
              <input
                type="range"
                min={0.3}
                max={1}
                step={0.01}
                value={jpegQuality}
                onChange={(event) => onJpegQualityChange(Number(event.target.value))}
                className="mt-2 w-full"
              />
            </label>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={transparentBackground}
              onChange={(event) => onTransparentBackgroundChange(event.target.checked)}
            />
            Transparent background
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={organizeByPlatform}
              onChange={(event) => onOrganizeByPlatformChange(event.target.checked)}
            />
            ios/ / android/ folders
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={platformAware}
              onChange={(event) => onPlatformAwareChange(event.target.checked)}
            />
            Platform-aware presets
          </label>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">Screens to export</span>
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={project != null && selectedScreenIds.length === project.screens.length}
                onChange={(event) => onToggleAllScreens(event.target.checked)}
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
                  onChange={(event) => onToggleScreen(s.id, event.target.checked)}
                />
                {s.name}
              </label>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 text-sm font-medium">Store presets (ZIP)</div>
          <div className="max-h-36 space-y-2 overflow-auto rounded-md border border-border p-2">
            {STORE_PRESETS.map((preset) => (
              <label key={preset.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedPresets.includes(preset.id)}
                  onChange={(event) => onTogglePreset(preset.id, event.target.checked)}
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
            onChange={(event) => onCurrentTargetChange(event.target.value)}
          >
            <option value="design">Design size ({scale}x)</option>
            {STORE_PRESETS.map((preset: StorePreset) => (
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
          </div>
        )}

        {advancedSummary.totalFiles > 0 && (
          <div className="rounded-md bg-muted/40 p-2 text-xs text-muted-foreground">
            ZIP: {advancedSummary.totalFiles} file
            {advancedSummary.totalFiles === 1 ? '' : 's'}
          </div>
        )}

        {!screen && (
          <p className="text-xs text-muted-foreground">Select a screen to preview export output.</p>
        )}
      </div>
    </div>
  )
}
