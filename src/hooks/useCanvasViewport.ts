import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { MIN_ZOOM, MAX_ZOOM } from '@/lib/constants'
import { getWorkspaceBounds } from '@/lib/canvas/workspace-layout'
import { getWorkspaceViewport } from '@/lib/canvas/perf/viewport'
import { clamp } from '@/lib/utils'
import { useEditorStore } from '@/stores/editor-store'
import type { Screen } from '@/lib/types'

interface UseCanvasViewportOptions {
  containerRef: RefObject<HTMLDivElement | null>
  screens: Screen[]
}

export function useCanvasViewport({ containerRef, screens }: UseCanvasViewportOptions) {
  const panStartRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null)
  const didInitialFitRef = useRef(false)

  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
  const [containerRect, setContainerRect] = useState<DOMRect | null>(null)

  const activeScreenId = useEditorStore((state) => state.activeScreenId)
  const workspaceZoom = useEditorStore((state) => state.workspaceZoom)
  const setWorkspaceZoom = useEditorStore((state) => state.setWorkspaceZoom)
  const panX = useEditorStore((state) => state.panX)
  const panY = useEditorStore((state) => state.panY)
  const setPan = useEditorStore((state) => state.setPan)
  const screenLayout = useEditorStore((state) => state.screenLayout)
  const isPanning = useEditorStore((state) => state.isPanning)
  const isSpacePressed = useEditorStore((state) => state.isSpacePressed)
  const setIsPanning = useEditorStore((state) => state.setIsPanning)
  const fitRequest = useEditorStore((state) => state.fitRequest)

  const viewport = useMemo(
    () =>
      getWorkspaceViewport(
        containerSize.width,
        containerSize.height,
        panX,
        panY,
        workspaceZoom,
      ),
    [containerSize.width, containerSize.height, panX, panY, workspaceZoom],
  )

  useEffect(() => {
    const element = containerRef.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => {
      setContainerSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      })
      setContainerRect(element.getBoundingClientRect())
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [containerRef])

  useEffect(() => {
    const updateRect = () => {
      if (containerRef.current) setContainerRect(containerRef.current.getBoundingClientRect())
    }
    updateRect()
    window.addEventListener('scroll', updateRect, true)
    return () => window.removeEventListener('scroll', updateRect, true)
  }, [containerRef, panX, panY, workspaceZoom, containerSize])

  const fitAll = useCallback(() => {
    if (containerSize.width < 2 || containerSize.height < 2) return
    const bounds = getWorkspaceBounds(screens, screenLayout, true)
    const padding = 64
    const scale = Math.min(
      (containerSize.width - padding) / bounds.width,
      (containerSize.height - padding) / bounds.height,
    )
    const z = clamp(scale, MIN_ZOOM, 1)
    setWorkspaceZoom(z)
    setPan(
      (containerSize.width - bounds.width * z) / 2 - bounds.minX * z,
      (containerSize.height - bounds.height * z) / 2 - bounds.minY * z,
    )
  }, [containerSize, screens, screenLayout, setPan, setWorkspaceZoom])

  const fitActive = useCallback(() => {
    if (!activeScreenId || containerSize.width < 2) return
    const screen = screens.find((item) => item.id === activeScreenId)
    const pos = screenLayout[activeScreenId]
    if (!screen || !pos) return
    const padding = 80
    const scale = Math.min(
      (containerSize.width - padding) / screen.width,
      (containerSize.height - padding) / screen.height,
    )
    const z = clamp(scale, MIN_ZOOM, MAX_ZOOM)
    setWorkspaceZoom(z)
    setPan(
      (containerSize.width - screen.width * z) / 2 - pos.x * z,
      (containerSize.height - screen.height * z) / 2 - pos.y * z,
    )
  }, [activeScreenId, containerSize, screens, screenLayout, setPan, setWorkspaceZoom])

  useEffect(() => {
    if (containerSize.width < 2 || didInitialFitRef.current) return
    fitAll()
    didInitialFitRef.current = true
  }, [containerSize.width, containerSize.height, fitAll])

  useEffect(() => {
    if (!fitRequest) return
    if (fitRequest === 'all') fitAll()
    else if (fitRequest === 'active') fitActive()
    useEditorStore.setState({ fitRequest: null })
  }, [fitRequest, fitAll, fitActive])

  const zoomAtPoint = useCallback(
    (clientX: number, clientY: number, nextZoom: number) => {
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return
      const px = clientX - rect.left
      const py = clientY - rect.top
      const z = clamp(nextZoom, MIN_ZOOM, MAX_ZOOM)
      const sx = (px - panX) / workspaceZoom
      const sy = (py - panY) / workspaceZoom
      setPan(px - sx * z, py - sy * z)
      setWorkspaceZoom(z)
    },
    [containerRef, panX, panY, workspaceZoom, setPan, setWorkspaceZoom],
  )

  const zoomBy = useCallback(
    (factor: number, clientX?: number, clientY?: number) => {
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return
      zoomAtPoint(
        clientX ?? rect.left + containerSize.width / 2,
        clientY ?? rect.top + containerSize.height / 2,
        workspaceZoom * factor,
      )
    },
    [containerRef, containerSize, workspaceZoom, zoomAtPoint],
  )

  const clientToWorkspace = useCallback(
    (clientX: number, clientY: number) => {
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return null
      return {
        x: (clientX - rect.left - panX) / workspaceZoom,
        y: (clientY - rect.top - panY) / workspaceZoom,
      }
    },
    [containerRef, panX, panY, workspaceZoom],
  )

  const handleWheel = useCallback(
    (event: React.WheelEvent) => {
      if (event.deltaY === 0) return
      event.preventDefault()
      zoomBy(event.deltaY > 0 ? 0.92 : 1.08, event.clientX, event.clientY)
    },
    [zoomBy],
  )

  const handlePanMouseDown = useCallback(
    (event: React.MouseEvent) => {
      if (!isSpacePressed && event.button !== 1) return
      event.preventDefault()
      setIsPanning(true)
      panStartRef.current = { x: event.clientX, y: event.clientY, panX, panY }
    },
    [isSpacePressed, panX, panY, setIsPanning],
  )

  const handlePanMouseMove = useCallback(
    (event: React.MouseEvent) => {
      const start = panStartRef.current
      if (!start) return
      setPan(start.panX + (event.clientX - start.x), start.panY + (event.clientY - start.y))
    },
    [setPan],
  )

  const endPan = useCallback(() => {
    panStartRef.current = null
    setIsPanning(false)
  }, [setIsPanning])

  return {
    containerSize,
    containerRect,
    viewport,
    workspaceZoom,
    panX,
    panY,
    isPanning,
    isSpacePressed,
    fitAll,
    fitActive,
    zoomBy,
    clientToWorkspace,
    handleWheel,
    handlePanMouseDown,
    handlePanMouseMove,
    endPan,
  }
}
