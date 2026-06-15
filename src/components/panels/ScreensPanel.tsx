import { useMemo, useState } from 'react'
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
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Copy, GripVertical, Plus, RefreshCw, Smartphone, Trash2 } from 'lucide-react'
import { CopyToAndroidDialog } from '@/components/panels/CopyToAndroidDialog'
import { MAX_SCREENS } from '@/lib/constants'
import { DEFAULT_ANDROID_DEVICE_ID, screenHasIpadFrame } from '@/lib/assets/device-mapping'
import { getScreenPlatform, isAppleScreen } from '@/lib/platform-copy'
import { confirm } from '@/stores/confirm-store'
import { useProjectStore } from '@/stores/project-store'
import { useEditorStore } from '@/stores/editor-store'
import { toast } from '@/stores/toast-store'
import { Button } from '@/components/ui/Button'
import type { Screen } from '@/lib/types'

type CopyMode = 'all' | 'single'

function SortableScreenItem({
  screen,
  onCopyToAndroid,
  onSyncAndroid,
  linkedAndroid,
}: {
  screen: Screen
  onCopyToAndroid: (screenId: string) => void
  onSyncAndroid: (screenId: string) => void
  linkedAndroid: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: screen.id,
  })
  const activeScreenId = useEditorStore((state) => state.activeScreenId)
  const focusScreen = useEditorStore((state) => state.focusScreen)
  const renameScreen = useProjectStore((state) => state.renameScreen)
  const duplicateScreen = useProjectStore((state) => state.duplicateScreen)
  const deleteScreen = useProjectStore((state) => state.deleteScreen)
  const project = useProjectStore((state) => state.project)
  const platform = getScreenPlatform(screen)

  const handleDelete = async (event: React.MouseEvent) => {
    event.stopPropagation()
    const confirmed = await confirm({
      title: 'Delete screen?',
      description: `"${screen.name}" and all its elements will be removed.`,
      confirmLabel: 'Delete',
      destructive: true,
    })
    if (confirmed) deleteScreen(screen.id)
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex cursor-pointer items-center gap-2 rounded-md border px-2 py-2 ${
        activeScreenId === screen.id ? 'border-primary bg-accent' : 'border-border bg-card'
      }`}
      onClick={() => focusScreen(screen.id, true)}
    >
      <button
        type="button"
        className="cursor-grab text-muted-foreground"
        {...attributes}
        {...listeners}
        onClick={(event) => event.stopPropagation()}
      >
        <GripVertical size={14} />
      </button>
      <div className="min-w-0 flex-1">
        <input
          className="w-full bg-transparent text-sm outline-none"
          value={screen.name}
          onFocus={() => focusScreen(screen.id, false)}
          onChange={(event) => renameScreen(screen.id, event.target.value)}
        />
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
          {platform === 'android' ? 'Android' : 'iOS'}
        </p>
      </div>
      {isAppleScreen(screen) && (
        <>
          {linkedAndroid ? (
            <button
              type="button"
              aria-label="Sync linked Android screen"
              title="Sync from iOS"
              className="text-muted-foreground transition hover:text-foreground"
              onClick={(event) => {
                event.stopPropagation()
                onSyncAndroid(screen.id)
              }}
            >
              <RefreshCw size={14} />
            </button>
          ) : (
            <button
              type="button"
              aria-label="Copy to Android"
              className="text-muted-foreground transition hover:text-foreground"
              onClick={(event) => {
                event.stopPropagation()
                onCopyToAndroid(screen.id)
              }}
            >
              <Smartphone size={14} />
            </button>
          )}
        </>
      )}
      <button type="button" aria-label="Duplicate screen" onClick={() => duplicateScreen(screen.id)}>
        <Copy size={14} />
      </button>
      <button
        type="button"
        aria-label="Delete screen"
        disabled={(project?.screens.length ?? 0) <= 1}
        onClick={(event) => void handleDelete(event)}
      >
        <Trash2 size={14} />
      </button>
    </div>
  )
}

function ScreenGroup({
  title,
  screens,
  onCopyToAndroid,
  onSyncAndroid,
  linkedAndroidBySource,
}: {
  title: string
  screens: Screen[]
  onCopyToAndroid: (screenId: string) => void
  onSyncAndroid: (screenId: string) => void
  linkedAndroidBySource: Set<string>
}) {
  if (screens.length === 0) return null

  return (
    <div className="space-y-2">
      <p className="px-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      {screens.map((screen) => (
        <SortableScreenItem
          key={screen.id}
          screen={screen}
          onCopyToAndroid={onCopyToAndroid}
          onSyncAndroid={onSyncAndroid}
          linkedAndroid={linkedAndroidBySource.has(screen.id)}
        />
      ))}
    </div>
  )
}

export function ScreensPanel() {
  const project = useProjectStore((state) => state.project)
  const addScreen = useProjectStore((state) => state.addScreen)
  const reorderScreens = useProjectStore((state) => state.reorderScreens)
  const copyScreenToAndroid = useProjectStore((state) => state.copyScreenToAndroid)
  const syncLinkedAndroidScreen = useProjectStore((state) => state.syncLinkedAndroidScreen)
  const copyAllScreensToAndroid = useProjectStore((state) => state.copyAllScreensToAndroid)
  const assetUrls = useProjectStore((state) => state.assetUrls)
  const focusScreen = useEditorStore((state) => state.focusScreen)
  const requestFit = useEditorStore((state) => state.requestFit)
  const sensors = useSensors(useSensor(PointerSensor))

  const [dialogOpen, setDialogOpen] = useState(false)
  const [copyMode, setCopyMode] = useState<CopyMode>('all')
  const [pendingScreenId, setPendingScreenId] = useState<string | null>(null)
  const [targetDeviceId, setTargetDeviceId] = useState(DEFAULT_ANDROID_DEVICE_ID)

  const appleScreens = useMemo(
    () => project?.screens.filter(isAppleScreen) ?? [],
    [project?.screens],
  )
  const androidScreens = useMemo(
    () => project?.screens.filter((screen) => getScreenPlatform(screen) === 'android') ?? [],
    [project?.screens],
  )
  const linkedAndroidBySource = useMemo(() => {
    const ids = new Set<string>()
    for (const screen of androidScreens) {
      if (screen.sourceScreenId) ids.add(screen.sourceScreenId)
    }
    return ids
  }, [androidScreens])

  const dialogScreenCount = copyMode === 'all' ? appleScreens.length : 1

  const sourceScreen = useMemo(() => {
    if (copyMode === 'single' && pendingScreenId) {
      return project?.screens.find((s) => s.id === pendingScreenId) ?? null
    }
    return appleScreens[0] ?? null
  }, [copyMode, pendingScreenId, project?.screens, appleScreens])

  const assetResolver = (assetId?: string) => (assetId ? assetUrls[assetId] : undefined)

  const includesIpadFrame = useMemo(() => {
    const targets =
      copyMode === 'all'
        ? appleScreens
        : (project?.screens.filter((screen) => screen.id === pendingScreenId) ?? [])
    return targets.some((screen) => screenHasIpadFrame(screen.elements))
  }, [appleScreens, copyMode, pendingScreenId, project?.screens])

  if (!project) return null

  const openCopyDialog = (mode: CopyMode, screenId?: string) => {
    setCopyMode(mode)
    setPendingScreenId(screenId ?? null)
    setDialogOpen(true)
  }

  const handleConfirmCopy = () => {
    if (copyMode === 'all') {
      const createdIds = copyAllScreensToAndroid(targetDeviceId)
      if (createdIds.length > 0) {
        focusScreen(createdIds[0], false)
        requestFit('all')
      }
      return
    }

    if (!pendingScreenId) return
    const createdId = copyScreenToAndroid(pendingScreenId, targetDeviceId)
    if (createdId) {
      focusScreen(createdId, true)
    }
  }

  const handleSyncAndroid = (appleScreenId: string) => {
    const synced = syncLinkedAndroidScreen(appleScreenId)
    if (synced) {
      toast('Android screen synced from iOS', 'success')
    } else {
      toast('No linked Android screen to sync', 'error')
    }
  }

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const ids = project.screens.map((screen) => screen.id)
    const oldIndex = ids.indexOf(String(active.id))
    const newIndex = ids.indexOf(String(over.id))
    reorderScreens(arrayMove(ids, oldIndex, newIndex))
  }

  return (
    <div className="space-y-3 p-3">
      <div className="flex flex-col gap-2">
        <Button
          size="sm"
          variant="secondary"
          disabled={project.screens.length >= MAX_SCREENS}
          onClick={() => {
            addScreen()
            const latest = useProjectStore.getState().project?.screens.at(-1)
            if (latest) focusScreen(latest.id, true)
          }}
        >
          <Plus size={14} />
          Add screen
        </Button>
        <Button
          size="sm"
          variant="secondary"
          disabled={appleScreens.length === 0}
          onClick={() => openCopyDialog('all')}
        >
          <Smartphone size={14} />
          Copy all to Android
        </Button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext
          items={project.screens.map((screen) => screen.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            <ScreenGroup
              title="iOS"
              screens={appleScreens}
              onCopyToAndroid={(screenId) => openCopyDialog('single', screenId)}
              onSyncAndroid={handleSyncAndroid}
              linkedAndroidBySource={linkedAndroidBySource}
            />
            <ScreenGroup
              title="Android"
              screens={androidScreens}
              onCopyToAndroid={(screenId) => openCopyDialog('single', screenId)}
              onSyncAndroid={handleSyncAndroid}
              linkedAndroidBySource={linkedAndroidBySource}
            />
          </div>
        </SortableContext>
      </DndContext>

      <CopyToAndroidDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        screenCount={dialogScreenCount}
        includesIpadFrame={includesIpadFrame}
        targetDeviceId={targetDeviceId}
        sourceScreen={sourceScreen}
        assetResolver={assetResolver}
        onTargetDeviceChange={setTargetDeviceId}
        onConfirm={handleConfirmCopy}
      />
    </div>
  )
}
