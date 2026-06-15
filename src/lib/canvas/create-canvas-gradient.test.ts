import { describe, expect, it, vi } from 'vitest'
import { createCanvasGradient } from '@/lib/canvas/create-canvas-gradient'

function createMockContext() {
  const gradient = {
    stops: [] as Array<{ offset: number; color: string }>,
    addColorStop(offset: number, color: string) {
      this.stops.push({ offset, color })
    },
  }

  return {
    createLinearGradient: vi.fn(() => gradient),
    createRadialGradient: vi.fn(() => gradient),
    gradient,
  } as unknown as CanvasRenderingContext2D & {
    gradient: { stops: Array<{ offset: number; color: string }> }
  }
}

describe('createCanvasGradient', () => {
  it('creates a linear gradient with color stops', () => {
    const context = createMockContext()

    const gradient = createCanvasGradient(
      context,
      {
        type: 'linear',
        angle: 180,
        stops: [
          { offset: 0, color: '#000000' },
          { offset: 1, color: '#ffffff' },
        ],
      },
      100,
      100,
    )

    expect(gradient).toBeTruthy()
    expect(context.createLinearGradient).toHaveBeenCalled()
    expect(context.gradient.stops).toEqual([
      { offset: 0, color: '#000000' },
      { offset: 1, color: '#ffffff' },
    ])
  })

  it('creates a radial gradient', () => {
    const context = createMockContext()

    const gradient = createCanvasGradient(
      context,
      {
        type: 'radial',
        stops: [{ offset: 0, color: '#ff0000' }],
      },
      200,
      200,
    )

    expect(gradient).toBeTruthy()
    expect(context.createRadialGradient).toHaveBeenCalled()
    expect(context.gradient.stops).toEqual([{ offset: 0, color: '#ff0000' }])
  })

  it('returns null when there are no stops', () => {
    const context = createMockContext()

    expect(
      createCanvasGradient(context, { type: 'linear', stops: [] }, 100, 100),
    ).toBeNull()
  })
})
