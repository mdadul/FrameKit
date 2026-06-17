import { describe, expect, it } from 'vitest'
import {
  isAdditiveKonvaPointerEvent,
  isAdditiveSelection,
} from '@/lib/selection/is-additive-selection'

describe('isAdditiveSelection', () => {
  it('returns true when shift is held', () => {
    expect(isAdditiveSelection({ shiftKey: true, metaKey: false, ctrlKey: false })).toBe(true)
  })

  it('returns true when meta or ctrl is held', () => {
    expect(isAdditiveSelection({ shiftKey: false, metaKey: true, ctrlKey: false })).toBe(true)
    expect(isAdditiveSelection({ shiftKey: false, metaKey: false, ctrlKey: true })).toBe(true)
  })

  it('returns false with no modifier keys', () => {
    expect(isAdditiveSelection({ shiftKey: false, metaKey: false, ctrlKey: false })).toBe(false)
  })
})

describe('isAdditiveKonvaPointerEvent', () => {
  it('reads modifier keys from Konva pointer events', () => {
    expect(
      isAdditiveKonvaPointerEvent({
        evt: { shiftKey: false, metaKey: true, ctrlKey: false },
      }),
    ).toBe(true)
  })
})
