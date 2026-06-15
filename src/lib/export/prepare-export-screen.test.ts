import { describe, expect, it } from 'vitest'
import { prepareExportScreen } from '@/lib/export/prepare-export-screen'
import { minimalScreen } from '@/test/fixtures/minimal-screen'

describe('prepareExportScreen', () => {
  it('resizes screen dimensions for export preset', () => {
    const screen = minimalScreen()
    const prepared = prepareExportScreen(screen, { width: 1080, height: 1920 }, 'fit')

    expect(prepared.width).toBe(1080)
    expect(prepared.height).toBe(1920)
    expect(prepared.elements).toHaveLength(screen.elements.length)
    expect(prepared.id).toBe(screen.id)
  })

  it('preserves element count after resize', () => {
    const screen = minimalScreen()
    const prepared = prepareExportScreen(screen, { width: 500, height: 500 }, 'fill')
    expect(prepared.elements).toHaveLength(1)
  })
})
