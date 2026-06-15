import { useEffect, useMemo, useState } from 'react'
import { Group, Image as KonvaImage, Rect } from 'react-konva'
import useImage from 'use-image'
import { getCachedBackgroundCanvas } from '@/lib/canvas/perf/background-cache'
import {
  getCachedScreenSnapshot,
  requestScreenSnapshot,
} from '@/lib/canvas/perf/screen-snapshot-cache'
import { screenContentSignature } from '@/lib/canvas/perf/content-signature'
import type { BackgroundConfig, Screen } from '@/lib/types'

function SnapshotImage({
  dataUrl,
  width,
  height,
}: {
  dataUrl: string
  width: number
  height: number
}) {
  const [image] = useImage(dataUrl)
  if (!image) return null
  return (
    <KonvaImage image={image} width={width} height={height} listening={false} perfectDrawEnabled={false} />
  )
}

interface InactiveScreenArtboardProps {
  screen: Screen
  width: number
  height: number
  background: BackgroundConfig
  assetResolver: (assetId?: string) => string | undefined
  onArtboardBackgroundClick: (additive: boolean) => void
}

export function InactiveScreenArtboard({
  screen,
  width,
  height,
  background,
  assetResolver,
  onArtboardBackgroundClick,
}: InactiveScreenArtboardProps) {
  const signature = useMemo(
    () => screenContentSignature(screen, assetResolver),
    [screen, assetResolver],
  )
  const [snapshotUrl, setSnapshotUrl] = useState<string | undefined>(() =>
    getCachedScreenSnapshot(signature),
  )

  useEffect(() => {
    const cached = getCachedScreenSnapshot(signature)
    if (cached) {
      setSnapshotUrl(cached)
      return
    }
    let cancelled = false
    requestScreenSnapshot(screen, assetResolver, (url) => {
      if (!cancelled) setSnapshotUrl(url)
    })
    return () => {
      cancelled = true
    }
  }, [signature, screen, assetResolver])

  const bgCanvas = useMemo(
    () => getCachedBackgroundCanvas(background, width, height, undefined, undefined),
    [background, width, height],
  )

  return (
    <Group listening={false}>
      {snapshotUrl ? (
        <SnapshotImage dataUrl={snapshotUrl} width={width} height={height} />
      ) : (
        <>
          <Rect
            x={0}
            y={0}
            width={width}
            height={height}
            fill="#ffffff"
            listening={false}
            perfectDrawEnabled={false}
          />
          <KonvaImage
            image={bgCanvas}
            width={width}
            height={height}
            listening={false}
            perfectDrawEnabled={false}
          />
          <Rect
            x={0}
            y={0}
            width={width}
            height={height}
            fill="rgba(148,163,184,0.08)"
            listening={false}
          />
        </>
      )}
      <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill="transparent"
        listening
        onMouseDown={(event) => {
          if (event.target !== event.currentTarget) return
          onArtboardBackgroundClick(event.evt.shiftKey)
        }}
      />
    </Group>
  )
}
