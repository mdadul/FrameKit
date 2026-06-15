import { describe, expect, it } from 'vitest'
import {
  getAbsoluteNodePosition,
  getGroupOrigin,
  setAbsoluteNodePosition,
  workspaceToScreenLocal,
} from '@/lib/canvas/coordinates'
import { minimalScreen } from '@/test/fixtures/minimal-screen'
import type { Element } from '@/lib/types'

function mockNode(x: number, y: number) {
  let nodeX = x
  let nodeY = y
  const node = {
    x: (value?: number) => {
      if (value !== undefined) {
        nodeX = value
        return node
      }
      return nodeX
    },
    y: (value?: number) => {
      if (value !== undefined) {
        nodeY = value
        return node
      }
      return nodeY
    },
  }
  return node as unknown as import('konva').default.Node
}

describe('coordinates', () => {
  it('returns group origin from member positions', () => {
    const screen = {
      ...minimalScreen(),
      elements: [
        { id: 'a', groupId: 'g1', x: 40, y: 60 } as Element,
        { id: 'b', groupId: 'g1', x: 10, y: 30 } as Element,
      ],
    }
    expect(getGroupOrigin(screen, 'g1')).toEqual({ x: 10, y: 30 })
  })

  it('maps grouped node position to absolute coordinates', () => {
    const screen = {
      ...minimalScreen(),
      elements: [{ id: 'a', groupId: 'g1', x: 10, y: 20 } as Element],
    }
    const node = mockNode(5, 8)
    expect(getAbsoluteNodePosition(screen.elements[0], screen, node)).toEqual({ x: 15, y: 28 })
  })

  it('writes absolute coordinates back to a grouped node', () => {
    const screen = {
      ...minimalScreen(),
      elements: [{ id: 'a', groupId: 'g1', x: 10, y: 20 } as Element],
    }
    const node = mockNode(0, 0)
    setAbsoluteNodePosition(screen.elements[0], screen, node, 30, 40)
    expect(node.x()).toBe(20)
    expect(node.y()).toBe(20)
  })

  it('converts workspace coordinates to screen-local space', () => {
    const local = workspaceToScreenLocal(
      { x: 150, y: 220 },
      { 'screen-1': { x: 100, y: 200 } },
      'screen-1',
    )
    expect(local).toEqual({ x: 50, y: 20 })
  })
})
