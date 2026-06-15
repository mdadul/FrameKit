import { DEFAULT_DEVICE_X } from '@/lib/constants'
import { bgLinear, bgRadial, deviceEl, shapeEl, textEl } from '@/lib/templates/helpers'
import { appIconBadge, starRatingRow } from '@/lib/templates/decorations'
import type { LayoutBuildInput, LayoutBuildResult } from '@/lib/templates/types'

export function buildBoldCentered(input: LayoutBuildInput): LayoutBuildResult {
  const useRadial = Boolean(input.accentSecondary)
  return {
    background: useRadial
      ? bgRadial([
          { offset: 0, color: input.accent },
          { offset: 0.6, color: input.accentSecondary! },
          { offset: 1, color: '#0f172a' },
        ])
      : bgLinear(180, [
          { offset: 0, color: input.accent },
          { offset: 1, color: '#0f172a' },
        ]),
    elements: [
      ...(input.badge === 'triangles'
        ? [
            shapeEl({
              name: 'AccentTri',
              shapeKind: 'triangle',
              x: 100,
              y: 120,
              width: 120,
              height: 120,
              fill: { type: 'solid', color: 'rgba(255,255,255,0.15)' },
              opacity: 0.8,
            }),
            shapeEl({
              name: 'AccentTri2',
              shapeKind: 'triangle',
              x: 1070,
              y: 200,
              width: 100,
              height: 100,
              fill: { type: 'solid', color: 'rgba(255,255,255,0.1)' },
              opacity: 0.7,
            }),
          ]
        : []),
      ...appIconBadge(610, 120, 72, '#ffffff'),
      textEl({
        name: 'Title',
        text: input.title,
        x: 80,
        y: 220,
        width: 1130,
        height: 200,
        fontFamily: input.headlineFont ?? 'Oswald',
        fontSize: 96,
        fontWeight: 800,
        fill: '#ffffff',
        textAlign: 'center',
        letterSpacing: -1,
        lineHeight: 1.05,
        shadow: { enabled: true, offsetX: 0, offsetY: 6, blur: 24, color: 'rgba(0,0,0,0.35)' },
      }),
      textEl({
        name: 'Subtitle',
        text: input.subtitle,
        x: 140,
        y: 440,
        width: 1010,
        height: 100,
        fontFamily: input.subtitleFont ?? 'Inter',
        fontSize: 30,
        fontWeight: 400,
        fill: '#e2e8f0',
        textAlign: 'center',
        opacity: 0.92,
        lineHeight: 1.35,
      }),
      ...starRatingRow(500, 560, '#fde68a', input.rating ?? '5.0 · Fan favorite'),
      deviceEl({
        name: 'Device',
        colorVariant: input.colorVariant ?? 'black',
        x: DEFAULT_DEVICE_X,
        y: 640,
      }),
    ],
  }
}
