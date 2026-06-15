import type { BackgroundConfig, Element, FillConfig } from '@/lib/types'

export function getGradientProps(fill: FillConfig, width: number, height: number) {
  if (fill.type !== 'gradient' || !fill.gradient) return null
  const { gradient } = fill
  if (gradient.type === 'radial') {
    return {
      fillRadialGradientStartPoint: { x: width / 2, y: height / 2 },
      fillRadialGradientEndPoint: { x: width / 2, y: height / 2 },
      fillRadialGradientStartRadius: 0,
      fillRadialGradientEndRadius: Math.max(width, height) / 2,
      fillRadialGradientColorStops: gradient.stops.flatMap((stop) => [
        stop.offset,
        stop.color,
      ]),
    }
  }

  const angle = (gradient.angle ?? 180) * (Math.PI / 180)
  const centerX = width / 2
  const centerY = height / 2
  const length = Math.max(width, height)
  const startX = centerX - (Math.cos(angle) * length) / 2
  const startY = centerY - (Math.sin(angle) * length) / 2
  const endX = centerX + (Math.cos(angle) * length) / 2
  const endY = centerY + (Math.sin(angle) * length) / 2

  return {
    fillLinearGradientStartPoint: { x: startX, y: startY },
    fillLinearGradientEndPoint: { x: endX, y: endY },
    fillLinearGradientColorStops: gradient.stops.flatMap((stop) => [
      stop.offset,
      stop.color,
    ]),
  }
}

export function getBackgroundGradientProps(
  background: BackgroundConfig,
  width: number,
  height: number,
) {
  if (background.type === 'linear-gradient' && background.gradient) {
    return getGradientProps({ type: 'gradient', gradient: background.gradient }, width, height)
  }
  if (background.type === 'radial-gradient' && background.gradient) {
    return getGradientProps(
      {
        type: 'gradient',
        gradient: { ...background.gradient, type: 'radial' },
      },
      width,
      height,
    )
  }
  return null
}

export function getElementShadowProps(element: Element) {
  if (!element.shadow?.enabled) return {}
  return {
    shadowColor: element.shadow.color,
    shadowBlur: element.shadow.blur,
    shadowOffsetX: element.shadow.offsetX,
    shadowOffsetY: element.shadow.offsetY,
    shadowEnabled: true,
  }
}

export type SnapLine = { orientation: 'vertical' | 'horizontal'; position: number }

export function getSnapLines(
  moving: Element,
  others: Element[],
  canvasWidth: number,
  canvasHeight: number,
  threshold: number,
) {
  const lines: SnapLine[] = []
  const movingBounds = {
    left: moving.x,
    right: moving.x + moving.width,
    centerX: moving.x + moving.width / 2,
    top: moving.y,
    bottom: moving.y + moving.height,
    centerY: moving.y + moving.height / 2,
  }

  const guides = [
    { orientation: 'vertical' as const, position: 0 },
    { orientation: 'vertical' as const, position: canvasWidth / 2 },
    { orientation: 'vertical' as const, position: canvasWidth },
    { orientation: 'horizontal' as const, position: 0 },
    { orientation: 'horizontal' as const, position: canvasHeight / 2 },
    { orientation: 'horizontal' as const, position: canvasHeight },
  ]

  for (const element of others) {
    if (element.id === moving.id) continue
    guides.push(
      { orientation: 'vertical', position: element.x },
      { orientation: 'vertical', position: element.x + element.width / 2 },
      { orientation: 'vertical', position: element.x + element.width },
      { orientation: 'horizontal', position: element.y },
      { orientation: 'horizontal', position: element.y + element.height / 2 },
      { orientation: 'horizontal', position: element.y + element.height },
    )
  }

  for (const guide of guides) {
    const candidates =
      guide.orientation === 'vertical'
        ? [movingBounds.left, movingBounds.centerX, movingBounds.right]
        : [movingBounds.top, movingBounds.centerY, movingBounds.bottom]

    if (candidates.some((value) => Math.abs(value - guide.position) <= threshold)) {
      lines.push(guide)
    }
  }

  return lines
}

export function applySnapping(
  element: Element,
  others: Element[],
  canvasWidth: number,
  canvasHeight: number,
  threshold: number,
): Element {
  const lines = getSnapLines(element, others, canvasWidth, canvasHeight, threshold)
  let { x, y } = element

  for (const line of lines) {
    if (line.orientation === 'vertical') {
      if (Math.abs(x - line.position) <= threshold) x = line.position
      if (Math.abs(x + element.width / 2 - line.position) <= threshold) {
        x = line.position - element.width / 2
      }
      if (Math.abs(x + element.width - line.position) <= threshold) {
        x = line.position - element.width
      }
    } else {
      if (Math.abs(y - line.position) <= threshold) y = line.position
      if (Math.abs(y + element.height / 2 - line.position) <= threshold) {
        y = line.position - element.height / 2
      }
      if (Math.abs(y + element.height - line.position) <= threshold) {
        y = line.position - element.height
      }
    }
  }

  return { ...element, x, y }
}

/**
 * One-pass snap used during live dragging: returns the snapped position plus the
 * guide lines that should be drawn for it, avoiding a double traversal.
 */
export function computeSnap(
  moving: Element,
  others: Element[],
  canvasWidth: number,
  canvasHeight: number,
  threshold: number,
): { x: number; y: number; lines: SnapLine[] } {
  const snapped = applySnapping(moving, others, canvasWidth, canvasHeight, threshold)
  const lines = getSnapLines(snapped, others, canvasWidth, canvasHeight, threshold)
  return { x: snapped.x, y: snapped.y, lines }
}

export function rectsIntersect(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number },
): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  )
}
