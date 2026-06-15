import type { Element, Screen } from '@/lib/types'

export function resolveSelectedElements(screen: Screen, selectedIds: string[]): Element[] {
  if (selectedIds.length === 0) return []
  const idSet = new Set(selectedIds)
  return screen.elements.filter((element) => idSet.has(element.id))
}

export function resolveSelectedElementsById(
  screen: Screen | undefined,
  selectedIds: string[],
): Element[] {
  if (!screen) return []
  return selectedIds
    .map((id) => screen.elements.find((element) => element.id === id))
    .filter((element): element is Element => element != null)
}
