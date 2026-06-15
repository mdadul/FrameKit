import { DEFAULT_DEVICE_X } from '@/lib/constants'
import { bgPattern, deviceEl, shapeEl, textEl } from '@/lib/templates/helpers'
import {
  appIconBadge,
  featureBulletRow,
} from '@/lib/templates/decorations'
import type { LayoutBuildInput, LayoutBuildResult } from '@/lib/templates/types'

const DEFAULT_FEATURES: [string, string, string] = [
  'Clean, distraction-free UI',
  'Works offline anytime',
  'No ads or clutter',
]

export function buildMinimalLight(input: LayoutBuildInput): LayoutBuildResult {
  const patternKind = input.accentSecondary === 'grid' ? 'grid' : 'dots'
  const features = input.features ?? DEFAULT_FEATURES
  return {
    background:
      patternKind === 'grid'
        ? bgPattern('#f8fafc', 'grid', '#e2e8f0', 1.2)
        : bgPattern('#ffffff', 'dots', input.accent, 0.35),
    elements: [
      ...appIconBadge(90, 168, 68, input.accent === '#e2e8f0' ? '#64748b' : input.accent),
      textEl({
        name: 'Title',
        text: input.title,
        x: 90,
        y: 260,
        width: 1110,
        height: 160,
        fontFamily: input.headlineFont ?? 'Inter',
        fontSize: 84,
        fontWeight: 800,
        fill: '#0f172a',
        textAlign: 'left',
        letterSpacing: -1.5,
        lineHeight: 1.12,
      }),
      textEl({
        name: 'Subtitle',
        text: input.subtitle,
        x: 90,
        y: 440,
        width: 900,
        height: 100,
        fontFamily: input.subtitleFont ?? 'Inter',
        fontSize: 30,
        fontWeight: 400,
        fill: '#64748b',
        lineHeight: 1.4,
      }),
      shapeEl({
        name: 'AccentLine',
        shapeKind: 'rectangle',
        x: 90,
        y: 560,
        width: 120,
        height: 5,
        fill: { type: 'solid', color: input.accent === '#e2e8f0' ? '#94a3b8' : input.accent },
        cornerRadius: 3,
      }),
      ...featureBulletRow(600, input.accent === '#e2e8f0' ? '#64748b' : input.accent, features, {
        textColor: '#475569',
      }),
      deviceEl({
        name: 'Device',
        colorVariant: input.colorVariant ?? 'natural',
        x: DEFAULT_DEVICE_X,
        y: 796,
      }),
    ],
  }
}