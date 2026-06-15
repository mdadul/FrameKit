import { DEFAULT_DEVICE_X } from '@/lib/constants'
import { bgLinear } from '@/lib/templates/helpers'
import { deviceEl, shapeEl, textEl } from '@/lib/templates/helpers'
import {
  appIconBadge,
  featureBulletRow,
  starRatingRow,
} from '@/lib/templates/decorations'
import type { LayoutBuildInput, LayoutBuildResult } from '@/lib/templates/types'

const DEFAULT_FEATURES: [string, string, string] = [
  'Fast, intuitive workflow',
  'Syncs across all devices',
  'Private and secure by default',
]

export function buildClassicHero(input: LayoutBuildInput): LayoutBuildResult {
  const secondary = input.accentSecondary ?? '#0f172a'
  const features = input.features ?? DEFAULT_FEATURES
  return {
    background: bgLinear(145, [
      { offset: 0, color: input.accent },
      { offset: 1, color: secondary },
    ]),
    elements: [
      ...appIconBadge(90, 148, 76, '#ffffff'),
      textEl({
        name: 'Title',
        text: input.title,
        x: 90,
        y: 248,
        width: 1110,
        height: 140,
        fontFamily: input.headlineFont ?? 'Poppins',
        fontSize: 88,
        fontWeight: 800,
        fill: '#ffffff',
        textAlign: 'left',
        letterSpacing: -1,
        lineHeight: 1.1,
        shadow: { enabled: true, offsetX: 0, offsetY: 4, blur: 24, color: 'rgba(0,0,0,0.25)' },
      }),
      textEl({
        name: 'Subtitle',
        text: input.subtitle,
        x: 90,
        y: 400,
        width: 900,
        height: 100,
        fontFamily: input.subtitleFont ?? 'Inter',
        fontSize: 34,
        fontWeight: 400,
        fill: '#e2e8f0',
        opacity: 0.92,
        lineHeight: 1.35,
      }),
      shapeEl({
        name: 'Accent',
        shapeKind: 'rectangle',
        x: 90,
        y: 510,
        width: 200,
        height: 8,
        fill: { type: 'solid', color: '#ffffff' },
        cornerRadius: 8,
      }),
      ...featureBulletRow(540, '#ffffff', features, { textColor: '#f1f5f9' }),
      ...starRatingRow(90, 720, '#fbbf24', input.rating ?? '4.9 · Loved by users'),
      deviceEl({
        name: 'Device',
        colorVariant: input.colorVariant,
        x: DEFAULT_DEVICE_X,
        y: 796,
      }),
    ],
  }
}
