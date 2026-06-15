import { useCallback } from 'react'
import { persistProjectAsset } from '@/lib/assets/persist-project-asset'
import { useProjectStore } from '@/stores/project-store'
import type { AssetRecord } from '@/lib/types'

export function usePersistAssetUpload() {
  const project = useProjectStore((state) => state.project)
  const registerAssetUrl = useProjectStore((state) => state.registerAssetUrl)

  return useCallback(
    async (file: File, type: AssetRecord['type'] = 'screenshot') => {
      if (!project) {
        throw new Error('No active project')
      }
      return persistProjectAsset(file, project.id, registerAssetUrl, type)
    },
    [project, registerAssetUrl],
  )
}
