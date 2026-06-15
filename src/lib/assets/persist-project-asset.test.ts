import { describe, expect, it, vi, beforeEach } from 'vitest'
import { persistProjectAsset } from '@/lib/assets/persist-project-asset'

vi.mock('@/lib/assets/image-pipeline', () => ({
  createAssetFromFile: vi.fn(async (file: File, projectId: string, type: string) => ({
    id: 'asset-1',
    projectId,
    name: file.name,
    type,
    blob: file,
    mimeType: file.type,
    createdAt: '2026-01-01T00:00:00.000Z',
  })),
  createAssetObjectUrl: vi.fn(() => 'blob:mock-url'),
}))

vi.mock('@/lib/db', () => ({
  saveAsset: vi.fn(async () => undefined),
}))

import { createAssetFromFile, createAssetObjectUrl } from '@/lib/assets/image-pipeline'
import { saveAsset } from '@/lib/db'

describe('persistProjectAsset', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('persists asset and registers object url', async () => {
    const file = new File(['pixels'], 'shot.png', { type: 'image/png' })
    const registerAssetUrl = vi.fn()

    const asset = await persistProjectAsset(file, 'project-1', registerAssetUrl, 'screenshot')

    expect(createAssetFromFile).toHaveBeenCalledWith(file, 'project-1', 'screenshot')
    expect(saveAsset).toHaveBeenCalledWith(asset)
    expect(createAssetObjectUrl).toHaveBeenCalledWith(asset)
    expect(registerAssetUrl).toHaveBeenCalledWith('asset-1', 'blob:mock-url')
    expect(asset.id).toBe('asset-1')
  })
})
