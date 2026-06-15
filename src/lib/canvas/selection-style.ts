/** Figma-style canvas selection colors */
export const SELECTION_BLUE = '#18A0FB'
export const SELECTION_BLUE_SOFT = 'rgba(24, 160, 251, 0.45)'
export const SELECTION_FILL = 'rgba(24, 160, 251, 0.08)'
export const SELECTION_HANDLE_FILL = '#FFFFFF'

/** Target on-screen size (px) for transformer UI when using inverse-scale wrapper. */
export const TRANSFORMER_ANCHOR_SIZE = 5
export const TRANSFORMER_BORDER_WIDTH = 1
export const TRANSFORMER_ANCHOR_STROKE_WIDTH = 1
export const TRANSFORMER_ANCHOR_CORNER_RADIUS = 0
export const TRANSFORMER_ROTATE_OFFSET = 16

/** Strokes on shapes inside the scaled stage — compensate so they stay ~N px on screen. */
export function selectionStrokeWidth(zoom: number, screenPx = 1): number {
  return screenPx / Math.max(zoom, 0.08)
}
