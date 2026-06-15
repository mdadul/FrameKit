import { useState } from 'react'
import { Group, Line, Rect, Text } from 'react-konva'
import type { KonvaEventObject } from 'konva/lib/Node'
import { BRAND_PRIMARY } from '@/lib/constants'

interface AddScreenFrameProps {
  x: number
  y: number
  width: number
  height: number
  workspaceZoom: number
  disabled: boolean
  onAdd: () => void
}

export function AddScreenFrame({
  x,
  y,
  width,
  height,
  workspaceZoom,
  disabled,
  onAdd,
}: AddScreenFrameProps) {
  const [hovered, setHovered] = useState(false)
  const strokeScale = 1 / workspaceZoom
  const inset = Math.max(16, width * 0.02)
  const centerX = width / 2
  const centerY = height / 2 - height * 0.02
  const plusArm = Math.min(width, height) * 0.035
  const isHot = hovered && !disabled

  const handlePointer = (event: KonvaEventObject<MouseEvent | TouchEvent>) => {
    event.cancelBubble = true
    if (disabled) return
    onAdd()
  }

  return (
    <Group
      x={x}
      y={y}
      opacity={disabled ? 0.45 : 1}
      onClick={handlePointer}
      onTap={handlePointer}
      onMouseEnter={() => {
        if (disabled) return
        setHovered(true)
        document.body.style.cursor = 'pointer'
      }}
      onMouseLeave={() => {
        setHovered(false)
        document.body.style.cursor = ''
      }}
    >
      <Rect
        width={width}
        height={height}
        fill="#ffffff"
        shadowColor="rgba(15,23,42,0.35)"
        shadowBlur={40}
        shadowOffsetY={12}
      />
      <Rect
        x={inset}
        y={inset}
        width={width - inset * 2}
        height={height - inset * 2}
        fill={isHot ? 'rgba(99,102,241,0.05)' : '#f8fafc'}
        stroke={isHot ? BRAND_PRIMARY : '#d6d3d1'}
        dash={[10 * strokeScale, 8 * strokeScale]}
        strokeWidth={2 * strokeScale}
        cornerRadius={4 * strokeScale}
      />
      <Line
        points={[centerX - plusArm, centerY, centerX + plusArm, centerY]}
        stroke={isHot ? BRAND_PRIMARY : '#a8a29e'}
        strokeWidth={2.5 * strokeScale}
        lineCap="round"
        listening={false}
      />
      <Line
        points={[centerX, centerY - plusArm, centerX, centerY + plusArm]}
        stroke={isHot ? BRAND_PRIMARY : '#a8a29e'}
        strokeWidth={2.5 * strokeScale}
        lineCap="round"
        listening={false}
      />
      <Text
        text="Add screen"
        x={0}
        y={centerY + plusArm + height * 0.025}
        width={width}
        align="center"
        fontSize={Math.max(13, width * 0.022)}
        fill={isHot ? BRAND_PRIMARY : '#78716c'}
        listening={false}
      />
    </Group>
  )
}
