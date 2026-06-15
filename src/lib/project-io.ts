import { blobToDataUrl } from '@/lib/utils'
import { getAsset, getProjectAssets, saveAsset } from '@/lib/db'
import type { Project, SSGProjectFile } from '@/lib/types'

export async function exportProjectFile(project: Project): Promise<Blob> {
  const assets = await getProjectAssets(project.id)
  const assetPayload = await Promise.all(
    assets.map(async (asset) => ({
      id: asset.id,
      name: asset.name,
      type: asset.type,
      mimeType: asset.mimeType,
      data: await blobToDataUrl(asset.blob),
    })),
  )

  const payload: SSGProjectFile = {
    version: 1,
    name: project.name,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    screens: project.screens,
    settings: project.settings,
    assets: assetPayload,
  }

  return new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  })
}

export async function importProjectFile(file: File): Promise<Project> {
  const text = await file.text()
  const payload = JSON.parse(text) as SSGProjectFile
  if (payload.version !== 1) {
    throw new Error('Unsupported project version')
  }

  const project: Project = {
    version: 1,
    id: crypto.randomUUID(),
    name: payload.name,
    createdAt: payload.createdAt,
    updatedAt: new Date().toISOString(),
    screens: payload.screens,
    settings: payload.settings,
  }

  if (payload.assets) {
    for (const asset of payload.assets) {
      const response = await fetch(asset.data)
      const blob = await response.blob()
      await saveAsset({
        id: asset.id,
        projectId: project.id,
        name: asset.name,
        type: asset.type,
        mimeType: asset.mimeType,
        blob,
        createdAt: new Date().toISOString(),
      })
    }
  }

  return project
}

export async function resolveAssetSrc(
  assetId: string | undefined,
  assetUrls: Record<string, string>,
): Promise<string | undefined> {
  if (!assetId) return undefined
  if (assetUrls[assetId]) return assetUrls[assetId]
  const asset = await getAsset(assetId)
  if (!asset) return undefined
  const url = URL.createObjectURL(asset.blob)
  return url
}
