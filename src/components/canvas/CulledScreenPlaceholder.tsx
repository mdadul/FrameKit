import { Group, Rect, Text } from 'react-konva'

interface CulledScreenPlaceholderProps {
  width: number
  height: number
  screenName: string
}

/** Minimal draw cost for artboards outside the viewport. */
export function CulledScreenPlaceholder({
  width,
  height,
  screenName,
}: CulledScreenPlaceholderProps) {
  return (
    <Group listening={false}>
      <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill="#f8fafc"
        stroke="#cbd5e1"
        strokeWidth={1}
        dash={[8, 6]}
        listening={false}
        perfectDrawEnabled={false}
      />
      <Text
        x={12}
        y={12}
        text={screenName}
        fontSize={14}
        fontFamily="Inter, system-ui, sans-serif"
        fill="#64748b"
        listening={false}
      />
    </Group>
  )
}
