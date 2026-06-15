import { scaledDeviceFrame } from '@/lib/constants'
import { bgRadial } from '@/lib/templates/helpers'
import { deviceEl, textEl } from '@/lib/templates/helpers'
import {
  featureBulletRow,
  verticalAccentBar,
} from '@/lib/templates/decorations'
import type { LayoutBuildInput, LayoutBuildResult } from '@/lib/templates/types'

const DEFAULT_FEATURES: [string, string, string] = [
  'Gentle, accessible design',
  'Reminders that help',
  'HIPAA-conscious privacy',
]

export function buildSplitLeft(input: LayoutBuildInput): LayoutBuildResult {
  const base = input.accentSecondary ?? '#f0f9ff'
  const features = input.features ?? DEFAULT_FEATURES
  return {
    background: bgRadial([
      { offset: 0, color: input.accent },
      { offset: 0.55, color: base },
      { offset: 1, color: '#ffffff' },
    ]),
    elements: [
      verticalAccentBar(70, 240, 200, '#0ea5e9'),
      textEl({
        name: 'Title',
        text: input.title,
        x: 90,
        y: 240,
        width: 560,
        height: 200,
        fontFamily: input.headlineFont ?? 'Inter',
        fontSize: 72,
        fontWeight: 800,
        fill: '#0f172a',
        textAlign: 'left',
        lineHeight: 1.15,
      }),
      textEl({
        name: 'Subtitle',
        text: input.subtitle,
        x: 70,
        y: 460,
        width: 580,
        height: 150,
        fontFamily: input.subtitleFont ?? 'Inter',
        fontSize: 28,
        fontWeight: 400,
        fill: '#475569',
        textAlign: 'left',
        lineHeight: 1.45,
      }),
      ...featureBulletRow(640, '#0ea5e9', features, { textColor: '#334155' }),
      deviceEl({
        name: 'Device',
        colorVariant: input.colorVariant ?? 'white',
        x: 620,
        y: 460,
        ...scaledDeviceFrame(0.58),
        tiltY: 5,
      }),
    ],
  }
}
