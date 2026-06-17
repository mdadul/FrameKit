import type { Element, Screen } from '@/lib/types'
import { sortElementsByZIndex } from '@/lib/factories'

export function sortLayersByZIndex(screen: Screen): Element[] {
  return sortElementsByZIndex(screen.elements, 'desc')
}

export function resolveContextMenuSelection(
  elementIds: string[],
  selectedElementIds: string[],
): string[] {
  const uniqueIds = Array.from(new Set(elementIds))
  const hitsSelection = uniqueIds.every((id) => selectedElementIds.includes(id))
  if (hitsSelection && selectedElementIds.length > 0) return selectedElementIds
  return uniqueIds
}

export function buildLayerContextTarget(
  screen: Screen,
  elementIds: string[],
): {
  elementIds: string[]
  allVisible: boolean
  allLocked: boolean
  canDelete: boolean
} {
  const elements = screen.elements.filter((element) => elementIds.includes(element.id))
  return {
    elementIds,
    allVisible: elements.length > 0 && elements.every((element) => element.visible),
    allLocked: elements.length > 0 && elements.every((element) => element.locked),
    canDelete: elementIds.length > 0,
  }
}

export function toggleGroupSelection(
  memberIds: string[],
  selectedElementIds: string[],
  additive: boolean,
): string[] {
  if (!additive) return memberIds

  const allMembersSelected = memberIds.every((id) => selectedElementIds.includes(id))
  if (allMembersSelected) {
    return selectedElementIds.filter((id) => !memberIds.includes(id))
  }
  return Array.from(new Set([...selectedElementIds, ...memberIds]))
}
