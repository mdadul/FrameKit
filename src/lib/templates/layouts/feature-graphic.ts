import { bgLinear } from '@/lib/templates/helpers'
import { textEl } from '@/lib/templates/helpers'
import type { LayoutBuildInput, LayoutBuildResult } from '@/lib/templates/types'

/** Play Store feature graphic layout (1024×500 artboard coordinates). */
export function buildFeatureGraphic(input: LayoutBuildInput): LayoutBuildResult {
  return {
    background: bgLinear(135, [
      { offset: 0, color: input.accent },
      { offset: 1, color: input.accentSecondary ?? '#0f766e' },
    ]),
    elements: [
      textEl({
        name: 'Title',
        text: input.title,
        x: 72,
        y: 140,
        width: 520,
        height: 120,
        fontFamily: input.headlineFont ?? 'Poppins',
        fontSize: 72,
        fontWeight: 800,
        fill: '#ffffff',
        textAlign: 'left',
        lineHeight: 1.1,
      }),
      textEl({
        name: 'Subtitle',
        text: input.subtitle,
        x: 72,
        y: 280,
        width: 480,
        height: 80,
        fontFamily: input.subtitleFont ?? 'Inter',
        fontSize: 28,
        fontWeight: 500,
        fill: 'rgba(255,255,255,0.9)',
        textAlign: 'left',
        lineHeight: 1.35,
      }),
      textEl({
        name: 'Badge',
        text: input.badge ?? 'Now on Google Play',
        x: 72,
        y: 72,
        width: 280,
        height: 40,
        fontFamily: input.subtitleFont ?? 'Inter',
        fontSize: 18,
        fontWeight: 600,
        fill: 'rgba(255,255,255,0.85)',
        textAlign: 'left',
      }),
    ],
  }
}
