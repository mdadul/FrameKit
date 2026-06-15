import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Group, Layer, Stage, Transformer } from 'react-konva'
import type Konva from 'konva'
import { Maximize2, Minus, Plus, Target } from 'lucide-react'
import { ToolbarTooltipButton } from '@/components/ui/ToolbarTooltipButton'
import { ScreenArtboard } from '@/components/canvas/ScreenArtboard'
import { ScreenContextMenu } from '@/components/canvas/ScreenContextMenu'
import { AddScreenFrame } from '@/components/canvas/AddScreenFrame'
import { MAX_ELEMENTS_SOFT, MAX_SCREENS } from '@/lib/constants'
import {
  findScreenAtPoint,
  getAddChipPosition,
  getAddFrameSize,
  getWorkspaceBounds,
} from '@/lib/canvas/workspace-layout'
import { applySnapping, computeSnap, rectsIntersect, type SnapLine } from '@/lib/canvas/helpers'
import { getDevice } from '@/lib/assets/devices'
import { createAssetFromFile, createAssetObjectUrl } from '@/lib/assets/image-pipeline'
import { createImageElement } from '@/lib/factories'
import { saveAsset } from '@/lib/db'
import { clamp, cn } from '@/lib/utils'
import { confirm } from '@/stores/confirm-store'
import { useEditorStore } from '@/stores/editor-store'
import { useProjectStore } from '@/stores/project-store'
import { useSettingsStore } from '@/stores/settings-store'
import type { Element, Screen, TextElement } from '@/lib/types'

interface CanvasWorkspaceProps {
  screens: Screen[]
  assetResolver: (assetId?: string) => string | undefined
}

const MIN_ZOOM = 0.08
const MAX_ZOOM = 2.5

