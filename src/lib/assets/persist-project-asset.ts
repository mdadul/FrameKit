import { createAssetFromFile, createAssetObjectUrl } from '@/lib/assets/image-pipeline'
import { saveAsset } from '@/lib/db'
import type { AssetRecord } from '@/lib/types'

export async function persistProjectAsset(
  file: File,
  projectId: string,
  registerAssetUrl: (id: string, url: string) => void,
  type: AssetRecord['type'] = 'screenshot',
): Promise<AssetRecord> {
  const asset = await createAssetFromFile(file, projectId, type)
  await saveAsset(asset)
  registerAssetUrl(asset.id, createAssetObjectUrl(asset))
  return asset
}
