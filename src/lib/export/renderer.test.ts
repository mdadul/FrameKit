import { describe, expect, it, vi } from 'vitest'
import { createShapeElement, createTextElement } from '@/lib/factories'
import { renderScreenToDataUrl } from '@/lib/export/renderer'
import { minimalBackground, minimalScreen } from '@/test/fixtures/minimal-screen'

const noopResolver = () => undefined

describe('renderScreenToDataUrl', () => {
  it('returns a PNG data URL for a solid background screen', async () => {
    const screen = minimalScreen({
      width: 200,
      height: 100,
      background: minimalBackground(),
      elements: [],
    })

    const dataUrl = await renderScreenToDataUrl({
      screen,
      assetResolver: noopResolver,
      format: 'png',
    })

    expect(dataUrl).toMatch(/^data:image\/png;base64,/)
  })

  it('renders a text element', async () => {
    const screen = minimalScreen({
      width: 300,
      height: 200,
      background: { type: 'solid', color: '#ffffff' },
      elements: [createTextElement({ text: 'Export test', zIndex: 0 })],
    })

    const dataUrl = await renderScreenToDataUrl({ screen, assetResolver: noopResolver })
    expect(dataUrl).toMatch(/^data:image\/png;base64,/)
  })

  it('renders shape elements by kind', async () => {
    for (const kind of ['rectangle', 'circle', 'triangle', 'line'] as const) {
      const screen = minimalScreen({
        width: 300,
        height: 300,
        background: { type: 'solid', color: '#ffffff' },
        elements: [createShapeElement(kind)],
      })

      const dataUrl = await renderScreenToDataUrl({ screen, assetResolver: noopResolver })
      expect(dataUrl).toMatch(/^data:image\/png;base64,/)
    }
  })

  it('renders a patterned background deterministically', async () => {
    const screen = minimalScreen({
      width: 120,
      height: 120,
      background: {
        type: 'pattern',
        patternKind: 'dots',
        color: '#111111',
        patternColor: '#00ff00',
        patternScale: 24,
      },
      elements: [],
    })

    const first = await renderScreenToDataUrl({ screen, assetResolver: noopResolver })
    const second = await renderScreenToDataUrl({ screen, assetResolver: noopResolver })
    expect(first).toBe(second)
  })

  it('skips invisible elements', async () => {
    const visible = createTextElement({ text: 'Visible', visible: true, zIndex: 0 })
    const hidden = createTextElement({ text: 'Hidden', visible: false, zIndex: 1 })
    const screen = minimalScreen({
      background: { type: 'solid', color: '#ffffff' },
      elements: [visible, hidden],
    })

    const dataUrl = await renderScreenToDataUrl({ screen, assetResolver: noopResolver })
    expect(dataUrl).toMatch(/^data:image\/png;base64,/)
  })

  it('supports transparentBackground without error', async () => {
    const screen = minimalScreen({
      width: 100,
      height: 100,
      background: { type: 'solid', color: '#ff0000' },
      elements: [],
    })

    const dataUrl = await renderScreenToDataUrl({
      screen,
      assetResolver: noopResolver,
      transparentBackground: true,
    })

    expect(dataUrl).toMatch(/^data:image\/png;base64,/)
  })

  it('scales output dimensions via pixelRatio', async () => {
    const screen = minimalScreen({ width: 100, height: 50, elements: [] })
    const canvasSpy = vi.spyOn(document, 'createElement')

    await renderScreenToDataUrl({ screen, assetResolver: noopResolver, pixelRatio: 2 })

    const canvas = canvasSpy.mock.results.find((result) => result.value instanceof HTMLCanvasElement)
      ?.value as HTMLCanvasElement | undefined
    expect(canvas?.width).toBe(200)
    expect(canvas?.height).toBe(100)

    canvasSpy.mockRestore()
  })

  it('returns JPEG data URL when format is jpeg', async () => {
    const screen = minimalScreen({ elements: [] })
    const dataUrl = await renderScreenToDataUrl({
      screen,
      assetResolver: noopResolver,
      format: 'jpeg',
    })
    expect(dataUrl).toMatch(/^data:image\/jpeg;base64,/)
  })
})
