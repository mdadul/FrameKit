import { memo, useMemo } from 'react'
import { Image as KonvaImage, Group, Rect, Text } from 'react-konva'
import useImage from 'use-image'
import type Konva from 'konva'
import { ElementNode } from '@/components/canvas/ElementNode'
import { ElementGroupNode } from '@/components/canvas/ElementGroupNode'
import { selectionStrokeWidth } from '@/lib/canvas/selection-style'
import { SELECTION_BLUE, SELECTION_BLUE_SOFT } from '@/lib/canvas/selection-style'
import { getCachedBackgroundCanvas } from '@/lib/canvas/perf/background-cache'
import { buildGridCanvas } from '@/lib/canvas/perf/grid-canvas'
import type { BackgroundConfig, Element } from '@/lib/types'

export function BackgroundRect({
  background,
  width,
  height,
  assetResolver,
}: {
  background: BackgroundConfig
  width: number
  height: number
  assetResolver: (assetId?: string) => string | undefined
}) {
  const imageUrl =
    background.type === 'image' ? assetResolver(background.imageAssetId) : undefined
  const [bgImage] = useImage(imageUrl ?? '', 'anonymous')

  const canvas = useMemo(
    () =>
      getCachedBackgroundCanvas(
        background,
        width,
        height,
        background.type === 'image' ? bgImage : undefined,
        imageUrl,
      ),
    [background, width, height, bgImage, imageUrl],
  )

  return (
    <KonvaImage
      image={canvas}
      width={width}
      height={height}
      listening={false}
      perfectDrawEnabled={false}
    />
  )
}

interface ScreenArtboardProps {
  screenId: string
  screenName: string
  width: number
  height: number
  background: BackgroundConfig
  elements: Element[]
  assetResolver: (assetId?: string) => string | undefined
  isActive: boolean
  isHovered: boolean
  workspaceZoom: number
  selectedElementIds: string[]
  editingTextId: string | null
  showGrid: boolean
  gridSize: number
  onSelect: (id: string, additive: boolean) => void
  onChange: (id: string, patch: Partial<Element>) => void
  onDragMove: (id: string, node: Konva.Node) => void
  onStartTextEdit: (id: string) => void
  onArtboardBackgroundClick: (additive: boolean) => void
}

