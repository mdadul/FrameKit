import { renderScreenToDataUrl } from '@/lib/export/renderer'
import { LruMap } from '@/lib/canvas/perf/lru-map'
import { screenContentSignature } from '@/lib/canvas/perf/content-signature'
import { enqueueThumbnailTask } from '@/lib/canvas/perf/thumbnail-queue'
import type { Screen } from '@/lib/types'

const snapshotCache = new LruMap<string, string>(15)
const pending = new Set<string>()

export function getCachedScreenSnapshot(key: string): string | undefined {
  return snapshotCache.get(key)
}

export function requestScreenSnapshot(
  screen: Screen,
  assetResolver: (assetId?: string) => string | undefined,
  onReady: (dataUrl: string) => void,
): void {
  const key = screenContentSignature(screen, assetResolver)
  const cached = snapshotCache.get(key)
  if (cached) {
    onReady(cached)
    return
  }
  if (pending.has(key)) return

  pending.add(key)
  enqueueThumbnailTask(async () => {
    try {
      const dataUrl = await renderScreenToDataUrl({
        screen,
        assetResolver,
        scale: 0.25,
        format: 'jpeg',
      })
      snapshotCache.set(key, dataUrl)
      onReady(dataUrl)
    } finally {
      pending.delete(key)
    }
  })
}

export function clearScreenSnapshotCache(): void {
  snapshotCache.clear()
  pending.clear()
}
