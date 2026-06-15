import { describe, expect, it } from 'vitest'
import { createScreen } from '@/lib/factories'
import { getScreenPlatform } from '@/lib/platform-copy'
import {
  buildExportPlan,
  getSmartExportPresetIds,
  summarizeExportPlan,
} from '@/lib/export/export-plan'
import { cloneScreenForAndroid } from '@/lib/platform-copy'

describe('buildExportPlan', () => {
  it('pairs iOS screens with Apple presets only when platform-aware', () => {
    const iosScreen = createScreen('iOS 1')
    const androidScreen = cloneScreenForAndroid(iosScreen, 'pixel-9')

    const plan = buildExportPlan([iosScreen, androidScreen], getSmartExportPresetIds(), {
      platformAware: true,
    })

    expect(plan).toHaveLength(2)
    expect(plan.filter((item) => item.preset.platform === 'apple')).toHaveLength(1)
    expect(plan.filter((item) => item.preset.platform === 'android')).toHaveLength(1)
    expect(getScreenPlatform(plan[0].screen)).toBe('apple')
    expect(getScreenPlatform(plan[1].screen)).toBe('android')
  })

  it('exports all presets for every screen when platform-aware is off', () => {
    const screen = createScreen()
    const presetIds = getSmartExportPresetIds()
    const plan = buildExportPlan([screen], presetIds, { platformAware: false })
    expect(plan).toHaveLength(presetIds.length)
  })

  it('summarizes plan file counts', () => {
    const iosScreen = createScreen()
    const androidScreen = cloneScreenForAndroid(iosScreen, 'pixel-9')
    const plan = buildExportPlan([iosScreen, androidScreen], getSmartExportPresetIds())
    const summary = summarizeExportPlan(plan)
    expect(summary.totalFiles).toBe(2)
    expect(summary.appleFiles).toBe(1)
    expect(summary.androidFiles).toBe(1)
  })
})
