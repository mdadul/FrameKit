import { useEffect, useRef, useState } from 'react'
import { Group, Layer, Rect, Stage, Transformer } from 'react-konva'
import type Konva from 'konva'
import { Maximize2, Minus, Plus, Target } from 'lucide-react'
import { ToolbarTooltipButton } from '@/components/ui/ToolbarTooltipButton'
import { ScreenArtboard } from '@/components/canvas/ScreenArtboard'
import { CulledScreenPlaceholder } from '@/components/canvas/CulledScreenPlaceholder'
import { InteractionOverlay, type InteractionOverlayHandle } from '@/components/canvas/InteractionOverlay'
import { CanvasPerfOverlay } from '@/components/canvas/CanvasPerfOverlay'
import { CanvasTextEditOverlay } from '@/components/canvas/CanvasTextEditOverlay'
import { ScreenContextMenu } from '@/components/canvas/ScreenContextMenu'
import { AddScreenFrame } from '@/components/canvas/AddScreenFrame'
import { MAX_ELEMENTS_SOFT, MAX_SCREENS } from '@/lib/constants'
import {
  getAddChipPosition,
  getAddFrameSize,
} from '@/lib/canvas/workspace-layout'
import {
  applySnapping,
  computeSnap,
} from '@/lib/canvas/helpers'
import {
  getAbsoluteNodePosition,
  setAbsoluteNodePosition,
} from '@/lib/canvas/coordinates'
import { rectsIntersectViewport } from '@/lib/canvas/perf/viewport'
import { useBatchDraw } from '@/lib/canvas/perf/batch-draw'
import { applyKonvaPixelRatio } from '@/lib/canvas/perf/konva-config'
import { exportActiveScreenBlobFromStage } from '@/lib/canvas/konva-export'
import {
  SELECTION_BLUE,
  SELECTION_HANDLE_FILL,
  TRANSFORMER_ANCHOR_CORNER_RADIUS,
  TRANSFORMER_ANCHOR_SIZE,
  TRANSFORMER_ANCHOR_STROKE_WIDTH,
  TRANSFORMER_BORDER_WIDTH,
  TRANSFORMER_ROTATE_OFFSET,
} from '@/lib/canvas/selection-style'
import { useCanvasViewport } from '@/hooks/useCanvasViewport'
import { useCanvasSelection } from '@/hooks/useCanvasSelection'
import { useCanvasDrop } from '@/hooks/useCanvasDrop'
import { useCanvasTextEdit } from '@/hooks/useCanvasTextEdit'
import { useScreenContextMenu } from '@/hooks/useScreenContextMenu'
import { cn } from '@/lib/utils'
import { useEditorStore } from '@/stores/editor-store'
import { useProjectStore } from '@/stores/project-store'
import { useSettingsStore } from '@/stores/settings-store'
import type { Element, Screen } from '@/lib/types'

interface CanvasWorkspaceProps {
  screens: Screen[]
  assetResolver: (assetId?: string) => string | undefined
}

