import { DEFAULT_DEVICE_X } from '@/lib/constants'
import { bgSolid, deviceEl, shapeEl, textEl } from '@/lib/templates/helpers'
import { starRatingRow } from '@/lib/templates/decorations'
import type { LayoutBuildInput, LayoutBuildResult } from '@/lib/templates/types'

export function buildDarkGlow(input: LayoutBuildInput): LayoutBuildResult {
  const base = input.accentSecondary ?? '#020617'
  return {
    background: bgSolid(base),
    elements: [
      shapeEl({
        name: 'GlowOuter',
        shapeKind: 'circle',
        x: 320,
        y: 900,
        width: 650,
        height: 650,
        fill: { type: 'solid', color: input.accent },
        opacity: 0.18,
      }),
      shapeEl({
        name: 'GlowInner',
        shapeKind: 'circle',
        x: 420,
        y: 1000,
        width: 450,
        height: 450,
        fill: { type: 'solid', color: input.accent },
        opacity: 0.28,
      }),
      textEl({
        name: 'Title',
        text: input.title,
        x: 90,
        y: 140,
        width: 1110,
        height: 140,
        fontFamily: input.headlineFont ?? 'Poppins',
        fontSize: 88,
        fontWeight: 800,
        fill: '#ffffff',
        letterSpacing: -1,
        lineHeight: 1.1,
        shadow: { enabled: true, offsetX: 0, offsetY: 6, blur: 28, color: 'rgba(0,0,0,0.35)' },
      }),
      textEl({
        name: 'Subtitle',
        text: input.subtitle,
        x: 90,
        y: 290,
        width: 900,
        height: 90,
        fontFamily: input.subtitleFont ?? 'Inter',
        fontSize: 32,
        fontWeight: 400,
        fill: '#94a3b8',
        lineHeight: 1.35,
      }),
      ...(input.badge
        ? [
            shapeEl({
              name: 'Badge',
              shapeKind: 'rectangle',
              x: 90,
              y: 400,
              width: 160,
              height: 44,
              fill: { type: 'solid', color: input.accent },
              cornerRadius: 22,
            }),
            textEl({
              name: 'BadgeText',
              text: input.badge,
              x: 90,
              y: 400,
              width: 160,
              height: 44,
              fontSize: 20,
              fontWeight: 600,
              fill: '#ffffff',
              textAlign: 'center',
              verticalAlign: 'middle',
            }),
          ]
        : []),
      ...starRatingRow(90, input.badge ? 470 : 400, input.accent, input.rating ?? '4.8 · Top rated'),
      deviceEl({
        name: 'Device',
        colorVariant: input.colorVariant ?? 'black',
        x: DEFAULT_DEVICE_X,
        y: 560,
        tiltX: input.badge ? 8 : 0,
      }),
    ],
  }
}
