import { describe, expect, it, vi } from 'vitest'
import { loadProjectAssetUrls } from '@/hooks/useProjectsCatalog'
import type { Project } from '@/lib/types'

vi.mock('@/lib/db', () => ({
  getProjectAssets: vi.fn(async (projectId: string) => [
    { id: `${projectId}-asset`, projectId, type: 'screenshot', name: 'shot.png', mimeType: 'image/png', size: 1, createdAt: '' },
  ]),
}))

vi.mock('@/lib/assets/image-pipeline', () => ({
  createAssetObjectUrl: vi.fn((asset: { id: string }) => `blob:${asset.id}`),
}))

describe('loadProjectAssetUrls', () => {
  it('builds per-project asset url maps', async () => {
    const projects = [
      { id: 'p1', name: 'One' } as Project,
      { id: 'p2', name: 'Two' } as Project,
    ]

    const urls = await loadProjectAssetUrls(projects)

    expect(urls).toEqual({
      p1: { 'p1-asset': 'blob:p1-asset' },
      p2: { 'p2-asset': 'blob:p2-asset' },
    })
  })
})
