import { describe, expect, it, vi } from 'vitest'
import { drawImageWithObjectFit } from '@/lib/canvas/image-fit'

function createMockContext() {
  return {
    drawImage: vi.fn(),
    fillRect: vi.fn(),
    fillStyle: '',
  } as unknown as CanvasRenderingContext2D
}

describe('drawImageWithObjectFit', () => {
  const image = {} as CanvasImageSource
  const source = { x: 0, y: 0, width: 200, height: 100 }

  it('stretches to fill the destination for fill mode', () => {
    const context = createMockContext()
    drawImageWithObjectFit(
      context,
      image,
      source,
      { x: 10, y: 20, width: 300, height: 150 },
      'fill',
    )
    expect(context.drawImage).toHaveBeenCalledWith(image, 0, 0, 200, 100, 10, 20, 300, 150)
  })

  it('letterboxes contain mode when requested', () => {
    const context = createMockContext()
    drawImageWithObjectFit(
      context,
      image,
      source,
      { x: 0, y: 0, width: 200, height: 200 },
      'contain',
      { letterboxFill: '#000000' },
    )
    expect(context.fillRect).toHaveBeenCalledWith(0, 0, 200, 200)
    expect(context.drawImage).toHaveBeenCalled()
  })

  it('covers destination preserving aspect ratio', () => {
    const context = createMockContext()
    drawImageWithObjectFit(
      context,
      image,
      source,
      { x: 0, y: 0, width: 200, height: 200 },
      'cover',
    )
    const call = vi.mocked(context.drawImage).mock.calls[0]
    const drawWidth = call[7] as number
    const drawHeight = call[8] as number
    expect(drawWidth).toBeGreaterThanOrEqual(200)
    expect(drawHeight).toBeGreaterThanOrEqual(200)
  })

  it('no-ops when source dimensions are zero', () => {
    const context = createMockContext()
    drawImageWithObjectFit(
      context,
      image,
      { x: 0, y: 0, width: 0, height: 100 },
      { x: 0, y: 0, width: 100, height: 100 },
      'cover',
    )
    expect(context.drawImage).not.toHaveBeenCalled()
  })
})
