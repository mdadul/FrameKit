import { DEFAULT_DEVICE_X } from '@/lib/constants'
import { bgMesh, defaultMeshBlobs, deviceEl, textEl } from '@/lib/templates/helpers'
import { ambientOrb, starRatingRow } from '@/lib/templates/decorations'
import type { LayoutBuildInput, LayoutBuildResult } from '@/lib/templates/types'

export function buildMeshModern(input: LayoutBuildInput): LayoutBuildResult {
  const meshColors = [
    input.accent,
    input.accentSecondary ?? input.accent,
    input.accentSecondary ? '#0f172a' : '#1e293b',
  ]
  return {
    background: bgMesh(meshColors, defaultMeshBlobs(meshColors)),
    elements: [
      ambientOrb(80, 100, 200, input.accent, 0.15),
      ambientOrb(1000, 180, 160, input.accentSecondary ?? input.accent, 0.12),
      textEl({
        name: 'Title',
        text: input.title,
        x: 80,
        y: 140,
        width: 1130,
        height: 180,
        fontFamily: input.headlineFont ?? 'Poppins',
        fontSize: 92,
        fontWeight: 800,
        fill: '#ffffff',
        textAlign: 'center',
        letterSpacing: -1.5,
        lineHeight: 1.08,
        shadow: { enabled: true, offsetX: 0, offsetY: 4, blur: 20, color: 'rgba(0,0,0,0.3)' },
      }),
      textEl({
        name: 'Subtitle',
        text: input.subtitle,
        x: 120,
        y: 330,
        width: 1050,
        height: 100,
        fontFamily: input.subtitleFont ?? 'Inter',
        fontSize: 32,
        fontWeight: 400,
        fill: '#e2e8f0',
        textAlign: 'center',
        opacity: 0.9,
        lineHeight: 1.35,
      }),
      ...starRatingRow(520, 450, '#fde68a', input.rating ?? '4.9 · Editor\'s choice'),
      deviceEl({
        name: 'Device',
        colorVariant: input.colorVariant ?? 'black',
        x: DEFAULT_DEVICE_X,
        y: 540,
        tiltX: 6,
      }),
    ],
  }
}
