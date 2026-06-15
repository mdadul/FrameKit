import { DEFAULT_DEVICE_X } from '@/lib/constants'
import { bgLinear, deviceEl, textEl } from '@/lib/templates/helpers'
import type { LayoutBuildInput, LayoutBuildResult } from '@/lib/templates/types'

/** Bold top headline on a soft gradient canvas */
export function buildStoreTopHeadline(input: LayoutBuildInput): LayoutBuildResult {
  return {
    background: bgLinear(165, [
      { offset: 0, color: '#fafaf9' },
      { offset: 0.55, color: '#f0fdfa' },
      { offset: 1, color: '#ecfeff' },
    ]),
    elements: [
      textEl({
        name: 'Title',
        text: input.title,
        x: 60,
        y: 100,
        width: 1170,
        height: 280,
        fontFamily: input.headlineFont ?? 'Poppins',
        fontSize: 96,
        fontWeight: 800,
        fill: '#0f172a',
        textAlign: 'center',
        letterSpacing: -3,
        lineHeight: 1.02,
      }),
      textEl({
        name: 'Subtitle',
        text: input.subtitle,
        x: 120,
        y: 400,
        width: 1050,
        height: 90,
        fontFamily: input.subtitleFont ?? 'Inter',
        fontSize: 30,
        fontWeight: 500,
        fill: '#64748b',
        textAlign: 'center',
        lineHeight: 1.35,
        opacity: input.subtitle ? 0.9 : 0,
      }),
      deviceEl({
        name: 'Device',
        colorVariant: input.colorVariant ?? 'black',
        x: DEFAULT_DEVICE_X,
        y: 540,
      }),
    ],
  }
}
