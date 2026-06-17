import { useState, type MouseEvent } from 'react'
import { DndContext, closestCenter } from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  ChevronRight,
  Copy,
  Eye,
  EyeOff,
  Folder,
  GripVertical,
  Layers,
  Lock,
  Trash2,
} from 'lucide-react'
import { getLayerIcon } from '@/lib/elements/element-meta'
import {
  LAYER_LIST_GROUP_SELECTED,
  LAYER_LIST_GROUP_SELECTED_INDICATOR,
  LAYER_LIST_ITEM_SELECTED,
  LAYER_LIST_ITEM_SELECTED_INDICATOR,
} from '@/lib/canvas/selection-style'
import { LayerContextMenu } from '@/components/panels/LayerContextMenu'
import { useLayerPanelActions } from '@/hooks/useLayerPanelActions'
import { cn } from '@/lib/utils'
import type { Element } from '@/lib/types'

function LayerTypeIcon({ element }: { element: Element }) {
  const Icon = getLayerIcon(element)
  return <Icon size={13} strokeWidth={2} className="shrink-0 text-muted-foreground" />
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
  isSelected,
  onSelect,
  onContextMenu,
  onToggleVisible,
  onToggleLocked,
}: {
  element: Element
  depth?: number
  isSelected: boolean
  onSelect: (elementId: string, event: MouseEvent) => void
  onContextMenu: (event: MouseEvent, elementId: string) => void
  onToggleVisible: () => void
  onToggleLocked: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: element.id,
  })

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
          ? cn(LAYER_LIST_ITEM_SELECTED)
          : 'text-foreground/90 hover:bg-muted/70',
        !element.visible && 'opacity-45',
        isSelected && LAYER_LIST_ITEM_SELECTED_INDICATOR,
      )}
      onClick={(event) => onSelect(element.id, event)}
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
        onToggleVisible={onToggleVisible}
        onToggleLocked={onToggleLocked}
      />
    </div>
  )
}

function GroupBlock({
  members,
  depth = 0,
  selectedElementIds,
  onSelect,
  onSelectGroup,
  onContextMenu,
  onToggleVisible,
  onToggleLocked,
}: {
  members: Element[]
  depth?: number
  selectedElementIds: string[]
  onSelect: (elementId: string, event: MouseEvent) => void
  onSelectGroup: (memberIds: string[], event: MouseEvent) => void
  onContextMenu: (event: MouseEvent, elementIds: string[]) => void
  onToggleVisible: (element: Element) => void
  onToggleLocked: (element: Element) => void
}) {
  const [expanded, setExpanded] = useState(true)
  const memberIds = members.map((member) => member.id)
  const hasSelectedMember = members.some((member) => selectedElementIds.includes(member.id))

  return (
    <div>
      <div
        className={cn(
          'group/layer relative flex h-7 w-full items-center gap-1 pr-1.5 text-[12px] transition select-none',
          hasSelectedMember
            ? cn(LAYER_LIST_GROUP_SELECTED)
            : 'text-foreground/80 hover:bg-muted/70',
          hasSelectedMember && LAYER_LIST_GROUP_SELECTED_INDICATOR,
        )}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
        onClick={(event) => onSelectGroup(memberIds, event)}
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
            isSelected={selectedElementIds.includes(member.id)}
            onSelect={onSelect}
            onContextMenu={(event, id) => onContextMenu(event, [id])}
            onToggleVisible={() => onToggleVisible(member)}
            onToggleLocked={() => onToggleLocked(member)}
          />
        ))}
    </div>
  )
}

export function LayersPanel() {
  const {
    screen,
    sortedLayers,
    selectedElementIds,
    sensors,
    contextMenu,
    contextTarget,
    contextMenuActions,
    openContextMenu,
    closeContextMenu,
    selectLayer,
    selectGroup,
    onDragEnd,
    duplicateSelection,
    deleteSelection,
    toggleLayerVisible,
    toggleLayerLocked,
  } = useLayerPanelActions()

  if (!screen) return null

  if (sortedLayers.length === 0) {
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
          {sortedLayers.length} layer{sortedLayers.length === 1 ? '' : 's'}
        </span>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            title="Duplicate selection"
            disabled={selectedElementIds.length === 0}
            onClick={duplicateSelection}
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
            onClick={deleteSelection}
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
          items={sortedLayers.map((element) => element.id)}
          strategy={verticalListSortingStrategy}
        >
          <div
            className="min-h-0 flex-1 overflow-y-auto py-0.5"
            onClick={closeContextMenu}
          >
            {sortedLayers.map((element) => {
              if (element.groupId) {
                if (renderedGroups.has(element.groupId)) return null
                renderedGroups.add(element.groupId)
                const members = sortedLayers.filter((item) => item.groupId === element.groupId)
                return (
                  <GroupBlock
                    key={element.groupId}
                    members={members}
                    selectedElementIds={selectedElementIds}
                    onSelect={selectLayer}
                    onSelectGroup={selectGroup}
                    onContextMenu={openContextMenu}
                    onToggleVisible={toggleLayerVisible}
                    onToggleLocked={toggleLayerLocked}
                  />
                )
              }
              return (
                <SortableLayerItem
                  key={element.id}
                  element={element}
                  isSelected={selectedElementIds.includes(element.id)}
                  onSelect={selectLayer}
                  onContextMenu={(event, id) => openContextMenu(event, [id])}
                  onToggleVisible={() => toggleLayerVisible(element)}
                  onToggleLocked={() => toggleLayerLocked(element)}
                />
              )
            })}
          </div>
        </SortableContext>
      </DndContext>

      {contextMenu && contextTarget && contextMenuActions && (
        <LayerContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          target={contextTarget}
          onDuplicate={contextMenuActions.duplicate}
          onDelete={contextMenuActions.delete}
          onBringForward={contextMenuActions.bringForward}
          onSendBackward={contextMenuActions.sendBackward}
          onToggleVisible={contextMenuActions.toggleVisible}
          onToggleLocked={contextMenuActions.toggleLocked}
          onClose={closeContextMenu}
        />
      )}
    </div>
  )
}
