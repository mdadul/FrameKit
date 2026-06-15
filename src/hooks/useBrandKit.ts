import { useMemo } from 'react'
import { DEFAULT_BRAND_KIT } from '@/lib/constants'
import { useProjectStore } from '@/stores/project-store'
import { useSettingsStore } from '@/stores/settings-store'
import type { BrandKit } from '@/lib/types'

export function useBrandKit(): BrandKit {
  const project = useProjectStore((state) => state.project)
  const globalBrandKit = useSettingsStore((state) => state.preferences.brandKit)

  return useMemo(
    () => project?.settings.brandKitOverride ?? globalBrandKit ?? DEFAULT_BRAND_KIT,
    [project?.settings.brandKitOverride, globalBrandKit],
  )
}

export function useBrandKitActions() {
  const updateProject = useProjectStore((state) => state.updateProject)

  const updateBrandKit = (patch: Partial<BrandKit>) => {
    updateProject((project) => {
      const current = project.settings.brandKitOverride ?? DEFAULT_BRAND_KIT
      project.settings.brandKitOverride = { ...current, ...patch }
    })
  }

  const resetToGlobal = () => {
    updateProject((project) => {
      delete project.settings.brandKitOverride
    })
  }

  const hasOverride = useProjectStore(
    (state) => state.project?.settings.brandKitOverride != null,
  )

  return { updateBrandKit, resetToGlobal, hasOverride }
}