export function CanvasWorkspace({ screens, assetResolver }: CanvasWorkspaceProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<Konva.Stage>(null)
  const contentLayerRef = useRef<Konva.Layer>(null)
  const transformerRef = useRef<Konva.Transformer>(null)
  const overlayRef = useRef<InteractionOverlayHandle>(null)

  const [hoveredScreenId, setHoveredScreenId] = useState<string | null>(null)

  const screenLayout = useEditorStore((state) => state.screenLayout)
  const syncScreenLayout = useEditorStore((state) => state.syncScreenLayout)
  const setIsSpacePressed = useEditorStore((state) => state.setIsSpacePressed)
  const setIsPanning = useEditorStore((state) => state.setIsPanning)
  const requestFit = useEditorStore((state) => state.requestFit)

  const scheduleDraw = useBatchDraw(stageRef)

  const {
    containerSize,
    containerRect,
    viewport,
    workspaceZoom,
    panX,
    panY,
    isPanning,
    isSpacePressed,
    zoomBy,
    clientToWorkspace,
    handleWheel,
    handlePanMouseDown,
    handlePanMouseMove,
    endPan,
  } = useCanvasViewport({ containerRef, screens })

  const {
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
  } = useCanvasSelection({
    screens,
    stageRef,
    transformerRef,
    overlayRef,
    scheduleDraw,
  })

  const elementCount = useProjectStore(
    (state) => state.project?.screens.reduce((sum, screen) => sum + screen.elements.length, 0) ?? 0,
  )
  const updateElement = useProjectStore((state) => state.updateElement)
  const addScreen = useProjectStore((state) => state.addScreen)
  const duplicateScreen = useProjectStore((state) => state.duplicateScreen)
  const deleteScreen = useProjectStore((state) => state.deleteScreen)
  const project = useProjectStore((state) => state.project)

  const { handleDrop, handleDragOver } = useCanvasDrop({ screens, clientToWorkspace })

  const {
    editingTextId,
    editingElement,
    editValue,
    setEditValue,
    editTextareaRef,
    beginTextEdit,
    commitTextEdit,
    cancelTextEdit,
  } = useCanvasTextEdit({
    screens,
    activeScreen,
    setActiveScreenId,
    updateElement,
  })

  const {
    screenContextMenu,
    contextMenuScreen,
    atScreenLimit,
    handleScreenContextMenu,
    dismissScreenContextMenu,
    handleDuplicateScreen,
    handleDeleteScreen,
  } = useScreenContextMenu({
    screens,
    screenLayout,
    project,
    clientToWorkspace,
    setActiveScreen,
    duplicateScreen,
    deleteScreen,
  })

  const showGrid = useSettingsStore((state) => state.preferences.workspace.showGrid)
  const gridSize = useSettingsStore((state) => state.preferences.workspace.gridSize)
  const showSmartGuides = useSettingsStore((state) => state.preferences.workspace.showSmartGuides)
  const showRulers = useSettingsStore((state) => state.preferences.workspace.showRulers)
  const snapSensitivity = useSettingsStore((state) => state.preferences.workspace.snapSensitivity)
  const canvasCheckerboard = useSettingsStore((state) => state.preferences.workspace.canvasCheckerboard)
  const highDpiCanvas = useSettingsStore((state) => state.preferences.workspace.highDpiCanvas)

  const setKonvaStageBridge = useEditorStore((state) => state.setKonvaStageBridge)

  useEffect(() => {
    applyKonvaPixelRatio(highDpiCanvas)
    const stage = stageRef.current
    if (!stage) return
    stage.width(stage.width())
    stage.height(stage.height())
    stage.draw()
  }, [highDpiCanvas])

  useEffect(() => {
    syncScreenLayout(screens)
  }, [screens, syncScreenLayout])

  useEffect(() => {
    if (!activeScreenId) return
    const pos = screenLayout[activeScreenId]
    if (pos) overlayRef.current?.setScreenOffset(pos.x, pos.y)
  }, [activeScreenId, screenLayout])

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) {
      setKonvaStageBridge(null)
      return
    }

    setKonvaStageBridge({
      activeScreenId,
      exportActiveScreen: async (screenId, options) => {
        const currentStage = stageRef.current
        if (!currentStage || screenId !== activeScreenId) return null
        return exportActiveScreenBlobFromStage(
          { stage: currentStage, screenId, isActiveOnCanvas: true },
          options,
        )
      },
    })

    return () => setKonvaStageBridge(null)
  }, [activeScreenId, setKonvaStageBridge])

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
    overlayRef.current?.clear()
    updateElement(id, next)
  }

  const handleDragMove = (screenId: string, id: string, node: Konva.Node) => {
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
  }

  const handleAddScreen = () => {
    if ((project?.screens.length ?? 0) >= MAX_SCREENS) return
    addScreen()
    const latest = useProjectStore.getState().project?.screens.at(-1)
    if (!latest) return
    useEditorStore.getState().focusScreen(latest.id, true)
  }

  const editingPos =
    editingElement && activeScreenId ? screenLayout[activeScreenId] : undefined

  const addFramePos = getAddChipPosition(screens, screenLayout)
  const addFrameSize = getAddFrameSize(screens)

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
      onWheel={handleWheel}
      onMouseDown={(event) => {
        if (event.button !== 1 && !isSpacePressed) {
          const target = event.target as HTMLElement
          if (!target.closest('[data-screen-context-menu]')) {
            dismissScreenContextMenu()
          }
        }
        handlePanMouseDown(event)
      }}
      onMouseMove={handlePanMouseMove}
      onMouseUp={endPan}
      onMouseLeave={endPan}
      onDragOver={handleDragOver}
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
      <CanvasPerfOverlay
        elementCount={elementCount}
        screenCount={screens.length}
        zoom={workspaceZoom}
      />
      <Stage
        ref={stageRef}
        width={containerSize.width}
        height={containerSize.height}
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
        <Layer ref={contentLayerRef} name="content">
          <Group scaleX={workspaceZoom} scaleY={workspaceZoom} name="workspace-content">
            {screens.map((screen) => {
              const pos = screenLayout[screen.id]
              if (!pos) return null
              const isActive = screen.id === activeScreenId
              const inViewport = rectsIntersectViewport(
                { x: pos.x, y: pos.y, width: screen.width, height: screen.height },
                viewport,
              )

              return (
                <Group
                  key={screen.id}
                  id={`screen-${screen.id}`}
                  x={pos.x}
                  y={pos.y}
                  onMouseEnter={() => setHoveredScreenId(screen.id)}
                  onMouseLeave={() =>
                    setHoveredScreenId((current) => (current === screen.id ? null : current))
                  }
                >
                  {!inViewport ? (
                    <>
                      <CulledScreenPlaceholder
                        width={screen.width}
                        height={screen.height}
                        screenName={screen.name}
                      />
                      <Group
                        onMouseDown={() => setActiveScreenId(screen.id)}
                        listening
                      >
                        <Rect
                          width={screen.width}
                          height={screen.height}
                          fill="transparent"
                        />
                      </Group>
                    </>
                  ) : (
                    <Group opacity={isActive ? 1 : 0.97}>
                      <ScreenArtboard
                        screenId={screen.id}
                        screenName={screen.name}
                        width={screen.width}
                        height={screen.height}
                        background={screen.background}
                        elements={screen.elements}
                        assetResolver={assetResolver}
                        isActive={isActive}
                        isHovered={hoveredScreenId === screen.id}
                        workspaceZoom={workspaceZoom}
                        selectedElementIds={selectedElementIds}
                        editingTextId={editingTextId}
                        showGrid={showGrid && isActive}
                        gridSize={gridSize}
                        onSelect={(id, additive) => handleSelect(screen.id, id, additive)}
                        onChange={(id, patch) => handleElementChange(screen.id, id, patch)}
                        onDragMove={(id, node) => handleDragMove(screen.id, id, node)}
                        onStartTextEdit={(id) => beginTextEdit(screen.id, id)}
                        onArtboardBackgroundClick={(additive) =>
                          handleArtboardMouseDown(screen.id, additive)
                        }
                      />
                    </Group>
                  )}
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
          </Group>
          <Transformer
            ref={transformerRef}
            rotateEnabled={!selectedDeviceAspect}
            keepRatio={false}
            borderStroke={SELECTION_BLUE}
            borderStrokeWidth={TRANSFORMER_BORDER_WIDTH}
            anchorFill={SELECTION_HANDLE_FILL}
            anchorStroke={SELECTION_BLUE}
            anchorStrokeWidth={TRANSFORMER_ANCHOR_STROKE_WIDTH}
            anchorSize={TRANSFORMER_ANCHOR_SIZE}
            anchorCornerRadius={TRANSFORMER_ANCHOR_CORNER_RADIUS}
            rotateAnchorOffset={TRANSFORMER_ROTATE_OFFSET}
            padding={0}
            anchorStyleFunc={(anchor) => {
              anchor.hitStrokeWidth(14)
            }}
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
        <Layer name="ui">
          <Group scaleX={workspaceZoom} scaleY={workspaceZoom} name="workspace-ui">
            <InteractionOverlay ref={overlayRef} workspaceZoom={workspaceZoom} />
          </Group>
        </Layer>
      </Stage>

      {editingElement && editingPos && containerRect && (
        <CanvasTextEditOverlay
          ref={editTextareaRef}
          element={editingElement}
          screenOffset={editingPos}
          containerRect={containerRect}
          panX={panX}
          panY={panY}
          workspaceZoom={workspaceZoom}
          value={editValue}
          onChange={setEditValue}
          onCommit={commitTextEdit}
          onCancel={cancelTextEdit}
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
          onClose={dismissScreenContextMenu}
        />
      )}
    </div>
  )
}
