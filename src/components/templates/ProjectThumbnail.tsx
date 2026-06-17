import { useEffect, useMemo, useState } from 'react'
import { screenContentSignature } from '@/lib/canvas/perf/content-signature'
import { renderScreenToDataUrl } from '@/lib/export/renderer'
import { TemplatePreviewFrame } from '@/components/templates/TemplatePreviewFrame'
import type { Screen } from '@/lib/types'

const thumbnailCache = new Map<string, string>()

interface ProjectThumbnailProps {
  screen: Screen
  assetResolver: (assetId?: string) => string | undefined
  className?: string
}

export function ProjectThumbnail({ screen, assetResolver, className }: ProjectThumbnailProps) {
  const signature = useMemo(
    () => screenContentSignature(screen, assetResolver),
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
    <TemplatePreviewFrame
      aspectRatio={`${screen.width} / ${screen.height}`}
      className={className}
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
    </TemplatePreviewFrame>
  )
}
