import { describe, expect, it } from 'vitest'
import { createScreen } from '@/lib/factories'
import { computePlatformLayout, PLATFORM_ROW_GAP, WORKSPACE_PADDING } from '@/lib/canvas/workspace-layout'
import { cloneScreenForAndroid } from '@/lib/platform-copy'

describe('computePlatformLayout', () => {
  it('places android copies on a second row aligned to their iOS source', () => {
    const iosA = createScreen('A')
    iosA.width = 1000
    iosA.height = 2000
    const iosB = createScreen('B')
    iosB.width = 1000
    iosB.height = 2000

    const androidA = cloneScreenForAndroid(iosA, 'pixel-9')
    const layout = computePlatformLayout([iosA, iosB, androidA])

    expect(layout[iosA.id]).toEqual({ x: WORKSPACE_PADDING, y: WORKSPACE_PADDING })
    expect(layout[iosB.id]?.x).toBe(WORKSPACE_PADDING + iosA.width + 80)
    expect(layout[androidA.id]?.x).toBe(layout[iosA.id]?.x)
    expect(layout[androidA.id]?.y).toBe(WORKSPACE_PADDING + iosA.height + PLATFORM_ROW_GAP)
  })
})
