export type Point = [number, number]

export interface WarpResult {
  canvas: HTMLCanvasElement
  offsetX: number
  offsetY: number
  width: number
  height: number
}

const SUBDIVISIONS = 18

export function hasTilt(tiltX: number, tiltY: number): boolean {
  return Math.abs(tiltX) > 0.01 || Math.abs(tiltY) > 0.01
}

/**
 * Project the flat frame corners through a centered 3D rotation + perspective.
 * Returns corners in flat-frame coordinate space (top-left at 0,0); corners may
 * extend beyond the original box.
 */
export function computeTiltCorners(
  width: number,
  height: number,
  tiltXDeg: number,
  tiltYDeg: number,
  perspectiveStrength: number,
): Point[] {
  const tiltX = (tiltXDeg * Math.PI) / 180
  const tiltY = (tiltYDeg * Math.PI) / 180
  const strength = Math.max(1, perspectiveStrength)
  const distance = (Math.max(width, height) * 2.5) / (strength / 50)

  const cosX = Math.cos(tiltX)
  const sinX = Math.sin(tiltX)
  const cosY = Math.cos(tiltY)
  const sinY = Math.sin(tiltY)

  const flat: Point[] = [
    [0, 0],
    [width, 0],
    [width, height],
    [0, height],
  ]

  return flat.map(([x, y]) => {
    const cx = x - width / 2
    const cy = y - height / 2

    // Rotate around Y axis (z starts at 0)
    const x1 = cx * cosY
    const z1 = cx * sinY
    // Rotate around X axis
    const y2 = cy * cosX - z1 * sinX
    const z2 = cy * sinX + z1 * cosX

    const factor = distance / (distance + z2)
    const px = x1 * factor + width / 2
    const py = y2 * factor + height / 2
    return [px, py] as Point
  })
}

function solveLinearSystem(matrix: number[][], vector: number[]): number[] | null {
  const n = vector.length
  const a = matrix.map((row, i) => [...row, vector[i]])

  for (let col = 0; col < n; col += 1) {
    let pivot = col
    for (let row = col + 1; row < n; row += 1) {
      if (Math.abs(a[row][col]) > Math.abs(a[pivot][col])) pivot = row
    }
    if (Math.abs(a[pivot][col]) < 1e-10) return null
    ;[a[col], a[pivot]] = [a[pivot], a[col]]

    const pivotValue = a[col][col]
    for (let k = col; k <= n; k += 1) a[col][k] /= pivotValue

    for (let row = 0; row < n; row += 1) {
      if (row === col) continue
      const factor = a[row][col]
      for (let k = col; k <= n; k += 1) a[row][k] -= factor * a[col][k]
    }
  }

  return a.map((row) => row[n])
}

export function getPerspectiveMatrix(src: Point[], dst: Point[]): number[] | null {
  const matrix: number[][] = []
  const vector: number[] = []

  for (let i = 0; i < 4; i += 1) {
    const [x, y] = src[i]
    const [u, v] = dst[i]
    matrix.push([x, y, 1, 0, 0, 0, -x * u, -y * u])
    vector.push(u)
    matrix.push([0, 0, 0, x, y, 1, -x * v, -y * v])
    vector.push(v)
  }

  const solution = solveLinearSystem(matrix, vector)
  if (!solution) return null
  return [...solution, 1]
}

function mapPoint(h: number[], x: number, y: number): Point {
  const denom = h[6] * x + h[7] * y + h[8]
  return [
    (h[0] * x + h[1] * y + h[2]) / denom,
    (h[3] * x + h[4] * y + h[5]) / denom,
  ]
}

function drawTexturedTriangle(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  srcW: number,
  srcH: number,
  s: Point[],
  d: Point[],
) {
  ctx.save()
  ctx.beginPath()
  ctx.moveTo(d[0][0], d[0][1])
  ctx.lineTo(d[1][0], d[1][1])
  ctx.lineTo(d[2][0], d[2][1])
  ctx.closePath()
  ctx.clip()

  const sxa = s[1][0] - s[0][0]
  const sya = s[1][1] - s[0][1]
  const sxb = s[2][0] - s[0][0]
  const syb = s[2][1] - s[0][1]
  const det = sxa * syb - sxb * sya
  if (Math.abs(det) < 1e-8) {
    ctx.restore()
    return
  }

  const dxa = d[1][0] - d[0][0]
  const dya = d[1][1] - d[0][1]
  const dxb = d[2][0] - d[0][0]
  const dyb = d[2][1] - d[0][1]

  const a = (dxa * syb - dxb * sya) / det
  const b = (dya * syb - dyb * sya) / det
  const c = (sxa * dxb - sxb * dxa) / det
  const dd = (sxa * dyb - sxb * dya) / det
  const e = d[0][0] - a * s[0][0] - c * s[0][1]
  const f = d[0][1] - b * s[0][0] - dd * s[0][1]

  ctx.transform(a, b, c, dd, e, f)
  ctx.drawImage(image, 0, 0, srcW, srcH)
  ctx.restore()
}

/**
 * Warp a flat source canvas onto the tilted destination corners using a
 * homography, approximated with a subdivided triangle mesh.
 */
export function warpToCorners(
  source: HTMLCanvasElement,
  srcWidth: number,
  srcHeight: number,
  corners: Point[],
  pixelRatio = 2,
): WarpResult {
  const xs = corners.map((c) => c[0])
  const ys = corners.map((c) => c[1])
  const minX = Math.min(...xs)
  const minY = Math.min(...ys)
  const maxX = Math.max(...xs)
  const maxY = Math.max(...ys)
  const bboxW = Math.max(1, maxX - minX)
  const bboxH = Math.max(1, maxY - minY)

  const dst: Point[] = corners.map(([x, y]) => [x - minX, y - minY])
  const src: Point[] = [
    [0, 0],
    [srcWidth, 0],
    [srcWidth, srcHeight],
    [0, srcHeight],
  ]

  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(bboxW * pixelRatio))
  canvas.height = Math.max(1, Math.round(bboxH * pixelRatio))
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return { canvas, offsetX: minX, offsetY: minY, width: bboxW, height: bboxH }
  }
  ctx.scale(pixelRatio, pixelRatio)

  const homography = getPerspectiveMatrix(src, dst)
  if (!homography) {
    ctx.drawImage(source, 0, 0, bboxW, bboxH)
    return { canvas, offsetX: minX, offsetY: minY, width: bboxW, height: bboxH }
  }

  const step = 1 / SUBDIVISIONS
  for (let i = 0; i < SUBDIVISIONS; i += 1) {
    for (let j = 0; j < SUBDIVISIONS; j += 1) {
      const u0 = i * step
      const u1 = (i + 1) * step
      const v0 = j * step
      const v1 = (j + 1) * step

      const sPts: Point[] = [
        [u0 * srcWidth, v0 * srcHeight],
        [u1 * srcWidth, v0 * srcHeight],
        [u1 * srcWidth, v1 * srcHeight],
        [u0 * srcWidth, v1 * srcHeight],
      ]
      const dPts: Point[] = sPts.map(([x, y]) => mapPoint(homography, x, y))

      drawTexturedTriangle(ctx, source, srcWidth, srcHeight, [sPts[0], sPts[1], sPts[2]], [dPts[0], dPts[1], dPts[2]])
      drawTexturedTriangle(ctx, source, srcWidth, srcHeight, [sPts[0], sPts[2], sPts[3]], [dPts[0], dPts[2], dPts[3]])
    }
  }

  return { canvas, offsetX: minX, offsetY: minY, width: bboxW, height: bboxH }
}
