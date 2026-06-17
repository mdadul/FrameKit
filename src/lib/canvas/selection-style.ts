/** Figma-style canvas selection colors */
export const SELECTION_BLUE = '#18A0FB'
export const SELECTION_BLUE_SOFT = 'rgba(24, 160, 251, 0.45)'
export const SELECTION_FILL = 'rgba(24, 160, 251, 0.08)'
export const SELECTION_HANDLE_FILL = '#FFFFFF'

/** Layers panel / overview list selection (Tailwind — keep hex in sync with SELECTION_BLUE). */
export const LAYER_LIST_ITEM_SELECTED =
  'bg-[#18A0FB]/12 text-foreground ring-1 ring-inset ring-[#18A0FB]/35'
export const LAYER_LIST_ITEM_SELECTED_INDICATOR =
  'before:absolute before:inset-y-0 before:left-0 before:w-0.5 before:bg-[#18A0FB]'
export const LAYER_LIST_GROUP_SELECTED =
  'bg-[#18A0FB]/10 text-foreground ring-1 ring-inset ring-[#18A0FB]/25'
export const LAYER_LIST_GROUP_SELECTED_INDICATOR =
  'before:absolute before:inset-y-0 before:left-0 before:w-0.5 before:bg-[#18A0FB]/70'
export const SCREEN_OVERVIEW_ACTIVE =
  'border-[#18A0FB] ring-2 ring-[#18A0FB]/30'
export const SCREEN_OVERVIEW_HOVER = 'hover:border-[#18A0FB]/50'

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
