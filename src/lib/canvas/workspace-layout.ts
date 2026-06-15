import type { Screen } from '@/lib/types'
import { DEFAULT_DESIGN_HEIGHT, DEFAULT_DESIGN_WIDTH } from '@/lib/constants'
import { getScreenPlatform } from '@/lib/platform-copy'

export const WORKSPACE_PADDING = 80
export const SCREEN_GAP = 80
export const PLATFORM_ROW_GAP = 80

export interface ScreenPosition {
  x: number
  y: number
}

function splitScreensByPlatform(screens: Screen[]) {
  const appleScreens = screens.filter((screen) => getScreenPlatform(screen) !== 'android')
  const androidScreens = screens.filter((screen) => getScreenPlatform(screen) === 'android')
  return { appleScreens, androidScreens }
}

export function computePlatformLayout(screens: Screen[]): Record<string, ScreenPosition> {
  const { appleScreens, androidScreens } = splitScreensByPlatform(screens)
  const layout: Record<string, ScreenPosition> = {}

  if (appleScreens.length === 0 && androidScreens.length === 0) {
    return layout
  }

  let x = WORKSPACE_PADDING
  const appleY = WORKSPACE_PADDING
  let maxAppleHeight = 0

  for (const screen of appleScreens) {
    layout[screen.id] = { x, y: appleY }
    x += screen.width + SCREEN_GAP
    maxAppleHeight = Math.max(maxAppleHeight, screen.height)
  }

  const androidY =
    appleScreens.length > 0 ? appleY + maxAppleHeight + PLATFORM_ROW_GAP : WORKSPACE_PADDING
  const appleXById = new Map(appleScreens.map((screen) => [screen.id, layout[screen.id].x]))

  let fallbackX = WORKSPACE_PADDING
  for (const screen of androidScreens) {
    const alignedX =
      screen.sourceScreenId && appleXById.has(screen.sourceScreenId)
        ? appleXById.get(screen.sourceScreenId)!
        : fallbackX
    layout[screen.id] = { x: alignedX, y: androidY }
    if (!screen.sourceScreenId || !appleXById.has(screen.sourceScreenId)) {
      fallbackX = alignedX + screen.width + SCREEN_GAP
    }
  }

  return layout
}

/** @deprecated Use computePlatformLayout — kept as alias for callers expecting horizontal-only layout. */
export function computeHorizontalLayout(screens: Screen[]): Record<string, ScreenPosition> {
  return computePlatformLayout(screens)
}

export function getAddFrameSize(screens: Screen[]): { width: number; height: number } {
  const { appleScreens } = splitScreensByPlatform(screens)
  const reference = appleScreens[appleScreens.length - 1] ?? screens[screens.length - 1]
  if (reference) return { width: reference.width, height: reference.height }
  return { width: DEFAULT_DESIGN_WIDTH, height: DEFAULT_DESIGN_HEIGHT }
}

export function getAddChipPosition(screens: Screen[], layout: Record<string, ScreenPosition>) {
  const { appleScreens } = splitScreensByPlatform(screens)
  const rowScreens = appleScreens.length > 0 ? appleScreens : screens

  if (rowScreens.length === 0) {
    return { x: WORKSPACE_PADDING, y: WORKSPACE_PADDING }
  }

  const last = rowScreens[rowScreens.length - 1]
  const pos = layout[last.id]
  if (!pos) return { x: WORKSPACE_PADDING, y: WORKSPACE_PADDING }
  return {
    x: pos.x + last.width + SCREEN_GAP,
    y: pos.y,
  }
}

export interface WorkspaceBounds {
  minX: number
  minY: number
  maxX: number
  maxY: number
  width: number
  height: number
}

export function getWorkspaceBounds(
  screens: Screen[],
  layout: Record<string, ScreenPosition>,
  includeAddChip = true,
): WorkspaceBounds {
  const addSize = getAddFrameSize(screens)

  if (screens.length === 0) {
    return {
      minX: 0,
      minY: 0,
      maxX: addSize.width + WORKSPACE_PADDING * 2,
      maxY: addSize.height + WORKSPACE_PADDING * 2,
      width: addSize.width + WORKSPACE_PADDING * 2,
      height: addSize.height + WORKSPACE_PADDING * 2,
    }
  }

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  for (const screen of screens) {
    const pos = layout[screen.id]
    if (!pos) continue
    minX = Math.min(minX, pos.x)
    minY = Math.min(minY, pos.y)
    maxX = Math.max(maxX, pos.x + screen.width)
    maxY = Math.max(maxY, pos.y + screen.height)
  }

  if (includeAddChip) {
    const chip = getAddChipPosition(screens, layout)
    maxX = Math.max(maxX, chip.x + addSize.width)
    maxY = Math.max(maxY, chip.y + addSize.height)
  }

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  }
}

export function findScreenAtPoint(
  point: { x: number; y: number },
  screens: Screen[],
  layout: Record<string, ScreenPosition>,
): Screen | null {
  for (let index = screens.length - 1; index >= 0; index -= 1) {
    const screen = screens[index]
    const pos = layout[screen.id]
    if (!pos) continue
    if (
      point.x >= pos.x &&
      point.x <= pos.x + screen.width &&
      point.y >= pos.y &&
      point.y <= pos.y + screen.height
    ) {
      return screen
    }
  }
  return null
}
