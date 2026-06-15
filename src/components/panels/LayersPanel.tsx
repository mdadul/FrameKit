import { useCallback, useState, type ComponentType, type MouseEvent } from 'react'
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
import {
  ChevronRight,
  Circle,
  Copy,
  Eye,
  EyeOff,
  Folder,
  GripVertical,
  Image as ImageIcon,
  Layers,
  Lock,
  Minus,
  Smartphone,
  Square,
  Trash2,
  Triangle,
  Type,
} from 'lucide-react'
import { LayerContextMenu } from '@/components/panels/LayerContextMenu'
import { useProjectStore } from '@/stores/project-store'
import { useEditorStore } from '@/stores/editor-store'
import { cn } from '@/lib/utils'
import type { Element, ShapeKind } from '@/lib/types'

function LayerTypeIcon({ element }: { element: Element }) {
  const iconClass = 'shrink-0 text-muted-foreground'

  if (element.type === 'text') {
    return <Type size={13} strokeWidth={2} className={iconClass} />
  }
  if (element.type === 'device') {
    return <Smartphone size={13} strokeWidth={2} className={iconClass} />
  }
  if (element.type === 'image') {
    return <ImageIcon size={13} strokeWidth={2} className={iconClass} />
  }
  if (element.type === 'group') {
    return <Folder size={13} strokeWidth={2} className={iconClass} />
  }
  if (element.type === 'shape') {
    const shapeIcons: Record<ShapeKind, ComponentType<{ size?: number; strokeWidth?: number; className?: string }>> = {
      rectangle: Square,
      circle: Circle,
      triangle: Triangle,
      line: Minus,
    }
    const Icon = shapeIcons[element.shapeKind] ?? Square
    return <Icon size={13} strokeWidth={2} className={iconClass} />
  }

  return <Square size={13} strokeWidth={2} className={iconClass} />
}

function selectLayer(
  elementId: string,
  event: MouseEvent,
  selectedIds: string[],
  setSelected: (ids: string[]) => void,
  toggle: (id: string) => void,
) {
  const additive = event.shiftKey || event.metaKey || event.ctrlKey
  if (additive) {
    toggle(elementId)
    return
  }
  if (selectedIds.length === 1 && selectedIds[0] === elementId) return
  setSelected([elementId])
}

function LayerRowActions({
  element,
  onToggleVisible,
  onToggleLocked,
}: {
  element: Element
  onToggleVisible: () => void
  onToggleLocked: () => void
}) {
  return (
    <div className="flex shrink-0 items-center">
      <button
        type="button"
        aria-label={element.visible ? 'Hide layer' : 'Show layer'}
        onClick={(event) => {
          event.stopPropagation()
          onToggleVisible()
        }}
        className={cn(
          'flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition hover:bg-foreground/5 hover:text-foreground',
          !element.visible ? 'opacity-100' : 'opacity-0 group-hover/layer:opacity-100',
        )}
      >
        {element.visible ? <Eye size={12} /> : <EyeOff size={12} />}
      </button>
      <button
        type="button"
        aria-label={element.locked ? 'Unlock layer' : 'Lock layer'}
        onClick={(event) => {
          event.stopPropagation()
          onToggleLocked()
        }}
        className={cn(
          'flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition hover:bg-foreground/5 hover:text-foreground',
          element.locked ? 'opacity-100' : 'opacity-0 group-hover/layer:opacity-100',
        )}
      >
        <Lock size={12} />
      </button>
    </div>
  )
}

function SortableLayerItem({
  element,
  depth = 0,
  onContextMenu,
}: {
  element: Element
  depth?: number
  onContextMenu: (event: MouseEvent, elementId: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: element.id,
  })
  const selectedElementIds = useEditorStore((state) => state.selectedElementIds)
  const setSelectedElementIds = useEditorStore((state) => state.setSelectedElementIds)
  const toggleSelection = useEditorStore((state) => state.toggleSelection)
  const updateElement = useProjectStore((state) => state.updateElement)

  const isSelected = selectedElementIds.includes(element.id)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    paddingLeft: `${8 + depth * 16}px`,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group/layer relative flex h-7 cursor-default items-center gap-1 pr-1.5 text-[12px] select-none',
        isDragging && 'z-10 opacity-60',
        isSelected
          ? 'bg-[#18A0FB]/12 text-foreground ring-1 ring-inset ring-[#18A0FB]/35'
          : 'text-foreground/90 hover:bg-muted/70',
        !element.visible && 'opacity-45',
        isSelected && 'before:absolute before:inset-y-0 before:left-0 before:w-0.5 before:bg-[#18A0FB]',
      )}
      onClick={(event) => {
        selectLayer(element.id, event, selectedElementIds, setSelectedElementIds, toggleSelection)
      }}
      onContextMenu={(event) => onContextMenu(event, element.id)}
    >
      <button
        type="button"
        aria-label="Drag to reorder"
        className="flex h-6 w-4 shrink-0 cursor-grab items-center justify-center text-muted-foreground/50 opacity-0 transition hover:text-muted-foreground active:cursor-grabbing group-hover/layer:opacity-100"
        onClick={(event) => event.stopPropagation()}
        {...attributes}
        {...listeners}
      >
        <GripVertical size={11} />
      </button>
      <LayerTypeIcon element={element} />
      <span className="min-w-0 flex-1 truncate leading-none">{element.name}</span>
      <LayerRowActions
        element={element}
        onToggleVisible={() => updateElement(element.id, { visible: !element.visible })}
        onToggleLocked={() => updateElement(element.id, { locked: !element.locked })}
      />
    </div>
  )
}

