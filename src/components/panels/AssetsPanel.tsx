import type { LucideIcon } from 'lucide-react'
import { ImagePlus, Images, Search, Upload } from 'lucide-react'
import { AssetRow } from '@/components/panels/assets/AssetRow'
import { TooltipIconButton } from '@/components/ui/TooltipIconButton'
import { useAssetLibrary } from '@/hooks/useAssetLibrary'
import { cn } from '@/lib/utils'

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/20 px-4 py-8 text-center">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon size={18} strokeWidth={1.75} />
      </div>
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="mt-1 max-w-[240px] text-xs leading-relaxed text-muted-foreground">
        {description}
      </p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}

export function AssetsPanel() {
  const {
    filtered,
    assetUrls,
    query,
    setQuery,
    uploadMode,
    setUploadMode,
    isDragging,
    parentRef,
    fileInputRef,
    virtualizer,
    assetCountLabel,
    showEmptyLibrary,
    showNoResults,
    onUpload,
    onDelete,
    onAddToCanvas,
    onAssignToDevice,
    onDragEnter,
    onDragLeave,
    onDragOver,
    onDrop,
    openFilePicker,
  } = useAssetLibrary()

  const uploadButton = (
    <button
      type="button"
      onClick={openFilePicker}
      className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-dashed border-border/70 bg-card px-2.5 text-xs font-medium text-foreground transition hover:border-primary/40 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Upload size={13} strokeWidth={2} />
      Upload
    </button>
  )

  return (
    <div
      className={cn(
        'relative flex h-full flex-col gap-2.5 p-3 transition-colors',
        isDragging && 'bg-primary/5 ring-2 ring-inset ring-primary/25',
      )}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={(event) => void onDrop(event)}
    >
      <div className="shrink-0 space-y-2 rounded-xl border border-border/50 bg-muted/25 p-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-baseline gap-2">
            <p className="text-xs font-semibold text-foreground">Library</p>
            <span className="truncate text-[11px] text-muted-foreground">{assetCountLabel}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <select
            value={uploadMode}
            onChange={(e) => setUploadMode(e.target.value as 'library' | 'canvas')}
            className="h-8 rounded-md border border-border/60 bg-card px-2 text-xs"
            title="Upload behavior"
          >
            <option value="library">Library only</option>
            <option value="canvas">Add to canvas</option>
          </select>
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground"
              size={13}
              strokeWidth={2}
            />
            <input
              type="search"
              placeholder="Search assets…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-8 w-full rounded-md border border-border/60 bg-card pl-8 pr-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <TooltipIconButton
            icon={ImagePlus}
            label="Upload assets"
            onClick={openFilePicker}
            className="border border-dashed border-border/70 bg-card hover:border-primary/40 hover:bg-muted/40"
          />
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(event) => void onUpload(event)}
        />
      </div>

      {showEmptyLibrary ? (
        <EmptyState
          icon={Images}
          title="No assets yet"
          description="Drop screenshots here or upload images to reuse across screens and device frames."
          action={uploadButton}
        />
      ) : showNoResults ? (
        <EmptyState
          icon={Search}
          title="No matching assets"
          description={`Nothing matches "${query}". Try a different search term.`}
        />
      ) : (
        <div ref={parentRef} className="min-h-0 flex-1 overflow-auto">
          <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
            {virtualizer.getVirtualItems().map((item) => {
              const asset = filtered[item.index]
              return (
                <div
                  key={asset.id}
                  className="absolute top-0 left-0 w-full pb-1.5"
                  style={{ transform: `translateY(${item.start}px)` }}
                >
                  <AssetRow
                    asset={asset}
                    url={assetUrls[asset.id]}
                    onUse={() => onAssignToDevice(asset.id)}
                    onAddToCanvas={() => onAddToCanvas(asset.id)}
                    onDelete={() => void onDelete(asset.id)}
                  />
                </div>
              )
            })}
          </div>
        </div>
      )}

      {isDragging && (
        <div className="pointer-events-none absolute inset-3 flex items-center justify-center rounded-xl border-2 border-dashed border-primary/40 bg-primary/5">
          <p className="rounded-md bg-card/90 px-3 py-1.5 text-xs font-medium text-foreground shadow-sm">
            Drop images to add to library
          </p>
        </div>
      )}
    </div>
  )
}
