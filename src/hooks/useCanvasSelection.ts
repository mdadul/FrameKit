import { useCallback, useEffect, useMemo, useRef, type RefObject } from 'react'
import type Konva from 'konva'
import { getDevice } from '@/lib/assets/devices'
import { rectsIntersect } from '@/lib/canvas/helpers'
import { useEditorStore } from '@/stores/editor-store'
import type { InteractionOverlayHandle } from '@/components/canvas/InteractionOverlay'
import type { Screen } from '@/lib/types'

interface UseCanvasSelectionOptions {
  screens: Screen[]
  stageRef: RefObject<Konva.Stage | null>
  transformerRef: RefObject<Konva.Transformer | null>
  overlayRef: RefObject<InteractionOverlayHandle | null>
  scheduleDraw: () => void
}

export function useCanvasSelection({
  screens,
  stageRef,
  transformerRef,
  overlayRef,
  scheduleDraw,
}: UseCanvasSelectionOptions) {
  const marqueeStartRef = useRef<{
    screenId: string
    x: number
    y: number
    additive: boolean
  } | null>(null)

  const activeScreenId = useEditorStore((state) => state.activeScreenId)
  const selectedElementIds = useEditorStore((state) => state.selectedElementIds)
  const setSelectedElementIds = useEditorStore((state) => state.setSelectedElementIds)
  const setActiveScreenId = useEditorStore((state) => state.setActiveScreenId)
  const clearSelection = useEditorStore((state) => state.clearSelection)
  const workspaceZoom = useEditorStore((state) => state.workspaceZoom)
  const isPanning = useEditorStore((state) => state.isPanning)
  const isSpacePressed = useEditorStore((state) => state.isSpacePressed)

  const activeScreen = screens.find((screen) => screen.id === activeScreenId)

  const setActiveScreen = useCallback(
    (screenId: string, options?: { clearSelection?: boolean }) => {
      const { activeScreenId: current } = useEditorStore.getState()
      if (current !== screenId) {
        setActiveScreenId(screenId)
      }
      if (options?.clearSelection) clearSelection()
    },
    [setActiveScreenId, clearSelection],
  )

  const handleSelect = useCallback(
    (screenId: string, id: string, additive: boolean) => {
      setActiveScreenId(screenId)
      if (additive) {
        const current = useEditorStore.getState().selectedElementIds
        if (current.includes(id)) {
          setSelectedElementIds(current.filter((item) => item !== id))
        } else {
          setSelectedElementIds([...current, id])
        }
        return
      }
      setSelectedElementIds([id])
    },
    [setActiveScreenId, setSelectedElementIds],
  )

  useEffect(() => {
    const transformer = transformerRef.current
    const stage = stageRef.current
    if (!transformer || !stage || !activeScreenId) return
    const screen = screens.find((item) => item.id === activeScreenId)
    if (!screen) return
    const lockedIds = new Set(screen.elements.filter((item) => item.locked).map((item) => item.id))
    const screenElementIds = new Set(screen.elements.map((item) => item.id))
    const nodes = selectedElementIds
      .filter((id) => screenElementIds.has(id))
      .filter((id) => !lockedIds.has(id))
      .map((id) => stage.findOne(`#${id}`))
      .filter((node): node is Konva.Node => Boolean(node))
    transformer.nodes(nodes)
    transformer.forceUpdate()
    scheduleDraw()
  }, [selectedElementIds, screens, activeScreenId, stageRef, transformerRef, scheduleDraw])

  useEffect(() => {
    const transformer = transformerRef.current
    if (!transformer) return
    transformer.forceUpdate()
    scheduleDraw()
  }, [workspaceZoom, transformerRef, scheduleDraw])

  const selectedDeviceAspect = useMemo(() => {
    if (!activeScreen || selectedElementIds.length !== 1) return null
    const selected = activeScreen.elements.find((item) => item.id === selectedElementIds[0])
    if (!selected || selected.type !== 'device' || selected.locked) return null
    const device = getDevice(selected.deviceId)
    if (!device || !device.frameHeight) return null
    return device.frameWidth / device.frameHeight
  }, [activeScreen, selectedElementIds])

  const handleArtboardMouseDown = useCallback(
    (screenId: string, additive: boolean) => {
      if (isSpacePressed || isPanning) return
      if (!additive) {
        setActiveScreen(screenId, { clearSelection: true })
      } else {
        setActiveScreenId(screenId)
      }
      const stage = stageRef.current
      const group = stage?.findOne(`#screen-${screenId}`)
      const pos = group?.getRelativePointerPosition()
      if (!pos) return
      marqueeStartRef.current = {
        screenId,
        x: pos.x,
        y: pos.y,
        additive,
      }
      overlayRef.current?.setMarquee({ x: pos.x, y: pos.y, width: 0, height: 0 })
    },
    [isSpacePressed, isPanning, setActiveScreen, setActiveScreenId, stageRef, overlayRef],
  )

  const handleStageMouseMove = useCallback(() => {
    const start = marqueeStartRef.current
    if (!start) return
    const stage = stageRef.current
    const group = stage?.findOne(`#screen-${start.screenId}`)
    const pos = group?.getRelativePointerPosition()
    if (!pos) return
    overlayRef.current?.setMarquee({
      x: Math.min(start.x, pos.x),
      y: Math.min(start.y, pos.y),
      width: Math.abs(pos.x - start.x),
      height: Math.abs(pos.y - start.y),
    })
  }, [stageRef, overlayRef])

  const handleStageMouseUp = useCallback(() => {
    const start = marqueeStartRef.current
    if (!start) return
    const rect = overlayRef.current?.getMarquee()
    marqueeStartRef.current = null
    overlayRef.current?.clear()

    const screen = screens.find((item) => item.id === start.screenId)
    if (!screen || !rect) return

    if (rect.width < 3 && rect.height < 3) {
      if (!start.additive) {
        clearSelection()
      }
      return
    }

    const hits = screen.elements
      .filter((item) => item.visible && rectsIntersect(item, rect))
      .map((item) => item.id)

    if (start.additive) {
      const current = useEditorStore.getState().selectedElementIds
      setSelectedElementIds(Array.from(new Set([...current, ...hits])))
    } else {
      setSelectedElementIds(hits)
    }
  }, [screens, clearSelection, setSelectedElementIds, overlayRef])

  const handleStageMouseDown = useCallback(
    (event: Konva.KonvaEventObject<MouseEvent>) => {
      if (event.target !== event.target.getStage()) return
      if (isSpacePressed || isPanning) return
      clearSelection()
    },
    [isSpacePressed, isPanning, clearSelection],
  )

  return {
    activeScreen,
    activeScreenId,
    selectedElementIds,
    selectedDeviceAspect,
    setActiveScreen,
    setActiveScreenId,
    handleSelect,
    handleArtboardMouseDown,
    handleStageMouseMove,
    handleStageMouseUp,
    handleStageMouseDown,
  }
}
