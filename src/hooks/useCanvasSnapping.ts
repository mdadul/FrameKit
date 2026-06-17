import { useCallback, type RefObject } from 'react'
import type Konva from 'konva'
import { applySnapping, computeSnap } from '@/lib/canvas/helpers'
import {
  getAbsoluteNodePosition,
  setAbsoluteNodePosition,
} from '@/lib/canvas/coordinates'
import type { InteractionOverlayHandle } from '@/components/canvas/InteractionOverlay'
import type { Element, Screen } from '@/lib/types'

interface UseCanvasSnappingOptions {
  screens: Screen[]
  showSmartGuides: boolean
  snapSensitivity: number
  updateElement: (id: string, patch: Partial<Element>) => void
  setActiveScreenId: (screenId: string) => void
  overlayRef: RefObject<InteractionOverlayHandle | null>
  scheduleDraw: () => void
}

export function useCanvasSnapping({
  screens,
  showSmartGuides,
  snapSensitivity,
  updateElement,
  setActiveScreenId,
  overlayRef,
  scheduleDraw,
}: UseCanvasSnappingOptions) {
  const handleElementChange = useCallback(
    (screenId: string, id: string, patch: Partial<Element>) => {
      setActiveScreenId(screenId)
      const screen = screens.find((item) => item.id === screenId)
      const element = screen?.elements.find((item) => item.id === id)
      if (!element || !screen) return

      let next = { ...element, ...patch } as Element
      if (showSmartGuides && ('x' in patch || 'y' in patch)) {
        next = applySnapping(
          next,
          screen.elements.filter((item) => item.id !== id),
          screen.width,
          screen.height,
          snapSensitivity,
        )
      }
      overlayRef.current?.clear()
      updateElement(id, next)
    },
    [screens, showSmartGuides, snapSensitivity, updateElement, setActiveScreenId, overlayRef],
  )

  const handleDragMove = useCallback(
    (screenId: string, id: string, node: Konva.Node) => {
      setActiveScreenId(screenId)
      if (!showSmartGuides) return
      const screen = screens.find((item) => item.id === screenId)
      const element = screen?.elements.find((item) => item.id === id)
      if (!screen || !element) return
      const absolute = getAbsoluteNodePosition(element, screen, node)
      const moving = { ...element, x: absolute.x, y: absolute.y } as Element
      const others = screen.elements.filter((item) => item.id !== id)
      const { x, y, lines } = computeSnap(
        moving,
        others,
        screen.width,
        screen.height,
        snapSensitivity,
      )
      setAbsoluteNodePosition(element, screen, node, x, y)
      overlayRef.current?.setGuides(lines, screen.width, screen.height)
      scheduleDraw()
    },
    [screens, showSmartGuides, snapSensitivity, setActiveScreenId, overlayRef, scheduleDraw],
  )

  return { handleElementChange, handleDragMove }
}
