import { LruMap } from '@/lib/canvas/perf/lru-map'

const gridCache = new LruMap<string, HTMLCanvasElement>(12)

function cacheKey(width: number, height: number, gridSize: number): string {
  return `${width}x${height}@${gridSize}`
}

/** Single baked canvas for the full artboard grid (replaces hundreds of Line nodes). */
export function buildGridCanvas(
  width: number,
  height: number,
  gridSize: number,
): HTMLCanvasElement {
  const key = cacheKey(width, height, gridSize)
  const cached = gridCache.get(key)
  if (cached) return cached

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas

  ctx.strokeStyle = 'rgba(148,163,184,0.35)'
  ctx.lineWidth = 1
  ctx.beginPath()
  for (let x = 0; x <= width; x += gridSize) {
    ctx.moveTo(x + 0.5, 0)
    ctx.lineTo(x + 0.5, height)
  }
  for (let y = 0; y <= height; y += gridSize) {
    ctx.moveTo(0, y + 0.5)
    ctx.lineTo(width, y + 0.5)
  }
  ctx.stroke()

  gridCache.set(key, canvas)
  return canvas
}