function GroupBlock({
  members,
  depth = 0,
  onContextMenu,
}: {
  members: Element[]
  depth?: number
  onContextMenu: (event: MouseEvent, elementIds: string[]) => void
}) {
  const [expanded, setExpanded] = useState(true)
  const selectedElementIds = useEditorStore((state) => state.selectedElementIds)
  const setSelectedElementIds = useEditorStore((state) => state.setSelectedElementIds)
  const memberIds = members.map((member) => member.id)
  const hasSelectedMember = members.some((member) => selectedElementIds.includes(member.id))
  const allMembersSelected = memberIds.every((id) => selectedElementIds.includes(id))

  return (
    <div>
      <div
        className={cn(
          'group/layer relative flex h-7 w-full items-center gap-1 pr-1.5 text-[12px] transition select-none',
          hasSelectedMember
            ? 'bg-[#18A0FB]/10 text-foreground ring-1 ring-inset ring-[#18A0FB]/25'
            : 'text-foreground/80 hover:bg-muted/70',
          hasSelectedMember && 'before:absolute before:inset-y-0 before:left-0 before:w-0.5 before:bg-[#18A0FB]/70',
        )}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
        onClick={(event) => {
          const additive = event.shiftKey || event.metaKey || event.ctrlKey
          if (additive) {
            if (allMembersSelected) {
              setSelectedElementIds(selectedElementIds.filter((id) => !memberIds.includes(id)))
            } else {
              setSelectedElementIds(Array.from(new Set([...selectedElementIds, ...memberIds])))
            }
            return
          }
          setSelectedElementIds(memberIds)
        }}
        onContextMenu={(event) => onContextMenu(event, memberIds)}
      >
        <button
          type="button"
          aria-label={expanded ? 'Collapse group' : 'Expand group'}
          className="flex h-6 w-4 shrink-0 items-center justify-center text-muted-foreground"
          onClick={(event) => {
            event.stopPropagation()
            setExpanded((value) => !value)
          }}
        >
          <ChevronRight
            size={12}
            className={cn('transition-transform', expanded && 'rotate-90')}
          />
        </button>
        <Folder size={13} strokeWidth={2} className="shrink-0 text-muted-foreground" />
        <span className="min-w-0 flex-1 truncate leading-none">Group · {members.length}</span>
      </div>
      {expanded &&
        members.map((member) => (
          <SortableLayerItem
            key={member.id}
            element={member}
            depth={depth + 1}
            onContextMenu={(event, id) => onContextMenu(event, [id])}
          />
        ))}
    </div>
  )
}

