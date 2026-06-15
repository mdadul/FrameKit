import {
  duplicateElement,
  reindexElements,
  sortElementsByZIndex,
} from '@/lib/factories'
import { createId } from '@/lib/utils'
import type { Element, Screen } from '@/lib/types'

export function findScreenById(project: { screens: Screen[] }, screenId: string): Screen | undefined {
  return project.screens.find((item) => item.id === screenId)
}

export function addElementToScreen(screen: Screen, element: Element): void {
  const zIndex = screen.elements.length
  screen.elements.push({ ...element, zIndex })
}

export function updateElementOnScreen(screen: Screen, id: string, patch: Partial<Element>): boolean {
  const index = screen.elements.findIndex((element) => element.id === id)
  if (index === -1) return false
  screen.elements[index] = {
    ...screen.elements[index],
    ...patch,
  } as Element
  return true
}

export function deleteElementsFromScreen(screen: Screen, ids: string[]): void {
  screen.elements = reindexElements(
    sortElementsByZIndex(screen.elements).filter((element) => !ids.includes(element.id)),
  )
}

export function duplicateElementsOnScreen(screen: Screen, ids: string[]): void {
  const copies = screen.elements
    .filter((element) => ids.includes(element.id))
    .map((element) => duplicateElement(element))
  screen.elements = reindexElements([...sortElementsByZIndex(screen.elements), ...copies])
}

export function reorderElementsOnScreen(screen: Screen, elementIds: string[]): void {
  const map = new Map(screen.elements.map((element) => [element.id, element]))
  const orderedIds = new Set(elementIds)
  const ordered = elementIds
    .map((id) => map.get(id))
    .filter((element): element is Element => Boolean(element))
  const remaining = sortElementsByZIndex(
    screen.elements.filter((element) => !orderedIds.has(element.id)),
  )
  screen.elements = reindexElements([...ordered, ...remaining])
}

export function bringForwardElement(screen: Screen, id: string): void {
  const sorted = sortElementsByZIndex(screen.elements)
  const index = sorted.findIndex((element) => element.id === id)
  if (index < 0 || index === sorted.length - 1) return
  ;[sorted[index], sorted[index + 1]] = [sorted[index + 1], sorted[index]]
  screen.elements = reindexElements(sorted)
}

export function sendBackwardElement(screen: Screen, id: string): void {
  const sorted = sortElementsByZIndex(screen.elements)
  const index = sorted.findIndex((element) => element.id === id)
  if (index <= 0) return
  ;[sorted[index], sorted[index - 1]] = [sorted[index - 1], sorted[index]]
  screen.elements = reindexElements(sorted)
}

export function groupElementsOnScreen(screen: Screen, ids: string[]): void {
  if (ids.length < 2) return
  const groupId = createId()
  screen.elements = screen.elements.map((element) =>
    ids.includes(element.id) ? { ...element, groupId } : element,
  )
}

export function ungroupElementsOnScreen(screen: Screen, groupId: string): void {
  screen.elements = screen.elements.map((element) =>
    element.groupId === groupId ? { ...element, groupId: undefined } : element,
  )
}
