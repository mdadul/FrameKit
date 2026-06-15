import { useEffect, useMemo, useState } from 'react'
import { renderScreenToDataUrl } from '@/lib/export/renderer'
import type { Screen } from '@/lib/types'

const thumbnailCache = new Map<string, string>()

function getContentSignature(
  screen: Screen,
  assetResolver: (assetId?: string) => string | undefined,
): string {
  const assetIds: string[] = []
  if (screen.background.imageAssetId) assetIds.push(screen.background.imageAssetId)
  for (const element of screen.elements) {
    if (element.type === 'image' && element.assetId) assetIds.push(element.assetId)
    if (element.type === 'device' && element.screenshotAssetId) {
      assetIds.push(element.screenshotAssetId)
    }
  }
  const assetSignature = assetIds.map((id) => `${id}=${assetResolver(id) ?? ''}`).join('|')
  return `${JSON.stringify(screen)}::${assetSignature}`
}

interface ProjectThumbnailProps {
  screen: Screen
  assetResolver: (assetId?: string) => string | undefined
  className?: string
}

export function ProjectThumbnail({ screen, assetResolver, className }: ProjectThumbnailProps) {
  const signature = useMemo(
    () => getContentSignature(screen, assetResolver),
    [screen, assetResolver],
  )
  const cacheKey = `${screen.id}::${signature}`
  const cached = thumbnailCache.get(cacheKey)
  const [generated, setGenerated] = useState<{ key: string; url: string } | null>(null)

  const dataUrl = cached ?? (generated?.key === cacheKey ? generated.url : undefined)

  useEffect(() => {
    if (thumbnailCache.has(cacheKey)) return
    let cancelled = false
    void renderScreenToDataUrl({ screen, assetResolver, scale: 1, format: 'png' })
      .then((url) => {
        if (cancelled) return
        thumbnailCache.set(cacheKey, url)
        setGenerated({ key: cacheKey, url })
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [cacheKey, screen, assetResolver])

  return (
    <div
      className={className}
      style={{ aspectRatio: `${screen.width} / ${screen.height}` }}
    >
      {dataUrl ? (
        <img
          src={dataUrl}
          alt=""
          className="h-full w-full rounded-md object-cover"
          draggable={false}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">
          …
        </div>
      )}
    </div>
  )
}

export function buildAssetResolver(
  assetUrls: Record<string, string>,
): (assetId?: string) => string | undefined {
  return (assetId?: string) => (assetId ? assetUrls[assetId] : undefined)
}
