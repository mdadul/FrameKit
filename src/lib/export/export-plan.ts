import { getScreenPlatform } from '@/lib/platform-copy'
import { STORE_PRESETS } from '@/lib/presets/store-sizes'
import { SMART_EXPORT_PRESETS } from '@/lib/export/constants'
import type { Screen, StorePreset } from '@/lib/types'

export interface ExportPlanItem {
  screen: Screen
  preset: StorePreset
}

export interface BuildExportPlanOptions {
  platformAware?: boolean
}

export function resolvePresets(presetIds: string[]): StorePreset[] {
  return presetIds
    .map((id) => STORE_PRESETS.find((preset) => preset.id === id))
    .filter((preset): preset is StorePreset => preset != null)
}

export function buildExportPlan(
  screens: Screen[],
  presetIds: string[],
  options: BuildExportPlanOptions = {},
): ExportPlanItem[] {
  const platformAware = options.platformAware ?? true
  const presets = resolvePresets(presetIds)
  const items: ExportPlanItem[] = []

  for (const screen of screens) {
    const platform = getScreenPlatform(screen)
    const applicable = platformAware
      ? presets.filter((preset) => preset.platform === platform)
      : presets

    for (const preset of applicable) {
      items.push({ screen, preset })
    }
  }

  return items
}

export function getSmartExportPresetIds(): string[] {
  return [...SMART_EXPORT_PRESETS]
}

export function summarizeExportPlan(items: ExportPlanItem[]): {
  totalFiles: number
  appleFiles: number
  androidFiles: number
  presets: StorePreset[]
} {
  const presetMap = new Map<string, StorePreset>()
  let appleFiles = 0
  let androidFiles = 0

  for (const item of items) {
    presetMap.set(item.preset.id, item.preset)
    if (item.preset.platform === 'apple') appleFiles += 1
    else androidFiles += 1
  }

  return {
    totalFiles: items.length,
    appleFiles,
    androidFiles,
    presets: [...presetMap.values()],
  }
}
