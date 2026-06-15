import { Group, Line, Text as KonvaText } from 'react-konva'

interface RulersProps {
  width: number
  height: number
  offsetX: number
  offsetY: number
  zoom: number
}

const RULER_SIZE = 24

export function Rulers({ width, height, offsetX, offsetY, zoom }: RulersProps) {
  const step = zoom < 0.2 ? 500 : zoom < 0.4 ? 200 : 100
  const fontSize = 10 / zoom

  const horizontalTicks: number[] = []
  for (let x = 0; x <= width; x += step) horizontalTicks.push(x)

  const verticalTicks: number[] = []
  for (let y = 0; y <= height; y += step) verticalTicks.push(y)

  return (
    <Group listening={false}>
      {/* Horizontal ruler background */}
      <Line
        points={[offsetX, offsetY - RULER_SIZE / zoom, offsetX + width, offsetY - RULER_SIZE / zoom]}
        stroke="#94a3b8"
        strokeWidth={1 / zoom}
        closed
        fill="rgba(248,250,252,0.95)"
      />
      {horizontalTicks.map((x) => (
        <Group key={`h-${x}`}>
          <Line
            points={[
              offsetX + x,
              offsetY - RULER_SIZE / zoom,
              offsetX + x,
              offsetY - 4 / zoom,
            ]}
            stroke="#94a3b8"
            strokeWidth={1 / zoom}
          />
          <KonvaText
            x={offsetX + x + 2 / zoom}
            y={offsetY - (RULER_SIZE - 4) / zoom}
            text={String(x)}
            fontSize={fontSize}
            fill="#64748b"
          />
        </Group>
      ))}

      {/* Vertical ruler */}
      <Line
        points={[offsetX - RULER_SIZE / zoom, offsetY, offsetX - RULER_SIZE / zoom, offsetY + height]}
        stroke="#94a3b8"
        strokeWidth={1 / zoom}
        closed
        fill="rgba(248,250,252,0.95)"
      />
      {verticalTicks.map((y) => (
        <Group key={`v-${y}`}>
          <Line
            points={[
              offsetX - RULER_SIZE / zoom,
              offsetY + y,
              offsetX - 4 / zoom,
              offsetY + y,
            ]}
            stroke="#94a3b8"
            strokeWidth={1 / zoom}
          />
          <KonvaText
            x={offsetX - (RULER_SIZE - 2) / zoom}
            y={offsetY + y + 2 / zoom}
            text={String(y)}
            fontSize={fontSize}
            fill="#64748b"
            rotation={-90}
          />
        </Group>
      ))}
    </Group>
  )
}
