import { buildBackgroundCanvas } from '@/lib/canvas/backgrounds'
import { LruMap } from '@/lib/canvas/perf/lru-map'
import type { BackgroundConfig } from '@/lib/types'

const backgroundCache = new LruMap<string, HTMLCanvasElement>(20)

function cacheKey(
  background: BackgroundConfig,
  width: number,
  height: number,
  imageUrl?: string,
): string {
  return `${width}x${height}::${JSON.stringify(background)}::${imageUrl ?? ''}`
}

export function getCachedBackgroundCanvas(
  background: BackgroundConfig,
  width: number,
  height: number,
  image?: (CanvasImageSource & { width: number; height: number }) | null,
  imageUrl?: string,
): HTMLCanvasElement {
  const key = cacheKey(background, width, height, imageUrl)
  const cached = backgroundCache.get(key)
  if (cached) return cached

  const canvas = buildBackgroundCanvas(background, width, height, image, 1)
  backgroundCache.set(key, canvas)
  return canvas
}

export function clearBackgroundCache(): void {
  backgroundCache.clear()
}