export function LayersPanel() {
  const screen = useProjectStore((state) => state.getActiveScreen())
  const reorderElements = useProjectStore((state) => state.reorderElements)
  const duplicateElements = useProjectStore((state) => state.duplicateElements)
  const deleteElements = useProjectStore((state) => state.deleteElements)
  const bringForward = useProjectStore((state) => state.bringForward)
  const sendBackward = useProjectStore((state) => state.sendBackward)
  const updateElement = useProjectStore((state) => state.updateElement)
  const selectedElementIds = useEditorStore((state) => state.selectedElementIds)
  const setSelectedElementIds = useEditorStore((state) => state.setSelectedElementIds)
  const clearSelection = useEditorStore((state) => state.clearSelection)

  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    elementIds: string[]
  } | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 },
    }),
  )

  const openContextMenu = useCallback(
    (event: MouseEvent, elementIds: string[]) => {
      event.preventDefault()
      event.stopPropagation()
      const uniqueIds = Array.from(new Set(elementIds))
      const hitsSelection = uniqueIds.every((id) => selectedElementIds.includes(id))
      const nextSelection =
        hitsSelection && selectedElementIds.length > 0 ? selectedElementIds : uniqueIds
      if (!hitsSelection || selectedElementIds.length === 0) {
        setSelectedElementIds(uniqueIds)
      }
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        elementIds: nextSelection,
      })
    },
    [selectedElementIds, setSelectedElementIds],
  )

  const contextTarget = contextMenu
    ? (() => {
        const elements =
          screen?.elements.filter((element) => contextMenu.elementIds.includes(element.id)) ?? []
        return {
          elementIds: contextMenu.elementIds,
          allVisible: elements.length > 0 && elements.every((element) => element.visible),
          allLocked: elements.length > 0 && elements.every((element) => element.locked),
          canDelete: contextMenu.elementIds.length > 0,
        }
      })()
    : null

  if (!screen) return null

  const sorted = [...screen.elements].sort((a, b) => b.zIndex - a.zIndex)

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = sorted.findIndex((element) => element.id === active.id)
    const newIndex = sorted.findIndex((element) => element.id === over.id)
    const reordered = arrayMove(sorted, oldIndex, newIndex).reverse()
    reorderElements(reordered.map((element) => element.id))
  }

  if (sorted.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 px-6 py-10 text-center">
        <Layers size={22} className="text-muted-foreground/50" />
        <p className="text-[13px] font-medium text-foreground/80">No layers</p>
        <p className="max-w-[200px] text-[11px] leading-relaxed text-muted-foreground">
          Insert text, shapes, or a device frame from the toolbar.
        </p>
      </div>
    )
  }

  const renderedGroups = new Set<string>()

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center justify-between border-b border-border/80 px-2.5 py-1.5">
        <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          {sorted.length} layer{sorted.length === 1 ? '' : 's'}
        </span>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            title="Duplicate selection"
            disabled={selectedElementIds.length === 0}
            onClick={() => duplicateElements(selectedElementIds)}
            className={cn(
              'flex h-6 w-6 items-center justify-center rounded transition',
              selectedElementIds.length > 0
                ? 'text-muted-foreground hover:bg-muted hover:text-foreground'
                : 'cursor-not-allowed text-muted-foreground/35',
            )}
          >
            <Copy size={13} />
          </button>
          <button
            type="button"
            title="Delete selection"
            disabled={selectedElementIds.length === 0}
            onClick={() => {
              deleteElements(selectedElementIds)
              clearSelection()
            }}
            className={cn(
              'flex h-6 w-6 items-center justify-center rounded transition',
              selectedElementIds.length > 0
                ? 'text-muted-foreground hover:bg-destructive/10 hover:text-destructive'
                : 'cursor-not-allowed text-muted-foreground/35',
            )}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext
          items={sorted.map((element) => element.id)}
          strategy={verticalListSortingStrategy}
        >
          <div
            className="min-h-0 flex-1 overflow-y-auto py-0.5"
            onClick={() => setContextMenu(null)}
          >
            {sorted.map((element) => {
              if (element.groupId) {
                if (renderedGroups.has(element.groupId)) return null
                renderedGroups.add(element.groupId)
                const members = sorted.filter((item) => item.groupId === element.groupId)
                return (
                  <GroupBlock
                    key={element.groupId}
                    members={members}
                    onContextMenu={openContextMenu}
                  />
                )
              }
              return (
                <SortableLayerItem
                  key={element.id}
                  element={element}
                  onContextMenu={(event, id) => openContextMenu(event, [id])}
                />
              )
            })}
          </div>
        </SortableContext>
      </DndContext>

      {contextMenu && contextTarget && (
        <LayerContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          target={contextTarget}
          onDuplicate={() => duplicateElements(contextMenu.elementIds)}
          onDelete={() => {
            deleteElements(contextMenu.elementIds)
            clearSelection()
          }}
          onBringForward={() => {
            for (const id of contextMenu.elementIds) bringForward(id)
          }}
          onSendBackward={() => {
            for (const id of contextMenu.elementIds) sendBackward(id)
          }}
          onToggleVisible={() => {
            const nextVisible = !contextTarget.allVisible
            for (const id of contextMenu.elementIds) {
              updateElement(id, { visible: nextVisible })
            }
          }}
          onToggleLocked={() => {
            const nextLocked = !contextTarget.allLocked
            for (const id of contextMenu.elementIds) {
              updateElement(id, { locked: nextLocked })
            }
          }}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  )
}
