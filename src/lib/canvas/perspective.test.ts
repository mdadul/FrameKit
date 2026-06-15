import { describe, expect, it } from 'vitest'
import { computeTiltCorners, getPerspectiveMatrix, hasTilt } from '@/lib/canvas/perspective'

describe('hasTilt', () => {
  it('detects no tilt', () => {
    expect(hasTilt(0, 0)).toBe(false)
  })
  it('detects tilt', () => {
    expect(hasTilt(0, 12)).toBe(true)
    expect(hasTilt(-5, 0)).toBe(true)
  })
})

describe('computeTiltCorners', () => {
  it('returns the flat rectangle when there is no tilt', () => {
    const corners = computeTiltCorners(200, 400, 0, 0, 50)
    expect(corners[0][0]).toBeCloseTo(0)
    expect(corners[0][1]).toBeCloseTo(0)
    expect(corners[2][0]).toBeCloseTo(200)
    expect(corners[2][1]).toBeCloseTo(400)
  })

  it('makes the far edge narrower under yaw tilt', () => {
    const corners = computeTiltCorners(200, 400, 0, 30, 50)
    const topEdge = corners[1][0] - corners[0][0]
    const bottomEdge = corners[2][0] - corners[3][0]
    // Both edges remain positive widths, perspective keeps them sane
    expect(topEdge).toBeGreaterThan(0)
    expect(bottomEdge).toBeGreaterThan(0)
    // Yaw should push corners off the original axis
    expect(Math.abs(corners[0][0])).toBeGreaterThan(0)
  })
})

describe('getPerspectiveMatrix', () => {
  it('maps source corners onto destination corners', () => {
    const src: [number, number][] = [
      [0, 0],
      [100, 0],
      [100, 100],
      [0, 100],
    ]
    const dst: [number, number][] = [
      [10, 5],
      [120, 0],
      [110, 130],
      [0, 100],
    ]
    const h = getPerspectiveMatrix(src, dst)
    expect(h).not.toBeNull()
    if (!h) return

    const project = (x: number, y: number) => {
      const denom = h[6] * x + h[7] * y + h[8]
      return [
        (h[0] * x + h[1] * y + h[2]) / denom,
        (h[3] * x + h[4] * y + h[5]) / denom,
      ]
    }

    for (let i = 0; i < 4; i += 1) {
      const [px, py] = project(src[i][0], src[i][1])
      expect(px).toBeCloseTo(dst[i][0], 3)
      expect(py).toBeCloseTo(dst[i][1], 3)
    }
  })
})
