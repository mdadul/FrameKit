import { createId } from '@/lib/utils'
import type { AssetRecord } from '@/lib/types'

const MAX_IMAGE_EDGE = 4096

export async function compressImageFile(file: File): Promise<Blob> {
  if (!file.type.startsWith('image/')) {
    return file
  }

  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) return file

  context.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/webp', 0.9),
  )

  return blob ?? file
}

export async function createAssetFromFile(
  file: File,
  projectId: string,
  type: AssetRecord['type'] = 'screenshot',
): Promise<AssetRecord> {
  const blob = await compressImageFile(file)
  return {
    id: createId(),
    projectId,
    name: file.name,
    type,
    blob,
    mimeType: blob.type || file.type,
    createdAt: new Date().toISOString(),
  }
}

export function createAssetObjectUrl(asset: AssetRecord): string {
  return URL.createObjectURL(asset.blob)
}
