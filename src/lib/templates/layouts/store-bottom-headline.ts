import { DEFAULT_DEVICE_X } from '@/lib/constants'
import { bgSolid, deviceEl, textEl } from '@/lib/templates/helpers'
import {
  floatingCompareCard,
  themeTogglePill,
} from '@/lib/templates/store-showcase'
import type { LayoutBuildInput, LayoutBuildResult } from '@/lib/templates/types'

/** Dark Mode — centered device, floating compare card, bottom headline */
export function buildStoreBottomHeadline(input: LayoutBuildInput): LayoutBuildResult {
  const accent = input.accentSecondary ?? input.accent
  return {
    background: bgSolid('#ffffff'),
    elements: [
      deviceEl({
        name: 'Device',
        colorVariant: input.colorVariant ?? 'black',
        x: DEFAULT_DEVICE_X,
        y: 280,
      }),
      ...themeTogglePill(780, 720, accent),
      ...floatingCompareCard(720, 800, 340, 420, accent, 12),
      textEl({
        name: 'Title',
        text: input.title,
        x: 80,
        y: 2280,
        width: 1130,
        height: 160,
        fontFamily: input.headlineFont ?? 'Inter',
        fontSize: 100,
        fontWeight: 800,
        fill: '#0f172a',
        textAlign: 'center',
        letterSpacing: -2,
        lineHeight: 1.05,
      }),
      textEl({
        name: 'Subtitle',
        text: input.subtitle,
        x: 140,
        y: 2450,
        width: 1010,
        height: 80,
        fontFamily: input.subtitleFont ?? 'Inter',
        fontSize: 34,
        fontWeight: 400,
        fill: '#334155',
        textAlign: 'center',
        lineHeight: 1.3,
      }),
    ],
  }
}
