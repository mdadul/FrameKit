import { useEffect, type RefObject } from 'react'
import type Konva from 'konva'
import { exportActiveScreenBlobFromStage } from '@/lib/canvas/konva-export'
import { useEditorStore } from '@/stores/editor-store'

interface UseKonvaStageBridgeOptions {
  stageRef: RefObject<Konva.Stage | null>
  activeScreenId: string | null
}

export function useKonvaStageBridge({ stageRef, activeScreenId }: UseKonvaStageBridgeOptions) {
  const setKonvaStageBridge = useEditorStore((state) => state.setKonvaStageBridge)

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) {
      setKonvaStageBridge(null)
      return
    }

    setKonvaStageBridge({
      activeScreenId,
      exportActiveScreen: async (screenId, options) => {
        const currentStage = stageRef.current
        if (!currentStage || screenId !== activeScreenId) return null
        return exportActiveScreenBlobFromStage(
          { stage: currentStage, screenId, isActiveOnCanvas: true },
          options,
        )
      },
    })

    return () => setKonvaStageBridge(null)
  }, [activeScreenId, setKonvaStageBridge, stageRef])
}
