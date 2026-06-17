import { memo } from 'react'
import { Group } from 'react-konva'
import type Konva from 'konva'
import { ElementNode } from '@/components/canvas/ElementNode'
import { isAdditiveKonvaPointerEvent } from '@/lib/selection/is-additive-selection'
import { useEditorStore } from '@/stores/editor-store'
import type { Element } from '@/lib/types'

interface ElementGroupNodeProps {
  groupId: string
  elements: Element[]
  isActive: boolean
  selectedElementIds: string[]
  assetResolver: (assetId?: string) => string | undefined
  editingTextId: string | null
  onSelect: (id: string, additive: boolean) => void
  onChange: (id: string, patch: Partial<Element>) => void
  onDragMove?: (id: string, node: Konva.Node) => void
  onStartTextEdit?: (id: string) => void
}

function ElementGroupNodeInner({
  groupId,
  elements,
  isActive,
  selectedElementIds,
  assetResolver,
  editingTextId,
  onSelect,
  onChange,
  onDragMove,
  onStartTextEdit,
}: ElementGroupNodeProps) {
  const minX = Math.min(...elements.map((e) => e.x))
  const minY = Math.min(...elements.map((e) => e.y))
  const allSelected = elements.every((e) => selectedElementIds.includes(e.id))
  const anyLocked = elements.some((e) => e.locked)

  const setSelectedElementIds = useEditorStore((state) => state.setSelectedElementIds)

  const handleGroupSelect = (additive: boolean) => {
    const ids = elements.map((e) => e.id)
    if (additive) {
      const current = [...selectedElementIds]
      for (const id of ids) {
        if (!current.includes(id)) current.push(id)
      }
      setSelectedElementIds(current)
    } else {
      setSelectedElementIds(ids)
    }
  }

  const childDraggable = isActive && !anyLocked && !allSelected

  const handleChildChange = (id: string, patch: Partial<Element>) => {
    const next = { ...patch }
    if (typeof next.x === 'number') next.x = minX + next.x
    if (typeof next.y === 'number') next.y = minY + next.y
    onChange(id, next)
  }

  const handleChildDragMove = (id: string, node: Konva.Node) => {
    onDragMove?.(id, node)
  }

  return (
    <Group
      id={`group-${groupId}`}
      x={minX}
      y={minY}
      draggable={isActive && !anyLocked && allSelected}
      onClick={(event) => {
        event.cancelBubble = true
        handleGroupSelect(isAdditiveKonvaPointerEvent(event))
      }}
      onTap={(event) => {
        event.cancelBubble = true
        handleGroupSelect(isAdditiveKonvaPointerEvent(event))
      }}
      onDragEnd={(event) => {
        const dx = event.target.x() - minX
        const dy = event.target.y() - minY
        if (dx === 0 && dy === 0) return
        for (const element of elements) {
          onChange(element.id, { x: element.x + dx, y: element.y + dy })
        }
        event.target.position({ x: minX + dx, y: minY + dy })
      }}
    >
      {elements.map((element) => (
        <ElementNode
          key={element.id}
          element={{
            ...element,
            x: element.x - minX,
            y: element.y - minY,
          }}
          selected={selectedElementIds.includes(element.id)}
          assetResolver={assetResolver}
          draggable={childDraggable && !element.locked}
          onSelect={onSelect}
          onChange={handleChildChange}
          onDragMove={handleChildDragMove}
          onStartTextEdit={onStartTextEdit}
          editingTextId={editingTextId}
        />
      ))}
    </Group>
  )
}

export const ElementGroupNode = memo(ElementGroupNodeInner)