function ScreenArtboardInner({
  screenId,
  screenName,
  width,
  height,
  background,
  elements,
  assetResolver,
  isActive,
  isHovered,
  workspaceZoom,
  selectedElementIds,
  editingTextId,
  showGrid,
  gridSize,
  onSelect,
  onChange,
  onDragMove,
  onStartTextEdit,
  onArtboardBackgroundClick,
}: ScreenArtboardProps) {
  const sortedElements = useMemo(
    () => [...elements].sort((a, b) => a.zIndex - b.zIndex),
    [elements],
  )
  const strokeScale = selectionStrokeWidth(workspaceZoom, 1)
  const activeStroke = selectionStrokeWidth(workspaceZoom, 1)
  const labelFontSize = 11 / workspaceZoom
  const labelPadX = 8 / workspaceZoom
  const labelPadY = 4 / workspaceZoom
  const labelHeight = labelFontSize + labelPadY * 2
  const labelOffset = 6 / workspaceZoom
  const labelWidth = Math.min(
    width,
    Math.max(72 / workspaceZoom, screenName.length * (labelFontSize * 0.58) + labelPadX * 2),
  )

  const gridCanvas = useMemo(
    () => (showGrid ? buildGridCanvas(width, height, gridSize) : null),
    [showGrid, width, height, gridSize],
  )

  const { ungrouped, groups } = useMemo(() => {
    const groupMap = new Map<string, Element[]>()
    const ungrouped: Element[] = []
    for (const element of sortedElements) {
      if (element.groupId) {
        const list = groupMap.get(element.groupId) ?? []
        list.push(element)
        groupMap.set(element.groupId, list)
      } else {
        ungrouped.push(element)
      }
    }
    return { ungrouped, groups: groupMap }
  }, [sortedElements])

  return (
    <Group name={`screen-artboard-${screenId}`}>
      <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill="#ffffff"
        shadowColor={isActive ? 'rgba(15,23,42,0.35)' : undefined}
        shadowBlur={isActive ? 40 : 0}
        shadowOffsetY={isActive ? 12 : 0}
        listening={false}
        perfectDrawEnabled={false}
      />
      <BackgroundRect
        background={background}
        width={width}
        height={height}
        assetResolver={assetResolver}
      />
      {gridCanvas && (
        <KonvaImage
          image={gridCanvas}
          width={width}
          height={height}
          listening={false}
          perfectDrawEnabled={false}
        />
      )}

      <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill="transparent"
        onMouseDown={(event) => {
          if (event.target !== event.currentTarget) return
          onArtboardBackgroundClick(event.evt.shiftKey)
        }}
      />

      {ungrouped.map((element) => (
        <ElementNode
          key={element.id}
          element={element}
          selected={isActive && selectedElementIds.includes(element.id)}
          assetResolver={assetResolver}
          draggable={isActive && !element.locked}
          onSelect={onSelect}
          onChange={onChange}
          onDragMove={onDragMove}
          onStartTextEdit={onStartTextEdit}
          editingTextId={editingTextId}
        />
      ))}

      {Array.from(groups.entries()).map(([groupId, groupElements]) => (
        <ElementGroupNode
          key={groupId}
          groupId={groupId}
          elements={groupElements}
          isActive={isActive}
          selectedElementIds={selectedElementIds}
          assetResolver={assetResolver}
          onSelect={onSelect}
          onChange={onChange}
          onDragMove={onDragMove}
          onStartTextEdit={onStartTextEdit}
          editingTextId={editingTextId}
        />
      ))}

      {isActive && (
        <Group listening={false}>
          <Rect
            x={0}
            y={-(labelHeight + labelOffset)}
            width={labelWidth}
            height={labelHeight}
            fill={SELECTION_BLUE}
            cornerRadius={3 / workspaceZoom}
            perfectDrawEnabled={false}
          />
          <Text
            x={labelPadX}
            y={-(labelHeight + labelOffset) + labelPadY}
            width={labelWidth - labelPadX * 2}
            text={screenName}
            fontSize={labelFontSize}
            fontFamily="Inter, system-ui, sans-serif"
            fontStyle="500"
            fill="#ffffff"
            ellipsis
            listening={false}
          />
        </Group>
      )}

      {isActive && (
        <Rect
          x={0}
          y={0}
          width={width}
          height={height}
          stroke={SELECTION_BLUE}
          strokeWidth={activeStroke}
          listening={false}
          perfectDrawEnabled={false}
        />
      )}

      {!isActive && isHovered && (
        <Rect
          x={0}
          y={0}
          width={width}
          height={height}
          stroke={SELECTION_BLUE_SOFT}
          strokeWidth={strokeScale}
          listening={false}
          perfectDrawEnabled={false}
        />
      )}
    </Group>
  )
}

function propsEqual(prev: ScreenArtboardProps, next: ScreenArtboardProps): boolean {
  if (prev.screenId !== next.screenId) return false
  if (prev.isActive !== next.isActive) return false
  if (prev.isHovered !== next.isHovered) return false
  if (prev.workspaceZoom !== next.workspaceZoom) return false
  if (prev.showGrid !== next.showGrid || prev.gridSize !== next.gridSize) return false
  if (prev.width !== next.width || prev.height !== next.height) return false
  if (prev.background !== next.background) return false
  if (prev.elements !== next.elements) return false
  if (prev.editingTextId !== next.editingTextId) return false
  if (prev.screenName !== next.screenName) return false
  if (prev.isActive && prev.selectedElementIds !== next.selectedElementIds) return false
  return true
}

export const ScreenArtboard = memo(ScreenArtboardInner, propsEqual)
