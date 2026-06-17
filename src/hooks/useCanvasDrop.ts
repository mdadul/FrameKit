import { useCallback } from 'react'
import { findScreenAtPoint } from '@/lib/canvas/workspace-layout'
import { workspaceToScreenLocal } from '@/lib/canvas/coordinates'
import { createImageElement, sortElementsByZIndex } from '@/lib/factories'
import { getImageFilesFromDataTransfer, hasImageFiles } from '@/lib/assets/drag-files'
import { usePersistAssetUpload } from '@/hooks/usePersistAssetUpload'
import { useEditorStore } from '@/stores/editor-store'
import { useProjectStore } from '@/stores/project-store'
import type { Screen } from '@/lib/types'

interface UseCanvasDropOptions {
  screens: Screen[]
  clientToWorkspace: (clientX: number, clientY: number) => { x: number; y: number } | null
}

export function useCanvasDrop({ screens, clientToWorkspace }: UseCanvasDropOptions) {
  const screenLayout = useEditorStore((state) => state.screenLayout)
  const setActiveScreenId = useEditorStore((state) => state.setActiveScreenId)
  const uploadAsset = usePersistAssetUpload()
  const project = useProjectStore((state) => state.project)
  const updateElement = useProjectStore((state) => state.updateElement)
  const addElement = useProjectStore((state) => state.addElement)

  const handleDrop = useCallback(
    async (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      const point = clientToWorkspace(event.clientX, event.clientY)
      if (!point || !project) return
      const targetScreen = findScreenAtPoint(point, screens, screenLayout)
      if (!targetScreen) return

      setActiveScreenId(targetScreen.id)

      const files = getImageFilesFromDataTransfer(event.dataTransfer)
      if (files.length === 0) return

      const localPoint = workspaceToScreenLocal(point, screenLayout, targetScreen.id)

      const targetDevice = sortElementsByZIndex(
        targetScreen.elements.filter(
          (item) =>
            item.type === 'device' &&
            localPoint.x >= item.x &&
            localPoint.x <= item.x + item.width &&
            localPoint.y >= item.y &&
            localPoint.y <= item.y + item.height,
        ),
        'desc',
      )[0]

      for (const file of files) {
        const asset = await uploadAsset(file, 'screenshot')

        if (targetDevice) {
          updateElement(targetDevice.id, { screenshotAssetId: asset.id })
          break
        }

        addElement(
          createImageElement({
            assetId: asset.id,
            name: file.name,
            x: localPoint.x - 200,
            y: localPoint.y - 200,
          }),
        )
      }
    },
    [
      addElement,
      clientToWorkspace,
      project,
      screenLayout,
      screens,
      setActiveScreenId,
      updateElement,
      uploadAsset,
    ],
  )

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    if (hasImageFiles(event)) {
      event.preventDefault()
      event.dataTransfer.dropEffect = 'copy'
    }
  }, [])

  return { handleDrop, handleDragOver }
}
