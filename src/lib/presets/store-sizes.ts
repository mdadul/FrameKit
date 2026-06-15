import type { StorePreset } from '@/lib/types'

export const STORE_PRESETS: StorePreset[] = [
  {
    id: 'apple-6-7',
    name: 'Apple 6.7"',
    platform: 'apple',
    width: 1290,
    height: 2796,
  },
  {
    id: 'apple-6-9',
    name: 'Apple 6.9"',
    platform: 'apple',
    width: 1320,
    height: 2868,
  },
  {
    id: 'apple-6-5',
    name: 'Apple 6.5"',
    platform: 'apple',
    width: 1284,
    height: 2778,
  },
  {
    id: 'apple-5-5',
    name: 'Apple 5.5"',
    platform: 'apple',
    width: 1242,
    height: 2208,
  },
  {
    id: 'apple-ipad-12-9',
    name: 'Apple iPad 12.9"',
    platform: 'apple',
    width: 2048,
    height: 2732,
  },
  {
    id: 'android-phone',
    name: 'Android Phone',
    platform: 'android',
    width: 1080,
    height: 1920,
  },
  {
    id: 'android-tablet',
    name: 'Android Tablet',
    platform: 'android',
    width: 1600,
    height: 2560,
  },
  {
    id: 'android-feature-graphic',
    name: 'Play Store Feature Graphic',
    platform: 'android',
    width: 1024,
    height: 500,
  },
]

export function getPreset(id: string): StorePreset | undefined {
  return STORE_PRESETS.find((preset) => preset.id === id)
}
