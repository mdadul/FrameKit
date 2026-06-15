import { useEffect, useMemo, useState } from 'react'
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { renderScreenToDataUrl } from '@/lib/export/renderer'
import { cn } from '@/lib/utils'
import type { Screen } from '@/lib/types'

interface ScreensOverviewProps {
  screens: Screen[]
  activeScreenId: string | null
  assetResolver: (assetId?: string) => string | undefined
  onSelect: (screenId: string) => void
  onReorder: (screenIds: string[]) => void
}

// Persisted across mounts so toggling view modes doesn't re-render every thumbnail.
const thumbnailCache = new Map<string, string>()

function collectAssetIds(screen: Screen): string[] {
  const ids: string[] = []
  if (screen.background.imageAssetId) ids.push(screen.background.imageAssetId)
  for (const element of screen.elements) {
    if (element.type === 'image' && element.assetId) ids.push(element.assetId)
    if (element.type === 'device' && element.screenshotAssetId) {
      ids.push(element.screenshotAssetId)
    }
  }
  return ids
}

function getContentSignature(
  screen: Screen,
  assetResolver: (assetId?: string) => string | undefined,
): string {
  const assetSignature = collectAssetIds(screen)
    .map((id) => `${id}=${assetResolver(id) ?? ''}`)
    .join('|')
  return `${JSON.stringify(screen)}::${assetSignature}`
}

function ScreenThumbnail({
  screen,
  index,
  isActive,
  assetResolver,
  onSelect,
}: {
  screen: Screen
  index: number
  isActive: boolean
  assetResolver: (assetId?: string) => string | undefined
  onSelect: (screenId: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: screen.id })
  const signature = useMemo(
    () => getContentSignature(screen, assetResolver),
    [screen, assetResolver],
  )
  const cacheKey = `${screen.id}::${signature}`
  // Holds an async-generated thumbnail tagged with the key it was produced for.
  const [generated, setGenerated] = useState<{ key: string; url: string } | null>(
    null,
  )

  const cached = thumbnailCache.get(cacheKey)
  const dataUrl =
    cached ?? (generated?.key === cacheKey ? generated.url : undefined)

  useEffect(() => {
    if (thumbnailCache.has(cacheKey)) return

    let cancelled = false
    void renderScreenToDataUrl({ screen, assetResolver, scale: 1, format: 'png' })
      .then((url) => {
        if (cancelled) return
        thumbnailCache.set(cacheKey, url)
        setGenerated({ key: cacheKey, url })
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [cacheKey, screen, assetResolver])

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative flex flex-col gap-2 rounded-lg border bg-card p-2 transition',
        isActive ? 'border-primary ring-2 ring-primary' : 'border-border',
        isDragging ? 'z-10 opacity-80 shadow-lg' : 'hover:border-primary/60',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
          {index + 1}
        </span>
        <button
          type="button"
          aria-label="Drag to reorder"
          className="cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={14} />
        </button>
      </div>
      <button
        type="button"
        onClick={() => onSelect(screen.id)}
        className="flex flex-col gap-2 text-left"
      >
        <div
          className="relative w-full overflow-hidden rounded-md bg-muted"
          style={{ aspectRatio: `${screen.width} / ${screen.height}` }}
        >
          {dataUrl ? (
            <img
              src={dataUrl}
              alt={screen.name}
              className="h-full w-full object-contain"
              draggable={false}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs text-muted-foreground">Rendering…</span>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 px-0.5">
          <span className="truncate text-xs font-medium text-foreground">
            {screen.name}
          </span>
          <span className="shrink-0 text-[10px] text-muted-foreground">
            {screen.width}×{screen.height}
          </span>
        </div>
      </button>
    </div>
  )
}

export function ScreensOverview({
  screens,
  activeScreenId,
  assetResolver,
  onSelect,
  onReorder,
}: ScreensOverviewProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  )

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const ids = screens.map((screen) => screen.id)
    const oldIndex = ids.indexOf(String(active.id))
    const newIndex = ids.indexOf(String(over.id))
    if (oldIndex === -1 || newIndex === -1) return
    onReorder(arrayMove(ids, oldIndex, newIndex))
  }

  return (
    <div className="h-full overflow-auto bg-muted/30 p-4 sm:p-6">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={screens.map((screen) => screen.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
            {screens.map((screen, index) => (
              <ScreenThumbnail
                key={screen.id}
                screen={screen}
                index={index}
                isActive={screen.id === activeScreenId}
                assetResolver={assetResolver}
                onSelect={onSelect}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}
