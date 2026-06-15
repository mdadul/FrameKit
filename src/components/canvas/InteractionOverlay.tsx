import { forwardRef, useImperativeHandle, useRef } from 'react'
import { Group, Line, Rect } from 'react-konva'
import type Konva from 'konva'
import type { SnapLine } from '@/lib/canvas/helpers'
import {
  SELECTION_BLUE,
  SELECTION_FILL,
  selectionStrokeWidth,
} from '@/lib/canvas/selection-style'

const MAX_GUIDE_LINES = 24

export interface MarqueeRect {
  x: number
  y: number
  width: number
  height: number
}

export interface InteractionOverlayHandle {
  setScreenOffset: (x: number, y: number) => void
  setGuides: (guides: SnapLine[], screenWidth: number, screenHeight: number) => void
  setMarquee: (rect: MarqueeRect | null) => void
  getMarquee: () => MarqueeRect | null
  clear: () => void
}

interface InteractionOverlayProps {
  workspaceZoom: number
}

export const InteractionOverlay = forwardRef<InteractionOverlayHandle, InteractionOverlayProps>(
  function InteractionOverlay({ workspaceZoom }, ref) {
    const groupRef = useRef<Konva.Group>(null)
    const guideRefs = useRef<Array<Konva.Line | null>>([])
    const marqueeRef = useRef<Konva.Rect>(null)
    const marqueeStateRef = useRef<MarqueeRect | null>(null)
    const strokeScale = selectionStrokeWidth(workspaceZoom, 1)

    useImperativeHandle(ref, () => ({
      setScreenOffset(x, y) {
        groupRef.current?.position({ x, y })
      },
      setGuides(guides, screenWidth, screenHeight) {
        for (let index = 0; index < MAX_GUIDE_LINES; index++) {
          const line = guideRefs.current[index]
          if (!line) continue
          const guide = guides[index]
          if (!guide) {
            line.visible(false)
            continue
          }
          line.visible(true)
          line.strokeWidth(strokeScale)
          if (guide.orientation === 'vertical') {
            line.points([guide.position, 0, guide.position, screenHeight])
          } else {
            line.points([0, guide.position, screenWidth, guide.position])
          }
        }
        groupRef.current?.getLayer()?.batchDraw()
      },
      setMarquee(rect) {
        marqueeStateRef.current = rect
        const node = marqueeRef.current
        if (!node) return
        if (!rect || (rect.width <= 0 && rect.height <= 0)) {
          node.visible(false)
          groupRef.current?.getLayer()?.batchDraw()
          return
        }
        node.visible(true)
        node.x(rect.x)
        node.y(rect.y)
        node.width(rect.width)
        node.height(rect.height)
        node.strokeWidth(strokeScale)
        node.dash([6 / workspaceZoom, 4 / workspaceZoom])
        groupRef.current?.getLayer()?.batchDraw()
      },
      getMarquee() {
        return marqueeStateRef.current
      },
      clear() {
        marqueeStateRef.current = null
        marqueeRef.current?.visible(false)
        for (const line of guideRefs.current) {
          line?.visible(false)
        }
        groupRef.current?.getLayer()?.batchDraw()
      },
    }))

    return (
      <Group ref={groupRef} listening={false} name="interaction-overlay">
        {Array.from({ length: MAX_GUIDE_LINES }).map((_, index) => (
          <Line
            key={`guide-${index}`}
            ref={(node) => {
              guideRefs.current[index] = node
            }}
            stroke={SELECTION_BLUE}
            strokeWidth={strokeScale}
            visible={false}
            listening={false}
            perfectDrawEnabled={false}
          />
        ))}
        <Rect
          ref={marqueeRef}
          fill={SELECTION_FILL}
          stroke={SELECTION_BLUE}
          visible={false}
          listening={false}
          perfectDrawEnabled={false}
        />
      </Group>
    )
  },
)
