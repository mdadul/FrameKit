import { scaledDeviceFrame } from '@/lib/constants'
import { bgLinear, bgSolid } from '@/lib/templates/helpers'
import { deviceEl, textEl } from '@/lib/templates/helpers'
import {
  featureBulletRow,
  verticalAccentBar,
} from '@/lib/templates/decorations'
import type { LayoutBuildInput, LayoutBuildResult } from '@/lib/templates/types'

const DEFAULT_FEATURES: [string, string, string] = [
  'Built for power users',
  'Real-time collaboration',
  'Enterprise-grade security',
]

export function buildSplitRight(input: LayoutBuildInput): LayoutBuildResult {
  const secondary = input.accentSecondary ?? '#1e1b4b'
  const features = input.features ?? DEFAULT_FEATURES
  return {
    background: input.accentSecondary
      ? bgLinear(160, [
          { offset: 0, color: secondary },
          { offset: 1, color: input.accent },
        ])
      : bgSolid(input.accent),
    elements: [
      deviceEl({
        name: 'Device',
        colorVariant: input.colorVariant ?? 'black',
        x: 40,
        y: 480,
        ...scaledDeviceFrame(0.52),
        tiltY: -4,
      }),
      verticalAccentBar(600, 260, 180, '#ffffff'),
      textEl({
        name: 'Title',
        text: input.title,
        x: 620,
        y: 260,
        width: 600,
        height: 200,
        fontFamily: input.headlineFont ?? 'Poppins',
        fontSize: 72,
        fontWeight: 800,
        fill: '#ffffff',
        textAlign: 'right',
        letterSpacing: -0.5,
        lineHeight: 1.15,
      }),
      textEl({
        name: 'Subtitle',
        text: input.subtitle,
        x: 600,
        y: 480,
        width: 620,
        height: 160,
        fontFamily: input.subtitleFont ?? 'Inter',
        fontSize: 30,
        fontWeight: 400,
        fill: '#cbd5e1',
        textAlign: 'right',
        lineHeight: 1.4,
        opacity: 0.95,
      }),
      ...featureBulletRow(680, '#ffffff', features, {
        align: 'left',
        textColor: '#e2e8f0',
        x: 620,
        width: 580,
      }),
    ],
  }
}
