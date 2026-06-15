import type Konva from 'konva'
import type { Element, Screen } from '@/lib/types'

export function getGroupOrigin(screen: Screen, groupId: string) {
  const members = screen.elements.filter((item) => item.groupId === groupId)
  return {
    x: Math.min(...members.map((item) => item.x)),
    y: Math.min(...members.map((item) => item.y)),
  }
}

export function getAbsoluteNodePosition(element: Element, screen: Screen, node: Konva.Node) {
  if (!element.groupId) {
    return { x: node.x(), y: node.y() }
  }
  const origin = getGroupOrigin(screen, element.groupId)
  return { x: origin.x + node.x(), y: origin.y + node.y() }
}

export function setAbsoluteNodePosition(
  element: Element,
  screen: Screen,
  node: Konva.Node,
  absoluteX: number,
  absoluteY: number,
) {
  if (!element.groupId) {
    node.x(absoluteX)
    node.y(absoluteY)
    return
  }
  const origin = getGroupOrigin(screen, element.groupId)
  node.x(absoluteX - origin.x)
  node.y(absoluteY - origin.y)
}

/** Screen-local point from a workspace coordinate. */
export function workspaceToScreenLocal(
  point: { x: number; y: number },
  screenLayout: Record<string, { x: number; y: number }>,
  screenId: string,
) {
  const offset = screenLayout[screenId]
  return {
    x: point.x - (offset?.x ?? 0),
    y: point.y - (offset?.y ?? 0),
  }
}
