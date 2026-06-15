import { bgLinear, deviceEl, textEl } from '@/lib/templates/helpers'
import { backgroundWave } from '@/lib/templates/store-showcase'
import type { LayoutBuildInput, LayoutBuildResult } from '@/lib/templates/types'

/** Wellness companion — blue gradient, top-left headline, 3D angled device */
export function buildStoreAngledDevice(input: LayoutBuildInput): LayoutBuildResult {
  const deep = input.accentSecondary ?? '#1d4ed8'
  const bright = input.accent
  return {
    background: bgLinear(165, [
      { offset: 0, color: deep },
      { offset: 0.55, color: bright },
      { offset: 1, color: '#38bdf8' },
    ]),
    elements: [
      backgroundWave(520, 680, 1100, 'rgba(255,255,255,0.14)'),
      backgroundWave(-120, 1200, 900, 'rgba(255,255,255,0.1)'),
      textEl({
        name: 'Title',
        text: input.title,
        x: 80,
        y: 140,
        width: 900,
        height: 320,
        fontFamily: input.headlineFont ?? 'Inter',
        fontSize: 88,
        fontWeight: 800,
        fill: '#ffffff',
        textAlign: 'left',
        letterSpacing: -1.2,
        lineHeight: 1.08,
      }),
      textEl({
        name: 'Subtitle',
        text: input.subtitle,
        x: 80,
        y: 480,
        width: 800,
        height: 80,
        fontFamily: input.subtitleFont ?? 'Inter',
        fontSize: 28,
        fontWeight: 400,
        fill: 'rgba(255,255,255,0.88)',
        lineHeight: 1.35,
        opacity: input.subtitle ? 0.9 : 0,
      }),
      deviceEl({
        name: 'Device',
        colorVariant: input.colorVariant ?? 'black',
        x: -80,
        y: 760,
        tiltX: 12,
        tiltY: 14,
        perspective: 50,
      }),
    ],
  }
}
