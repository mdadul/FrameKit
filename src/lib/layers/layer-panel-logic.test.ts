import { describe, expect, it } from 'vitest'
import { createTextElement, createScreen } from '@/lib/factories'
import {
  buildLayerContextTarget,
  resolveContextMenuSelection,
  sortLayersByZIndex,
  toggleGroupSelection,
} from '@/lib/layers/layer-panel-logic'

describe('sortLayersByZIndex', () => {
  it('orders elements from highest z-index to lowest', () => {
    const screen = createScreen()
    screen.elements = [
      createTextElement({ id: 'back', zIndex: 0 }),
      createTextElement({ id: 'front', zIndex: 2 }),
      createTextElement({ id: 'mid', zIndex: 1 }),
    ]

    expect(sortLayersByZIndex(screen).map((element) => element.id)).toEqual([
      'front',
      'mid',
      'back',
    ])
  })
})

describe('resolveContextMenuSelection', () => {
  it('keeps the current multi-selection when the target is already selected', () => {
    const selected = ['a', 'b']
    expect(resolveContextMenuSelection(['a'], selected)).toEqual(selected)
  })

  it('replaces selection when right-clicking an unselected layer', () => {
    expect(resolveContextMenuSelection(['c'], ['a', 'b'])).toEqual(['c'])
  })
})

describe('buildLayerContextTarget', () => {
  it('reports visibility and lock state for the targeted elements', () => {
    const screen = createScreen()
    screen.elements = [
      createTextElement({ id: 'a', visible: true, locked: false }),
      createTextElement({ id: 'b', visible: false, locked: true }),
    ]

    expect(buildLayerContextTarget(screen, ['a', 'b'])).toEqual({
      elementIds: ['a', 'b'],
      allVisible: false,
      allLocked: false,
      canDelete: true,
    })
  })
})

describe('toggleGroupSelection', () => {
  it('selects the whole group without modifiers', () => {
    expect(toggleGroupSelection(['a', 'b'], ['x'], false)).toEqual(['a', 'b'])
  })

  it('adds group members with additive selection', () => {
    expect(toggleGroupSelection(['a', 'b'], ['x'], true)).toEqual(['x', 'a', 'b'])
  })

  it('removes group members when all are already selected', () => {
    expect(toggleGroupSelection(['a', 'b'], ['a', 'b', 'c'], true)).toEqual(['c'])
  })
})
