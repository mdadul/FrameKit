import { useEffect, useState } from 'react'
import { isPerfOverlayEnabled } from '@/lib/canvas/perf/konva-config'

interface CanvasPerfOverlayProps {
  elementCount: number
  screenCount: number
  zoom: number
}

export function CanvasPerfOverlay({ elementCount, screenCount, zoom }: CanvasPerfOverlayProps) {
  const [enabled] = useState(isPerfOverlayEnabled)
  const [fps, setFps] = useState(0)

  useEffect(() => {
    if (!enabled) return
    let count = 0
    let last = performance.now()
    let handle = 0
    const tick = (now: number) => {
      count++
      if (now - last >= 1000) {
        setFps(count)
        count = 0
        last = now
      }
      handle = requestAnimationFrame(tick)
    }
    handle = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(handle)
  }, [enabled])

  if (!enabled) return null

  return (
    <div className="pointer-events-none absolute top-2 right-2 z-30 rounded-md border border-border/80 bg-card/95 px-2.5 py-1.5 font-mono text-[10px] text-foreground shadow-sm backdrop-blur-sm">
      <div>FPS {fps}</div>
      <div>
        {elementCount} els · {screenCount} screens
      </div>
      <div>Zoom {Math.round(zoom * 100)}%</div>
      <div className="text-muted-foreground">?perf=1</div>
    </div>
  )
}
