import type { ExportPlanSummary } from '@/lib/export/export-plan'
import type { ExportGridPreview } from '@/hooks/useExportPreview'

interface ExportQuickTabProps {
  exportScreenCount: number
  quickSummary: ExportPlanSummary
  gridPreviews: ExportGridPreview[]
  organizeByPlatform: boolean
  onOrganizeByPlatformChange: (value: boolean) => void
}

export function ExportQuickTab({
  exportScreenCount,
  quickSummary,
  gridPreviews,
  organizeByPlatform,
  onOrganizeByPlatformChange,
}: ExportQuickTabProps) {
  return (
    <div className="mt-4 space-y-4">
      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <p className="text-sm font-medium">Store-ready ZIP</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Exports {exportScreenCount} screen{exportScreenCount === 1 ? '' : 's'} with platform-matched
          presets — iOS screens to Apple sizes, Android screens to Android sizes.
        </p>
        <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
          {quickSummary.presets.map((preset) => (
            <li key={preset.id} className="tabular-nums">
              {preset.name}: {preset.width}×{preset.height}px
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm">
          <span className="font-medium text-foreground">{quickSummary.totalFiles}</span> files
          {quickSummary.appleFiles > 0 && (
            <span className="text-muted-foreground"> · {quickSummary.appleFiles} iOS</span>
          )}
          {quickSummary.androidFiles > 0 && (
            <span className="text-muted-foreground"> · {quickSummary.androidFiles} Android</span>
          )}
        </p>
      </div>

      {gridPreviews.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium">Preview</p>
          <div className="grid grid-cols-3 gap-2">
            {gridPreviews.map((item) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-md border border-border bg-muted/40"
              >
                <img
                  src={item.url}
                  alt={item.label}
                  className="aspect-[9/16] w-full object-contain"
                />
                <p className="truncate px-1.5 py-1 text-[10px] text-muted-foreground">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={organizeByPlatform}
          onChange={(event) => onOrganizeByPlatformChange(event.target.checked)}
        />
        Organize ZIP into ios/ and android/ folders
      </label>
    </div>
  )
}
