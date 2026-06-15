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
import { Eye, EyeOff, GripVertical, Layers, Lock, Trash2, Unlock } from 'lucide-react'
import { useProjectStore } from '@/stores/project-store'
import { useEditorStore } from '@/stores/editor-store'
import { Button } from '@/components/ui/Button'
import type { Element } from '@/lib/types'

function SortableLayerItem({
  element,
  indent = false,
}: {
  element: Element
  indent?: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: element.id,
  })
  const selectedElementIds = useEditorStore((state) => state.selectedElementIds)
  const setSelectedElementIds = useEditorStore((state) => state.setSelectedElementIds)
  const toggleSelection = useEditorStore((state) => state.toggleSelection)
  const updateElement = useProjectStore((state) => state.updateElement)
  const deleteElements = useProjectStore((state) => state.deleteElements)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 rounded-md border px-2 py-2 text-sm ${
        indent ? 'ml-4' : ''
      } ${
        isDragging
          ? 'border-primary/50 bg-accent opacity-50 shadow-sm'
          : selectedElementIds.includes(element.id)
            ? 'border-primary bg-accent'
            : 'border-border bg-card'
      }`}
    >
      <button
        type="button"
        className="cursor-grab text-muted-foreground active:cursor-grabbing"
        aria-label={`Move ${element.name} layer`}
        {...attributes}
        {...listeners}
      >
        <GripVertical size={14} />
      </button>
      <button
        type="button"
        className="flex-1 text-left"
        onClick={(event) => {
          if (event.shiftKey) toggleSelection(element.id)
          else setSelectedElementIds([element.id])
        }}
      >
        <span className="text-[10px] uppercase text-muted-foreground">{element.type}</span>
        <span className="ml-1.5">{element.name}</span>
      </button>
      <button
        type="button"
        aria-label={element.visible ? 'Hide layer' : 'Show layer'}
        onClick={() => updateElement(element.id, { visible: !element.visible })}
      >
        {element.visible ? <Eye size={14} /> : <EyeOff size={14} />}
      </button>
      <button
        type="button"
        aria-label={element.locked ? 'Unlock layer' : 'Lock layer'}
        onClick={() => updateElement(element.id, { locked: !element.locked })}
      >
        {element.locked ? <Lock size={14} /> : <Unlock size={14} />}
      </button>
      <button
        type="button"
        aria-label="Delete layer"
        onClick={() => void deleteElements([element.id])}
      >
        <Trash2 size={14} />
      </button>
    </div>
  )
}

export function LayersPanel() {
  const screen = useProjectStore((state) => state.getActiveScreen())
  const reorderElements = useProjectStore((state) => state.reorderElements)
  const duplicateElements = useProjectStore((state) => state.duplicateElements)
  const selectedElementIds = useEditorStore((state) => state.selectedElementIds)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  )

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
      <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
        <Layers size={24} className="text-muted-foreground opacity-60" />
        <p className="text-sm font-medium">No layers yet</p>
        <p className="text-xs text-muted-foreground">
          Use Insert in the toolbar to add text, shapes, or device frames.
        </p>
      </div>
    )
  }

  const renderedGroups = new Set<string>()

  return (
    <div className="space-y-3 p-3">
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => duplicateElements(selectedElementIds)}
          disabled={selectedElementIds.length === 0}
        >
          Duplicate
        </Button>
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={sorted.map((element) => element.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {sorted.map((element) => {
              if (element.groupId) {
                if (renderedGroups.has(element.groupId)) return null
                renderedGroups.add(element.groupId)
                const members = sorted.filter((e) => e.groupId === element.groupId)
                return (
                  <div key={element.groupId} className="space-y-1">
                    <div className="rounded-md border border-dashed border-border/80 bg-muted/20 px-2 py-1 text-xs font-medium text-muted-foreground">
                      Group ({members.length})
                    </div>
                    {members.map((member) => (
                      <SortableLayerItem key={member.id} element={member} indent />
                    ))}
                  </div>
                )
              }
              return <SortableLayerItem key={element.id} element={element} />
            })}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}
