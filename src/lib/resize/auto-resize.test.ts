import { describe, expect, it } from 'vitest'
import { createScreen, createTextElement } from '@/lib/factories'
import { autoResizeScreen } from '@/lib/resize/auto-resize'

describe('autoResizeScreen', () => {
  it('scales elements proportionally to target size', () => {
    const screen = createScreen()
    screen.elements = [
      createTextElement({
        x: 100,
        y: 200,
        width: 500,
        height: 80,
        fontSize: 64,
      }),
    ]

    const result = autoResizeScreen(screen, 1284, 2778)

    expect(result.width).toBe(1284)
    expect(result.height).toBe(2778)
    expect(result.elements[0].x).toBeGreaterThan(0)
    expect(result.elements[0].width).toBeGreaterThan(500 * 0.9)
    if (result.elements[0].type === 'text') {
      expect(result.elements[0].fontSize).toBeGreaterThan(60)
    }
  })

  it('preserves element count and ordering', () => {
    const screen = createScreen()
    screen.elements = [
      createTextElement({ zIndex: 0 }),
      createTextElement({ zIndex: 1 }),
    ]

    const result = autoResizeScreen(screen, 1080, 1920)
    expect(result.elements).toHaveLength(2)
  })
})
