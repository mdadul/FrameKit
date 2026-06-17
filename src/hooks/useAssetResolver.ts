import { useCallback } from 'react'
import { useProjectStore } from '@/stores/project-store'

export function buildAssetResolver(
  assetUrls: Record<string, string>,
): (assetId?: string) => string | undefined {
  return (assetId?: string) => (assetId ? assetUrls[assetId] : undefined)
}

export function useAssetResolver(): (assetId?: string) => string | undefined {
  const assetUrls = useProjectStore((state) => state.assetUrls)
  return useCallback(
    (assetId?: string) => (assetId ? assetUrls[assetId] : undefined),
    [assetUrls],
  )
}
