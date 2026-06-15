import type { GradientStop } from '@/lib/types'

export interface CanvasGradientSpec {
  type: 'linear' | 'radial'
  angle?: number
  stops: GradientStop[]
}

export function createCanvasGradient(
  context: CanvasRenderingContext2D,
  spec: CanvasGradientSpec,
  width: number,
  height: number,
): CanvasGradient | null {
  if (spec.stops.length === 0) return null

  let gradient: CanvasGradient
  if (spec.type === 'radial') {
    gradient = context.createRadialGradient(
      width / 2,
      height / 2,
      0,
      width / 2,
      height / 2,
      Math.max(width, height) / 2,
    )
  } else {
    const angle = ((spec.angle ?? 180) * Math.PI) / 180
    const cx = width / 2
    const cy = height / 2
    const len = Math.max(width, height)
    gradient = context.createLinearGradient(
      cx - (Math.cos(angle) * len) / 2,
      cy - (Math.sin(angle) * len) / 2,
      cx + (Math.cos(angle) * len) / 2,
      cy + (Math.sin(angle) * len) / 2,
    )
  }

  for (const stop of spec.stops) {
    gradient.addColorStop(stop.offset, stop.color)
  }
  return gradient
}

export function fillRectWithCanvasGradient(
  context: CanvasRenderingContext2D,
  spec: CanvasGradientSpec,
  width: number,
  height: number,
): void {
  const gradient = createCanvasGradient(context, spec, width, height)
  if (!gradient) return
  context.fillStyle = gradient
  context.fillRect(0, 0, width, height)
}
