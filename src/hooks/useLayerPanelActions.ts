import { useCallback, useMemo, useState, type MouseEvent } from 'react'
import { PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import {
  buildLayerContextTarget,
  resolveContextMenuSelection,
  sortLayersByZIndex,
  toggleGroupSelection,
} from '@/lib/layers/layer-panel-logic'
import { isAdditiveSelection } from '@/lib/selection/is-additive-selection'
import { useEditorStore } from '@/stores/editor-store'
import { useProjectStore } from '@/stores/project-store'
import type { Element } from '@/lib/types'

export interface LayerContextMenuState {
  x: number
  y: number
  elementIds: string[]
}

export type LayerContextTarget = ReturnType<typeof buildLayerContextTarget>

export interface LayerContextMenuActions {
  duplicate: () => void
  delete: () => void
  bringForward: () => void
  sendBackward: () => void
  toggleVisible: () => void
  toggleLocked: () => void
}

export function useLayerPanelActions() {
  const screen = useProjectStore((state) => state.getActiveScreen())
  const reorderElements = useProjectStore((state) => state.reorderElements)
  const duplicateElements = useProjectStore((state) => state.duplicateElements)
  const deleteElements = useProjectStore((state) => state.deleteElements)
  const bringForward = useProjectStore((state) => state.bringForward)
  const sendBackward = useProjectStore((state) => state.sendBackward)
  const updateElement = useProjectStore((state) => state.updateElement)

  const selectedElementIds = useEditorStore((state) => state.selectedElementIds)
  const setSelectedElementIds = useEditorStore((state) => state.setSelectedElementIds)
  const toggleSelection = useEditorStore((state) => state.toggleSelection)
  const clearSelection = useEditorStore((state) => state.clearSelection)

  const [contextMenu, setContextMenu] = useState<LayerContextMenuState | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 },
    }),
  )

  const sortedLayers = useMemo(
    () => (screen ? sortLayersByZIndex(screen) : []),
    [screen],
  )

  const openContextMenu = useCallback(
    (event: MouseEvent, elementIds: string[]) => {
      event.preventDefault()
      event.stopPropagation()
      const uniqueIds = Array.from(new Set(elementIds))
      const hitsSelection = uniqueIds.every((id) => selectedElementIds.includes(id))
      const nextSelection = resolveContextMenuSelection(uniqueIds, selectedElementIds)
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

  const contextTarget = useMemo((): LayerContextTarget | null => {
    if (!contextMenu || !screen) return null
    return buildLayerContextTarget(screen, contextMenu.elementIds)
  }, [contextMenu, screen])

  const closeContextMenu = useCallback(() => setContextMenu(null), [])

  const selectLayer = useCallback(
    (elementId: string, event: MouseEvent) => {
      if (isAdditiveSelection(event)) {
        toggleSelection(elementId)
        return
      }
      if (selectedElementIds.length === 1 && selectedElementIds[0] === elementId) return
      setSelectedElementIds([elementId])
    },
    [selectedElementIds, setSelectedElementIds, toggleSelection],
  )

  const selectGroup = useCallback(
    (memberIds: string[], event: MouseEvent) => {
      setSelectedElementIds(
        toggleGroupSelection(memberIds, selectedElementIds, isAdditiveSelection(event)),
      )
    },
    [selectedElementIds, setSelectedElementIds],
  )

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return
      const oldIndex = sortedLayers.findIndex((element) => element.id === active.id)
      const newIndex = sortedLayers.findIndex((element) => element.id === over.id)
      const reordered = arrayMove(sortedLayers, oldIndex, newIndex).reverse()
      reorderElements(reordered.map((element) => element.id))
    },
    [sortedLayers, reorderElements],
  )

  const duplicateSelection = useCallback(() => {
    duplicateElements(selectedElementIds)
  }, [duplicateElements, selectedElementIds])

  const deleteSelection = useCallback(() => {
    deleteElements(selectedElementIds)
    clearSelection()
  }, [deleteElements, selectedElementIds, clearSelection])

  const contextMenuActions = useMemo((): LayerContextMenuActions | null => {
    if (!contextMenu || !contextTarget) return null
    const { elementIds } = contextMenu

    return {
      duplicate: () => duplicateElements(elementIds),
      delete: () => {
        deleteElements(elementIds)
        clearSelection()
      },
      bringForward: () => {
        for (const id of elementIds) bringForward(id)
      },
      sendBackward: () => {
        for (const id of elementIds) sendBackward(id)
      },
      toggleVisible: () => {
        const nextVisible = !contextTarget.allVisible
        for (const id of elementIds) updateElement(id, { visible: nextVisible })
      },
      toggleLocked: () => {
        const nextLocked = !contextTarget.allLocked
        for (const id of elementIds) updateElement(id, { locked: nextLocked })
      },
    }
  }, [
    contextMenu,
    contextTarget,
    duplicateElements,
    deleteElements,
    clearSelection,
    bringForward,
    sendBackward,
    updateElement,
  ])

  const toggleLayerVisible = useCallback(
    (element: Element) => updateElement(element.id, { visible: !element.visible }),
    [updateElement],
  )

  const toggleLayerLocked = useCallback(
    (element: Element) => updateElement(element.id, { locked: !element.locked }),
    [updateElement],
  )

  return {
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
  }
}
