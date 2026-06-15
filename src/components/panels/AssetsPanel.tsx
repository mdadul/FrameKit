import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Check, ImagePlus, Images, Plus, Search, Trash2, Upload } from 'lucide-react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { createAssetObjectUrl } from '@/lib/assets/image-pipeline'
import { persistProjectAsset } from '@/lib/assets/persist-project-asset'
import { deleteAsset, getProjectAssets } from '@/lib/db'
import { useProjectStore } from '@/stores/project-store'
import { useEditorStore } from '@/stores/editor-store'
import { cn } from '@/lib/utils'
import { confirm } from '@/stores/confirm-store'
import type { AssetRecord } from '@/lib/types'

const ASSET_ROW_HEIGHT = 72

function formatAssetType(type: AssetRecord['type']): string {
  return type.charAt(0).toUpperCase() + type.slice(1)
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function hasImageFiles(event: React.DragEvent): boolean {
  return Array.from(event.dataTransfer.types).includes('Files')
}

function TooltipIconButton({
  icon: Icon,
  label,
  onClick,
  className,
}: {
  icon: LucideIcon
  label: string
  onClick: () => void
  className?: string
}) {
  return (
    <div className="group/tip relative shrink-0">
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        className={cn(
          'inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          className,
        )}
      >
        <Icon size={15} />
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute top-[calc(100%+4px)] right-0 z-50 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[11px] font-medium text-background opacity-0 shadow-md transition-opacity duration-150 group-hover/tip:opacity-100 group-focus-within/tip:opacity-100"
      >
        {label}
      </span>
    </div>
  )
}

function AssetRow({
  asset,
  url,
  onUse,
  onAddToCanvas,
  onDelete,
}: {
  asset: AssetRecord
  url?: string
  onUse: () => void
  onAddToCanvas: () => void
  onDelete: () => void
}) {
  return (
    <div className="group flex items-center gap-2 rounded-lg border border-border/60 bg-card p-1.5 transition hover:border-border hover:bg-muted/30">
      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-md border border-border/50 bg-muted">
        {url ? (
          <img src={url} alt={asset.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <Images size={15} strokeWidth={1.75} />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground" title={asset.name}>
          {asset.name}
        </p>
        <div className="mt-0.5 flex min-w-0 items-center gap-1.5 overflow-hidden text-[11px] text-muted-foreground">
          <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 font-medium capitalize">
            {formatAssetType(asset.type)}
          </span>
          <span className="shrink-0 whitespace-nowrap tabular-nums">
            {formatFileSize(asset.blob.size)}
          </span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 has-[:focus-visible]:opacity-100">
        <TooltipIconButton
          icon={Check}
          label="Use on device"
          onClick={onUse}
          className="bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:text-secondary-foreground"
        />
        <TooltipIconButton
          icon={Plus}
          label="Add to canvas"
          onClick={onAddToCanvas}
        />
        <TooltipIconButton
          icon={Trash2}
          label="Delete asset"
          onClick={onDelete}
          className="hover:text-destructive"
        />
      </div>
    </div>
  )
}

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
  const project = useProjectStore((state) => state.project)
  const assetUrls = useProjectStore((state) => state.assetUrls)
  const addImageFromAsset = useProjectStore((state) => state.addImageFromAsset)
  const registerAssetUrl = useProjectStore((state) => state.registerAssetUrl)
  const updateElement = useProjectStore((state) => state.updateElement)
  const [assets, setAssets] = useState<AssetRecord[]>([])
  const [query, setQuery] = useState('')
  const [uploadMode, setUploadMode] = useState<'library' | 'canvas'>('library')
  const [isDragging, setIsDragging] = useState(false)
  const parentRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragCounterRef = useRef(0)

  const loadAssets = useCallback(async () => {
    if (!project) return
    const records = await getProjectAssets(project.id)
    setAssets(records)
    records.forEach((asset) => registerAssetUrl(asset.id, createAssetObjectUrl(asset)))
  }, [project, registerAssetUrl])

  useEffect(() => {
    void loadAssets()
  }, [loadAssets])

  const filtered = useMemo(
    () => assets.filter((asset) => asset.name.toLowerCase().includes(query.toLowerCase())),
    [assets, query],
  )

  const virtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ASSET_ROW_HEIGHT,
    overscan: 6,
  })

  const uploadFiles = useCallback(
    async (files: File[]) => {
      if (!project) return
      for (const file of files) {
        if (!file.type.startsWith('image/')) continue
        const asset = await persistProjectAsset(file, project.id, registerAssetUrl)
        const url = createAssetObjectUrl(asset)
        if (uploadMode === 'canvas') {
          addImageFromAsset(asset.id, url)
        }
      }
      await loadAssets()
    },
    [project, registerAssetUrl, addImageFromAsset, loadAssets, uploadMode],
  )

  const onUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    await uploadFiles(files)
    event.target.value = ''
  }

  const onDelete = async (assetId: string) => {
    const confirmed = await confirm({
      title: 'Delete asset?',
      description: 'This removes the asset from your library. Elements using it may appear broken.',
      confirmLabel: 'Delete',
      destructive: true,
    })
    if (!confirmed) return
    await deleteAsset(assetId)
    await loadAssets()
  }

  const onAddToCanvas = (assetId: string) => {
    const url = assetUrls[assetId]
    if (url) addImageFromAsset(assetId, url)
  }

  const onAssignToDevice = (assetId: string) => {
    const screen = useProjectStore.getState().getActiveScreen()
    const selection = useEditorStore.getState().selectedElementIds
    const device = screen?.elements.find(
      (item) => selection.includes(item.id) && item.type === 'device',
    )
    if (device) {
      updateElement(device.id, { screenshotAssetId: assetId })
    }
  }

  const onDragEnter = (event: React.DragEvent) => {
    if (!hasImageFiles(event)) return
    event.preventDefault()
    dragCounterRef.current += 1
    setIsDragging(true)
  }

  const onDragLeave = (event: React.DragEvent) => {
    if (!hasImageFiles(event)) return
    dragCounterRef.current -= 1
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0
      setIsDragging(false)
    }
  }

  const onDragOver = (event: React.DragEvent) => {
    if (!hasImageFiles(event)) return
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
  }

  const onDrop = async (event: React.DragEvent) => {
    if (!hasImageFiles(event)) return
    event.preventDefault()
    dragCounterRef.current = 0
    setIsDragging(false)
    const files = Array.from(event.dataTransfer.files).filter((file) =>
      file.type.startsWith('image/'),
    )
    await uploadFiles(files)
  }

  const assetCountLabel =
    assets.length === 0
      ? 'Empty'
      : filtered.length === assets.length
        ? `${assets.length} asset${assets.length === 1 ? '' : 's'}`
        : `${filtered.length} of ${assets.length}`

  const showEmptyLibrary = assets.length === 0
  const showNoResults = !showEmptyLibrary && filtered.length === 0

  const uploadButton = (
    <button
      type="button"
      onClick={() => fileInputRef.current?.click()}
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
            onClick={() => fileInputRef.current?.click()}
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
