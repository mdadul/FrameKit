import { DEFAULT_DEVICE_X } from '@/lib/constants'
import { bgLinear, deviceEl, shapeEl, textEl } from '@/lib/templates/helpers'
import { featureBulletRow, mockCardContent } from '@/lib/templates/decorations'
import type { LayoutBuildInput, LayoutBuildResult } from '@/lib/templates/types'

const DEFAULT_FEATURES: [string, string, string] = [
  'Curated for your needs',
  'One-tap actions',
  'Always up to date',
]

export function buildFeatureCards(input: LayoutBuildInput): LayoutBuildResult {
  const secondary = input.accentSecondary ?? '#312e81'
  const features = input.features ?? DEFAULT_FEATURES
  return {
    background: bgLinear(135, [
      { offset: 0, color: input.accent },
      { offset: 1, color: secondary },
    ]),
    elements: [
      textEl({
        name: 'Title',
        text: input.title,
        x: 90,
        y: 150,
        width: 1110,
        height: 130,
        fontFamily: input.headlineFont ?? 'Poppins',
        fontSize: 84,
        fontWeight: 800,
        fill: '#ffffff',
        letterSpacing: -0.5,
        lineHeight: 1.12,
      }),
      textEl({
        name: 'Subtitle',
        text: input.subtitle,
        x: 90,
        y: 290,
        width: 800,
        height: 80,
        fontFamily: input.subtitleFont ?? 'Inter',
        fontSize: 30,
        fontWeight: 400,
        fill: '#c7d2fe',
        opacity: 0.95,
        lineHeight: 1.35,
      }),
      ...featureBulletRow(390, '#ffffff', features, { textColor: '#e0e7ff' }),
      shapeEl({
        name: 'CardBack',
        shapeKind: 'rectangle',
        x: 180,
        y: 720,
        width: 420,
        height: 280,
        fill: { type: 'solid', color: 'rgba(255,255,255,0.12)' },
        cornerRadius: 24,
        opacity: 0.9,
      }),
      ...mockCardContent(180, 720, 420, 280, '#ffffff'),
      shapeEl({
        name: 'CardMid',
        shapeKind: 'rectangle',
        x: 340,
        y: 640,
        width: 480,
        height: 300,
        fill: { type: 'solid', color: 'rgba(255,255,255,0.18)' },
        cornerRadius: 28,
      }),
      ...mockCardContent(340, 640, 480, 300, '#ffffff'),
      shapeEl({
        name: 'CardFront',
        shapeKind: 'rectangle',
        x: 520,
        y: 580,
        width: 500,
        height: 320,
        fill: { type: 'solid', color: 'rgba(255,255,255,0.25)' },
        cornerRadius: 32,
      }),
      ...mockCardContent(520, 580, 500, 320, input.accent),
      ...(input.badge
        ? [
            shapeEl({
              name: 'PromoPill',
              shapeKind: 'rectangle',
              x: 90,
              y: 560,
              width: 120,
              height: 40,
              fill: { type: 'solid', color: '#ffffff' },
              cornerRadius: 20,
            }),
            textEl({
              name: 'PromoText',
              text: input.badge,
              x: 90,
              y: 560,
              width: 120,
              height: 40,
              fontSize: 18,
              fontWeight: 700,
              fill: input.accent,
              textAlign: 'center',
              verticalAlign: 'middle',
            }),
          ]
        : []),
      deviceEl({
        name: 'Device',
        colorVariant: input.colorVariant ?? 'white',
        x: DEFAULT_DEVICE_X,
        y: 796,
      }),
    ],
  }
}
