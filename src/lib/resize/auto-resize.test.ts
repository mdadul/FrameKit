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

  it('uses fill strategy with larger scale than fit', () => {
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

    const fit = autoResizeScreen(screen, 1080, 1920, { strategy: 'fit' })
    const fill = autoResizeScreen(screen, 1080, 1920, { strategy: 'fill' })

    expect(fill.elements[0].width).toBeGreaterThan(fit.elements[0].width)
  })

  it('aligns crop strategy further left than centered fit', () => {
    const screen = createScreen()
    screen.elements = [createTextElement({ x: 100, y: 200, width: 400, height: 80 })]

    const fit = autoResizeScreen(screen, 1080, 1920, { strategy: 'fit' })
    const crop = autoResizeScreen(screen, 1080, 1920, { strategy: 'crop' })
    expect(crop.elements[0].x).toBeLessThan(fit.elements[0].x)
  })
})
