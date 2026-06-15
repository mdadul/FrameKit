import { useMemo } from 'react'
import { Image as KonvaImage, Group, Line, Rect } from 'react-konva'
import useImage from 'use-image'
import type Konva from 'konva'
import { ElementNode } from '@/components/canvas/ElementNode'
import { ElementGroupNode } from '@/components/canvas/ElementGroupNode'
import type { SnapLine } from '@/lib/canvas/helpers'
import { buildBackgroundCanvas } from '@/lib/canvas/backgrounds'
import type { BackgroundConfig, Element } from '@/lib/types'
import { BRAND_PRIMARY } from '@/lib/constants'

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
      buildBackgroundCanvas(
        background,
        width,
        height,
        background.type === 'image' ? bgImage : undefined,
        1,
      ),
    [background, width, height, bgImage],
  )

  return <KonvaImage image={canvas} width={width} height={height} listening={false} />
}

interface ScreenArtboardProps {
  screenId: string
  width: number
  height: number
  background: BackgroundConfig
  elements: Element[]
  assetResolver: (assetId?: string) => string | undefined
  isActive: boolean
  workspaceZoom: number
  selectedElementIds: string[]
  editingTextId: string | null
  guides: SnapLine[]
  marquee: { x: number; y: number; width: number; height: number } | null
  showGrid: boolean
  gridSize: number
  onSelect: (id: string, additive: boolean) => void
  onChange: (id: string, patch: Partial<Element>) => void
  onDragMove: (id: string, node: Konva.Node) => void
  onStartTextEdit: (id: string) => void
  onArtboardBackgroundClick: (additive: boolean) => void
}

export function ScreenArtboard({
  screenId,
  width,
  height,
  background,
  elements,
  assetResolver,
  isActive,
  workspaceZoom,
  selectedElementIds,
  editingTextId,
  guides,
  marquee,
  showGrid,
  gridSize,
  onSelect,
  onChange,
  onDragMove,
  onStartTextEdit,
  onArtboardBackgroundClick,
}: ScreenArtboardProps) {
  const sortedElements = [...elements].sort((a, b) => a.zIndex - b.zIndex)
  const strokeScale = 1 / workspaceZoom

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
    <Group name={`screen-${screenId}`}>
      <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill="#ffffff"
        shadowColor="rgba(15,23,42,0.35)"
        shadowBlur={40}
        shadowOffsetY={12}
        listening={false}
      />
      <BackgroundRect
        background={background}
        width={width}
        height={height}
        assetResolver={assetResolver}
      />
      {showGrid &&
        Array.from({ length: Math.ceil(width / gridSize) }).map((_, index) => (
          <Line
            key={`v-${index}`}
            points={[index * gridSize, 0, index * gridSize, height]}
            stroke="rgba(148,163,184,0.35)"
            strokeWidth={1}
            listening={false}
          />
        ))}
      {showGrid &&
        Array.from({ length: Math.ceil(height / gridSize) }).map((_, index) => (
          <Line
            key={`h-${index}`}
            points={[0, index * gridSize, width, index * gridSize]}
            stroke="rgba(148,163,184,0.35)"
            strokeWidth={1}
            listening={false}
          />
        ))}

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
        <Rect
          x={-2 * strokeScale}
          y={-2 * strokeScale}
          width={width + 4 * strokeScale}
          height={height + 4 * strokeScale}
          stroke={BRAND_PRIMARY}
          strokeWidth={2 * strokeScale}
          listening={false}
        />
      )}

      {isActive &&
        guides.map((guide, index) =>
          guide.orientation === 'vertical' ? (
            <Line
              key={`g-v-${index}`}
              points={[guide.position, 0, guide.position, height]}
              stroke="#ec4899"
              strokeWidth={strokeScale}
              listening={false}
            />
          ) : (
            <Line
              key={`g-h-${index}`}
              points={[0, guide.position, width, guide.position]}
              stroke="#ec4899"
              strokeWidth={strokeScale}
              listening={false}
            />
          ),
        )}

      {isActive && marquee && (marquee.width > 0 || marquee.height > 0) && (
        <Rect
          x={marquee.x}
          y={marquee.y}
          width={marquee.width}
          height={marquee.height}
          fill="rgba(59,130,246,0.12)"
          stroke="#3b82f6"
          strokeWidth={strokeScale}
          dash={[6 * strokeScale, 4 * strokeScale]}
          listening={false}
        />
      )}
    </Group>
  )
}