export function CanvasWorkspace({ screens, assetResolver }: CanvasWorkspaceProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<Konva.Stage>(null)
  const transformerRef = useRef<Konva.Transformer>(null)
  const editTextareaRef = useRef<HTMLTextAreaElement>(null)
  const marqueeStartRef = useRef<{
    screenId: string
    x: number
    y: number
    additive: boolean
  } | null>(null)
  const didInitialFitRef = useRef(false)
  const panStartRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null)

  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
  const [containerRect, setContainerRect] = useState<DOMRect | null>(null)
  const [guides, setGuides] = useState<SnapLine[]>([])
  const [editingTextId, setEditingTextId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [localMarquee, setLocalMarquee] = useState<{
    x: number
    y: number
    width: number
    height: number
  } | null>(null)
  const [screenContextMenu, setScreenContextMenu] = useState<{
    screenId: string
    x: number
    y: number
  } | null>(null)

  const activeScreenId = useEditorStore((state) => state.activeScreenId)
  const selectedElementIds = useEditorStore((state) => state.selectedElementIds)
  const setSelectedElementIds = useEditorStore((state) => state.setSelectedElementIds)
  const setActiveScreenId = useEditorStore((state) => state.setActiveScreenId)
  const clearSelection = useEditorStore((state) => state.clearSelection)
  const workspaceZoom = useEditorStore((state) => state.workspaceZoom)
  const setWorkspaceZoom = useEditorStore((state) => state.setWorkspaceZoom)
  const panX = useEditorStore((state) => state.panX)
  const panY = useEditorStore((state) => state.panY)
  const setPan = useEditorStore((state) => state.setPan)
  const screenLayout = useEditorStore((state) => state.screenLayout)
  const syncScreenLayout = useEditorStore((state) => state.syncScreenLayout)
  const isPanning = useEditorStore((state) => state.isPanning)
  const isSpacePressed = useEditorStore((state) => state.isSpacePressed)
  const setIsPanning = useEditorStore((state) => state.setIsPanning)
  const setIsSpacePressed = useEditorStore((state) => state.setIsSpacePressed)
  const requestFit = useEditorStore((state) => state.requestFit)

  const updateElement = useProjectStore((state) => state.updateElement)
  const addElement = useProjectStore((state) => state.addElement)
  const addScreen = useProjectStore((state) => state.addScreen)
  const duplicateScreen = useProjectStore((state) => state.duplicateScreen)
  const deleteScreen = useProjectStore((state) => state.deleteScreen)
  const registerAssetUrl = useProjectStore((state) => state.registerAssetUrl)
  const project = useProjectStore((state) => state.project)

  const showGrid = useSettingsStore((state) => state.preferences.workspace.showGrid)
  const gridSize = useSettingsStore((state) => state.preferences.workspace.gridSize)
  const showSmartGuides = useSettingsStore((state) => state.preferences.workspace.showSmartGuides)
  const showRulers = useSettingsStore((state) => state.preferences.workspace.showRulers)
  const snapSensitivity = useSettingsStore((state) => state.preferences.workspace.snapSensitivity)
  const canvasCheckerboard = useSettingsStore((state) => state.preferences.workspace.canvasCheckerboard)
  const elementCount = useProjectStore((state) => state.getElementCount())

  const activeScreen = screens.find((screen) => screen.id === activeScreenId)

  useEffect(() => {
    syncScreenLayout(screens)
  }, [screens, syncScreenLayout])

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
  }, [])

  useEffect(() => {
    const updateRect = () => {
      if (containerRef.current) setContainerRect(containerRef.current.getBoundingClientRect())
    }
    updateRect()
    window.addEventListener('scroll', updateRect, true)
    return () => window.removeEventListener('scroll', updateRect, true)
  }, [panX, panY, workspaceZoom, containerSize])

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

  const fitRequest = useEditorStore((state) => state.fitRequest)

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
    [panX, panY, workspaceZoom, setPan, setWorkspaceZoom],
  )

  const zoomBy = (factor: number, clientX?: number, clientY?: number) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    zoomAtPoint(
      clientX ?? rect.left + containerSize.width / 2,
      clientY ?? rect.top + containerSize.height / 2,
      workspaceZoom * factor,
    )
  }

  const clientToWorkspace = useCallback(
    (clientX: number, clientY: number) => {
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return null
      return {
        x: (clientX - rect.left - panX) / workspaceZoom,
        y: (clientY - rect.top - panY) / workspaceZoom,
      }
    },
    [panX, panY, workspaceZoom],
  )

  const setActiveScreen = useCallback(
    (screenId: string, options?: { clearSelection?: boolean }) => {
      const { activeScreenId: current } = useEditorStore.getState()
      if (current === screenId) return
      setActiveScreenId(screenId)
      if (options?.clearSelection) clearSelection()
    },
    [setActiveScreenId, clearSelection],
  )

  useEffect(() => {
    const transformer = transformerRef.current
    const stage = stageRef.current
    if (!transformer || !stage || !activeScreenId) return
    const screen = screens.find((item) => item.id === activeScreenId)
    if (!screen) return
    const lockedIds = new Set(screen.elements.filter((item) => item.locked).map((item) => item.id))
    const nodes = selectedElementIds
      .filter((id) => !lockedIds.has(id))
      .map((id) => stage.findOne(`#${id}`))
      .filter((node): node is Konva.Node => Boolean(node))
    transformer.nodes(nodes)
    transformer.getLayer()?.batchDraw()
  }, [selectedElementIds, screens, activeScreenId])

  const selectedDeviceAspect = useMemo(() => {
    if (!activeScreen || selectedElementIds.length !== 1) return null
    const selected = activeScreen.elements.find((item) => item.id === selectedElementIds[0])
    if (!selected || selected.type !== 'device' || selected.locked) return null
    const device = getDevice(selected.deviceId)
    if (!device || !device.frameHeight) return null
    return device.frameWidth / device.frameHeight
  }, [activeScreen, selectedElementIds])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space' && !(event.target as HTMLElement).matches('input, textarea')) {
        setIsSpacePressed(true)
      }
    }
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        setIsSpacePressed(false)
        setIsPanning(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [setIsPanning, setIsSpacePressed])

  const handleSelect = (screenId: string, id: string, additive: boolean) => {
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
  }

  const handleElementChange = (screenId: string, id: string, patch: Partial<Element>) => {
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
    setGuides([])
    updateElement(id, next)
  }

  const handleDragMove = (screenId: string, id: string, node: Konva.Node) => {
    setActiveScreenId(screenId)
    if (!showSmartGuides) return
    const screen = screens.find((item) => item.id === screenId)
    const element = screen?.elements.find((item) => item.id === id)
    if (!screen || !element) return
    const moving = { ...element, x: node.x(), y: node.y() } as Element
    const others = screen.elements.filter((item) => item.id !== id)
    const { x, y, lines } = computeSnap(
      moving,
      others,
      screen.width,
      screen.height,
      snapSensitivity,
    )
    node.x(x)
    node.y(y)
    setGuides(lines)
  }

  const beginTextEdit = (screenId: string, id: string) => {
    setActiveScreenId(screenId)
    const screen = screens.find((item) => item.id === screenId)
    const element = screen?.elements.find((item) => item.id === id)
    if (!element || element.type !== 'text') return
    setEditValue(element.text)
    setEditingTextId(id)
  }

  const commitTextEdit = () => {
    if (!editingTextId) return
    updateElement(editingTextId, { text: editValue })
    setEditingTextId(null)
  }

  useEffect(() => {
    if (!editingTextId) return
    editTextareaRef.current?.focus()
    editTextareaRef.current?.select()
  }, [editingTextId])

  const handleArtboardMouseDown = (screenId: string, additive: boolean) => {
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
    setLocalMarquee({ x: pos.x, y: pos.y, width: 0, height: 0 })
  }

  const handleStageMouseMove = () => {
    const start = marqueeStartRef.current
    if (!start) return
    const stage = stageRef.current
    const group = stage?.findOne(`#screen-${start.screenId}`)
    const pos = group?.getRelativePointerPosition()
    if (!pos) return
    setLocalMarquee({
      x: Math.min(start.x, pos.x),
      y: Math.min(start.y, pos.y),
      width: Math.abs(pos.x - start.x),
      height: Math.abs(pos.y - start.y),
    })
  }

  const handleStageMouseUp = () => {
    const start = marqueeStartRef.current
    if (!start) return
    const rect = localMarquee
    marqueeStartRef.current = null
    setLocalMarquee(null)

    const screen = screens.find((item) => item.id === start.screenId)
    if (!screen || !rect || (rect.width < 3 && rect.height < 3)) return

    const hits = screen.elements
      .filter((item) => item.visible && rectsIntersect(item, rect))
      .map((item) => item.id)

    if (start.additive) {
      const current = useEditorStore.getState().selectedElementIds
      setSelectedElementIds(Array.from(new Set([...current, ...hits])))
    } else {
      setSelectedElementIds(hits)
    }
  }

  const handleStageMouseDown = (event: Konva.KonvaEventObject<MouseEvent>) => {
    if (event.target !== event.target.getStage()) return
    if (isSpacePressed || isPanning) return
    clearSelection()
  }

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const point = clientToWorkspace(event.clientX, event.clientY)
    if (!point || !project) return
    const targetScreen = findScreenAtPoint(point, screens, screenLayout)
    if (!targetScreen) return

    setActiveScreenId(targetScreen.id)

    const files = Array.from(event.dataTransfer.files).filter((file) =>
      file.type.startsWith('image/'),
    )
    if (files.length === 0) return

    const localPoint = {
      x: point.x - (screenLayout[targetScreen.id]?.x ?? 0),
      y: point.y - (screenLayout[targetScreen.id]?.y ?? 0),
    }

    const targetDevice = [...targetScreen.elements]
      .filter(
        (item) =>
          item.type === 'device' &&
          localPoint.x >= item.x &&
          localPoint.x <= item.x + item.width &&
          localPoint.y >= item.y &&
          localPoint.y <= item.y + item.height,
      )
      .sort((a, b) => b.zIndex - a.zIndex)[0]

    for (const file of files) {
      const asset = await createAssetFromFile(file, project.id)
      await saveAsset(asset)
      registerAssetUrl(asset.id, createAssetObjectUrl(asset))

      if (targetDevice) {
        updateElement(targetDevice.id, { screenshotAssetId: asset.id })
        break
      }

      addElement(
        createImageElement({
          assetId: asset.id,
          name: file.name,
          x: localPoint.x - 200,
          y: localPoint.y - 200,
        }),
      )
    }
  }

  const handleAddScreen = () => {
    if ((project?.screens.length ?? 0) >= MAX_SCREENS) return
    addScreen()
    const latest = useProjectStore.getState().project?.screens.at(-1)
    if (!latest) return
    useEditorStore.getState().focusScreen(latest.id, true)
  }

  const handleScreenContextMenu = (event: React.MouseEvent | MouseEvent) => {
    event.preventDefault()
    const point = clientToWorkspace(event.clientX, event.clientY)
    if (!point) return
    const screen = findScreenAtPoint(point, screens, screenLayout)
    if (!screen) {
      setScreenContextMenu(null)
      return
    }
    setActiveScreen(screen.id, { clearSelection: true })
    setScreenContextMenu({
      screenId: screen.id,
      x: event.clientX,
      y: event.clientY,
    })
  }

  const handleDuplicateScreen = (screenId: string) => {
    if ((project?.screens.length ?? 0) >= MAX_SCREENS) return
    duplicateScreen(screenId)
  }

  const handleDeleteScreen = async (screenId: string) => {
    setScreenContextMenu(null)
    const screen = screens.find((item) => item.id === screenId)
    if (!screen || screens.length <= 1) return
    const confirmed = await confirm({
      title: 'Delete screen?',
      description: `"${screen.name}" and all its elements will be removed.`,
      confirmLabel: 'Delete',
      destructive: true,
    })
    if (confirmed) deleteScreen(screenId)
  }

  const contextMenuScreen = screenContextMenu
    ? screens.find((screen) => screen.id === screenContextMenu.screenId)
    : undefined

  const editingElement =
    editingTextId && activeScreen
      ? (activeScreen.elements.find((item) => item.id === editingTextId) as TextElement | undefined)
      : undefined

  const editingPos =
    editingElement && activeScreenId
      ? screenLayout[activeScreenId]
      : undefined

  const addFramePos = getAddChipPosition(screens, screenLayout)
  const addFrameSize = getAddFrameSize(screens)
  const atScreenLimit = (project?.screens.length ?? 0) >= MAX_SCREENS

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative h-full w-full overflow-hidden',
        isPanning && 'cursor-grabbing',
        isSpacePressed && !isPanning && 'cursor-grab',
      )}
      style={{
        backgroundColor: 'var(--color-canvas-bg)',
        backgroundImage: canvasCheckerboard
          ? 'linear-gradient(45deg, #cbd5e1 25%, transparent 25%), linear-gradient(-45deg, #cbd5e1 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #cbd5e1 75%), linear-gradient(-45deg, transparent 75%, #cbd5e1 75%)'
          : undefined,
        backgroundSize: canvasCheckerboard ? '20px 20px' : undefined,
        backgroundPosition: canvasCheckerboard ? '0 0, 0 10px, 10px -10px, -10px 0px' : undefined,
      }}
      onWheel={(event) => {
        if (event.deltaY === 0) return
        event.preventDefault()
        zoomBy(event.deltaY > 0 ? 0.92 : 1.08, event.clientX, event.clientY)
      }}
      onMouseDown={(event) => {
        if (event.button !== 1 && !isSpacePressed) {
          const target = event.target as HTMLElement
          if (!target.closest('[data-screen-context-menu]')) {
            setScreenContextMenu(null)
          }
        }
        if (!isSpacePressed && event.button !== 1) return
        event.preventDefault()
        setIsPanning(true)
        panStartRef.current = { x: event.clientX, y: event.clientY, panX, panY }
      }}
      onMouseMove={(event) => {
        const start = panStartRef.current
        if (!start) return
        setPan(start.panX + (event.clientX - start.x), start.panY + (event.clientY - start.y))
      }}
      onMouseUp={() => {
        panStartRef.current = null
        setIsPanning(false)
      }}
      onMouseLeave={() => {
        panStartRef.current = null
        setIsPanning(false)
      }}
      onDragOver={(event) => {
        if (Array.from(event.dataTransfer.types).includes('Files')) {
          event.preventDefault()
          event.dataTransfer.dropEffect = 'copy'
        }
      }}
      onDrop={(event) => {
        void handleDrop(event)
      }}
      onContextMenu={handleScreenContextMenu}
    >
      {showRulers && activeScreen && (
        <div className="pointer-events-none absolute top-0 left-0 z-10 flex text-[9px] text-muted-foreground">
          <div
            className="border-b border-r border-border/60 bg-card/90"
            style={{ width: 24, height: 24 }}
          />
          <div
            className="overflow-hidden border-b border-border/60 bg-card/90 px-1"
            style={{ width: containerSize.width - 24, height: 24 }}
          >
            Ruler — {activeScreen.width}px wide
          </div>
        </div>
      )}
      {elementCount >= MAX_ELEMENTS_SOFT && (
        <div className="pointer-events-none absolute top-2 left-1/2 z-20 -translate-x-1/2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-900 dark:text-amber-100">
          {elementCount} elements — consider simplifying for best performance
        </div>
      )}
      <Stage
        ref={stageRef}
        width={containerSize.width}
        height={containerSize.height}
        scaleX={workspaceZoom}
        scaleY={workspaceZoom}
        x={panX}
        y={panY}
        onMouseDown={handleStageMouseDown}
        onMouseMove={handleStageMouseMove}
        onMouseUp={handleStageMouseUp}
        onContextMenu={(event) => {
          event.evt.preventDefault()
          handleScreenContextMenu(event.evt)
        }}
      >
        <Layer>
          {screens.map((screen) => {
            const pos = screenLayout[screen.id]
            if (!pos) return null
            const isActive = screen.id === activeScreenId
            return (
              <Group key={screen.id} id={`screen-${screen.id}`} x={pos.x} y={pos.y}>
                <ScreenArtboard
                  screenId={screen.id}
                  width={screen.width}
                  height={screen.height}
                  background={screen.background}
                  elements={screen.elements}
                  assetResolver={assetResolver}
                  isActive={isActive}
                  workspaceZoom={workspaceZoom}
                  selectedElementIds={selectedElementIds}
                  editingTextId={editingTextId}
                  guides={isActive ? guides : []}
                  marquee={isActive ? localMarquee : null}
                  showGrid={showGrid}
                  gridSize={gridSize}
                  onSelect={(id, additive) => handleSelect(screen.id, id, additive)}
                  onChange={(id, patch) => handleElementChange(screen.id, id, patch)}
                  onDragMove={(id, node) => handleDragMove(screen.id, id, node)}
                  onStartTextEdit={(id) => beginTextEdit(screen.id, id)}
                  onArtboardBackgroundClick={(additive) => handleArtboardMouseDown(screen.id, additive)}
                />
              </Group>
            )
          })}
          {!atScreenLimit && (
            <AddScreenFrame
              x={addFramePos.x}
              y={addFramePos.y}
              width={addFrameSize.width}
              height={addFrameSize.height}
              workspaceZoom={workspaceZoom}
              disabled={atScreenLimit}
              onAdd={handleAddScreen}
            />
          )}
          <Transformer
            ref={transformerRef}
            rotateEnabled={!selectedDeviceAspect}
            keepRatio={false}
            enabledAnchors={
              selectedDeviceAspect
                ? ['top-left', 'top-right', 'bottom-left', 'bottom-right']
                : [
                    'top-left',
                    'top-right',
                    'bottom-left',
                    'bottom-right',
                    'middle-left',
                    'middle-right',
                    'top-center',
                    'bottom-center',
                  ]
            }
            boundBoxFunc={(oldBox, newBox) => {
              if (newBox.width < 10 || newBox.height < 10) return oldBox
              if (selectedDeviceAspect) {
                return { ...newBox, height: newBox.width / selectedDeviceAspect }
              }
              return newBox
            }}
          />
        </Layer>
      </Stage>

      {editingElement && editingPos && containerRect && (
        <textarea
          ref={editTextareaRef}
          value={editValue}
          onChange={(event) => setEditValue(event.target.value)}
          onBlur={commitTextEdit}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              commitTextEdit()
            } else if (event.key === 'Escape') {
              event.preventDefault()
              setEditingTextId(null)
            }
          }}
          className="absolute z-20 resize-none overflow-hidden border-0 bg-transparent p-0 outline-none"
          style={{
            left:
              containerRect.left +
              panX +
              (editingPos.x + editingElement.x) * workspaceZoom,
            top:
              containerRect.top +
              panY +
              (editingPos.y + editingElement.y) * workspaceZoom,
            width: editingElement.width * workspaceZoom,
            height: editingElement.height * workspaceZoom,
            transformOrigin: 'top left',
            transform: editingElement.rotation
              ? `rotate(${editingElement.rotation}deg)`
              : undefined,
            fontFamily: editingElement.fontFamily,
            fontSize: editingElement.fontSize * workspaceZoom,
            fontWeight: editingElement.fontWeight,
            fontStyle: editingElement.fontStyle,
            lineHeight: editingElement.lineHeight,
            letterSpacing: editingElement.letterSpacing * workspaceZoom,
            color: editingElement.fill,
            textAlign:
              editingElement.textAlign === 'justify' ? 'justify' : editingElement.textAlign,
            padding: (editingElement.padding ?? 0) * workspaceZoom,
          }}
        />
      )}

      <div className="pointer-events-none absolute bottom-3 left-1/2 z-20 flex max-w-[calc(100%-1.5rem)] -translate-x-1/2 flex-col items-center gap-1 sm:bottom-4">
        <div className="pointer-events-auto flex shrink-0 items-center gap-0.5 rounded-full border border-border/80 bg-card/95 p-0.5 shadow-lg backdrop-blur-sm">
          <ToolbarTooltipButton
            icon={Minus}
            label="Zoom out"
            onClick={() => zoomBy(0.9)}
          />
          <ToolbarTooltipButton
            label="Fit all"
            ariaLabel={`Zoom level ${Math.round(workspaceZoom * 100)}%, click to fit all`}
            className="w-12 text-xs font-medium tabular-nums"
            onClick={() => requestFit('all')}
          >
            {Math.round(workspaceZoom * 100)}%
          </ToolbarTooltipButton>
          <ToolbarTooltipButton
            icon={Plus}
            label="Zoom in"
            onClick={() => zoomBy(1.1)}
          />
          <div className="mx-0.5 h-4 w-px shrink-0 bg-border/80" aria-hidden />
          <ToolbarTooltipButton
            icon={Maximize2}
            label="Fit all"
            onClick={() => requestFit('all')}
          />
          <ToolbarTooltipButton
            icon={Target}
            label="Fit active"
            onClick={() => requestFit('active')}
          />
        </div>
        <p className="hidden max-w-full truncate rounded-full bg-card/80 px-2.5 py-0.5 text-[10px] text-muted-foreground backdrop-blur-sm min-[360px]:block sm:text-[11px]">
          <span className="sm:hidden">Scroll to zoom · Space to pan</span>
          <span className="hidden sm:inline">
            Space drag to pan · Scroll to zoom · ⌘0 fit active · Alt ← → switch screens
          </span>
        </p>
      </div>

      {screenContextMenu && contextMenuScreen && (
        <ScreenContextMenu
          x={screenContextMenu.x}
          y={screenContextMenu.y}
          screenName={contextMenuScreen.name}
          canDelete={screens.length > 1}
          canDuplicate={!atScreenLimit}
          onDuplicate={() => handleDuplicateScreen(contextMenuScreen.id)}
          onDelete={() => void handleDeleteScreen(contextMenuScreen.id)}
          onClose={() => setScreenContextMenu(null)}
        />
      )}
    </div>
  )
}
