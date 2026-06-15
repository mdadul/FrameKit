export interface ViewportRect {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

export interface ScreenBounds {
  x: number
  y: number
  width: number
  height: number
}

const VIEWPORT_PADDING = 120

/** Visible workspace rect in unscaled workspace coordinates. */
export function getWorkspaceViewport(
  containerWidth: number,
  containerHeight: number,
  panX: number,
  panY: number,
  zoom: number,
  padding = VIEWPORT_PADDING,
): ViewportRect {
  return {
    minX: (-panX - padding) / zoom,
    minY: (-panY - padding) / zoom,
    maxX: (containerWidth - panX + padding) / zoom,
    maxY: (containerHeight - panY + padding) / zoom,
  }
}

export function rectsIntersectViewport(
  bounds: ScreenBounds,
  viewport: ViewportRect,
): boolean {
  return (
    bounds.x + bounds.width >= viewport.minX &&
    bounds.x <= viewport.maxX &&
    bounds.y + bounds.height >= viewport.minY &&
    bounds.y <= viewport.maxY
  )
}
