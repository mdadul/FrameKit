import { describe, expect, it } from 'vitest'
import { alignElementsOnScreen, distributeElementsOnScreen } from '@/stores/project/element-alignment'
import { minimalScreen } from '@/test/fixtures/minimal-screen'
import type { Element } from '@/lib/types'

function box(id: string, x: number, y: number, width = 100, height = 100): Element {
  return {
    id,
    type: 'shape',
    name: id,
    shapeKind: 'rectangle',
    x,
    y,
    width,
    height,
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
    zIndex: 0,
    fill: { type: 'solid', color: '#000' },
    stroke: '#000',
    strokeWidth: 0,
    cornerRadius: 0,
    dash: [],
  }
}

describe('element-alignment', () => {
  it('aligns selected elements to the left edge of their bounds', () => {
    const screen = {
      ...minimalScreen(),
      elements: [box('a', 10, 0), box('b', 50, 0), box('c', 200, 0)],
    }

    alignElementsOnScreen(screen, ['a', 'b'], 'left')

    expect(screen.elements.find((item) => item.id === 'a')?.x).toBe(10)
    expect(screen.elements.find((item) => item.id === 'b')?.x).toBe(10)
    expect(screen.elements.find((item) => item.id === 'c')?.x).toBe(200)
  })

  it('distributes three elements with equal gaps horizontally', () => {
    const screen = {
      ...minimalScreen(),
      elements: [box('a', 0, 0, 100), box('b', 200, 0, 100), box('c', 500, 0, 100)],
    }

    distributeElementsOnScreen(screen, ['a', 'b', 'c'], 'horizontal')

    expect(screen.elements.map((item) => item.x)).toEqual([0, 250, 500])
  })
})
