import type { Element, Screen } from '@/lib/types'

export type ElementAlignment =
  | 'left'
  | 'center'
  | 'right'
  | 'top'
  | 'middle'
  | 'bottom'

function selectionBounds(elements: Element[]) {
  return {
    left: Math.min(...elements.map((element) => element.x)),
    right: Math.max(...elements.map((element) => element.x + element.width)),
    top: Math.min(...elements.map((element) => element.y)),
    bottom: Math.max(...elements.map((element) => element.y + element.height)),
  }
}

export function alignElementsOnScreen(
  screen: Screen,
  ids: string[],
  alignment: ElementAlignment,
): void {
  const selected = screen.elements.filter((element) => ids.includes(element.id))
  if (selected.length === 0) return

  const bounds = selectionBounds(selected)

  screen.elements = screen.elements.map((element) => {
    if (!ids.includes(element.id)) return element
    const next = { ...element }
    switch (alignment) {
      case 'left':
        next.x = bounds.left
        break
      case 'center':
        next.x = bounds.left + (bounds.right - bounds.left - element.width) / 2
        break
      case 'right':
        next.x = bounds.right - element.width
        break
      case 'top':
        next.y = bounds.top
        break
      case 'middle':
        next.y = bounds.top + (bounds.bottom - bounds.top - element.height) / 2
        break
      case 'bottom':
        next.y = bounds.bottom - element.height
        break
    }
    return next
  })
}

export function alignElementsToArtboard(
  screen: Screen,
  ids: string[],
  axis: 'horizontal' | 'vertical',
): void {
  screen.elements = screen.elements.map((element) => {
    if (!ids.includes(element.id)) return element
    return axis === 'horizontal'
      ? { ...element, x: (screen.width - element.width) / 2 }
      : { ...element, y: (screen.height - element.height) / 2 }
  })
}

export function distributeElementsOnScreen(
  screen: Screen,
  ids: string[],
  axis: 'horizontal' | 'vertical',
): void {
  const selected = screen.elements
    .filter((element) => ids.includes(element.id))
    .sort((a, b) => (axis === 'horizontal' ? a.x - b.x : a.y - b.y))
  if (selected.length < 3) return

  const first = selected[0]
  const last = selected[selected.length - 1]
  const totalSpace =
    axis === 'horizontal'
      ? last.x + last.width - first.x
      : last.y + last.height - first.y
  const itemsSize = selected.reduce(
    (sum, element) => sum + (axis === 'horizontal' ? element.width : element.height),
    0,
  )
  const gap = (totalSpace - itemsSize) / (selected.length - 1)

  let cursor = axis === 'horizontal' ? first.x : first.y
  const positions = new Map<string, number>()
  selected.forEach((element) => {
    positions.set(element.id, cursor)
    cursor += (axis === 'horizontal' ? element.width : element.height) + gap
  })

  screen.elements = screen.elements.map((element) => {
    const position = positions.get(element.id)
    if (position === undefined) return element
    return axis === 'horizontal' ? { ...element, x: position } : { ...element, y: position }
  })
}
