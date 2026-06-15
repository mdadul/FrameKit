import { DEFAULT_DEVICE_X } from '@/lib/constants'
import { bgSolid, deviceEl, textEl } from '@/lib/templates/helpers'
import { flameSticker, heartSticker } from '@/lib/templates/store-showcase'
import type { LayoutBuildInput, LayoutBuildResult } from '@/lib/templates/types'

/** Useful. Social. Expressive. — bold brand color, stacked headline, playful stickers */
export function buildStoreBoldBrand(input: LayoutBuildInput): LayoutBuildResult {
  const brandColor = input.accent
  return {
    background: bgSolid(brandColor),
    elements: [
      ...heartSticker(920, 100, 200),
      textEl({
        name: 'Title',
        text: input.title,
        x: 80,
        y: 120,
        width: 700,
        height: 360,
        fontFamily: input.headlineFont ?? 'Inter',
        fontSize: 104,
        fontWeight: 800,
        fill: '#ffffff',
        textAlign: 'left',
        letterSpacing: -2,
        lineHeight: 1.02,
      }),
      textEl({
        name: 'Subtitle',
        text: input.subtitle,
        x: 80,
        y: 500,
        width: 700,
        height: 80,
        fontFamily: input.subtitleFont ?? 'Inter',
        fontSize: 28,
        fontWeight: 400,
        fill: 'rgba(255,255,255,0.82)',
        lineHeight: 1.35,
        opacity: input.subtitle ? 0.9 : 0,
      }),
      deviceEl({
        name: 'Device',
        colorVariant: input.colorVariant ?? 'white',
        x: DEFAULT_DEVICE_X,
        y: 620,
      }),
      ...flameSticker(120, 720, 160, -14),
    ],
  }
}
