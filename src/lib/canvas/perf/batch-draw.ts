import { useCallback, useEffect, useRef } from 'react'
import type Konva from 'konva'

/** Coalesce multiple batchDraw calls into one per animation frame. */
export function useBatchDraw(stageRef: React.RefObject<Konva.Stage | null>) {
  const frameRef = useRef<number | null>(null)

  const scheduleDraw = useCallback(() => {
    if (frameRef.current !== null) return
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null
      stageRef.current?.batchDraw()
    })
  }, [stageRef])

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    }
  }, [])

  return scheduleDraw
}
