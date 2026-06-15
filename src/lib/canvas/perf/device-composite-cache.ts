import { renderDeviceComposite, type DeviceRenderResult } from '@/lib/canvas/device-render'
import { LruMap } from '@/lib/canvas/perf/lru-map'
import type { DeviceElement } from '@/lib/types'
import type { ScreenshotSource } from '@/lib/canvas/device-frame'

const compositeCache = new LruMap<string, DeviceRenderResult>(40)

function cacheKey(element: DeviceElement, screenshotKey: string, pixelRatio: number): string {
  return [
    element.deviceId,
    element.colorVariant ?? '',
    element.width,
    element.height,
    element.showFrame !== false,
    element.screenshotFit ?? 'cover',
    element.tiltX ?? 0,
    element.tiltY ?? 0,
    element.perspective ?? 50,
    screenshotKey,
    pixelRatio,
  ].join('::')
}

function isScreenshotLoaded(screenshot: ScreenshotSource): boolean {
  return Boolean(screenshot && screenshot.width > 0 && screenshot.height > 0)
}

function screenshotCacheKey(
  element: DeviceElement,
  screenshot: ScreenshotSource,
  screenshotKey: string,
): string {
  if (!element.screenshotAssetId && !screenshotKey) return ''
  if (!isScreenshotLoaded(screenshot)) return `${screenshotKey}:pending`
  return `${screenshotKey}:${screenshot!.width}x${screenshot!.height}`
}

export function getCachedDeviceComposite(
  element: DeviceElement,
  screenshot: ScreenshotSource,
  screenshotKey: string,
  pixelRatio = 2,
): DeviceRenderResult | null {
  const loadedKey = screenshotCacheKey(element, screenshot, screenshotKey)
  const key = cacheKey(element, loadedKey, pixelRatio)
  const screenshotPending =
    Boolean(element.screenshotAssetId || screenshotKey) && !isScreenshotLoaded(screenshot)

  if (!screenshotPending) {
    const cached = compositeCache.get(key)
    if (cached) return cached
  }

  const result = renderDeviceComposite(element, screenshot, pixelRatio)
  if (result && !screenshotPending) {
    compositeCache.set(key, result)
  }
  return result
}

export function clearDeviceCompositeCache(): void {
  compositeCache.clear()
}
