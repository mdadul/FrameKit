import { shapeEl, textEl } from '@/lib/templates/helpers'
import type { TemplateElement } from '@/lib/templates/types'

/** Rounded square mimicking an app icon beside the headline */
export function appIconBadge(
  x: number,
  y: number,
  size: number,
  color: string,
): TemplateElement[] {
  return [
    shapeEl({
      name: 'AppIcon',
      shapeKind: 'rectangle',
      x,
      y,
      width: size,
      height: size,
      fill: {
        type: 'gradient',
        gradient: {
          type: 'linear',
          angle: 135,
          stops: [
            { offset: 0, color },
            { offset: 1, color: shade(color, -20) },
          ],
        },
      },
      cornerRadius: size * 0.22,
      shadow: { enabled: true, offsetX: 0, offsetY: 8, blur: 20, color: 'rgba(0,0,0,0.2)' },
    }),
  ]
}

/** Three short feature lines with dot markers — common App Store pattern */
export function featureBulletRow(
  y: number,
  accent: string,
  items: [string, string, string],
  options: { align?: 'left' | 'center'; textColor?: string; x?: number; width?: number } = {},
): TemplateElement[] {
  const align = options.align ?? 'left'
  const textColor = options.textColor ?? accent
  const baseX = options.x ?? (align === 'center' ? 220 : 90)
  const rowWidth = options.width ?? (align === 'center' ? 850 : 700)

  return items.flatMap((text, index) => {
    const rowY = y + index * 56
    return [
      shapeEl({
        name: `BulletDot${index}`,
        shapeKind: 'circle',
        x: baseX,
        y: rowY + 10,
        width: 14,
        height: 14,
        fill: { type: 'solid', color: accent },
      }),
      textEl({
        name: `BulletText${index}`,
        text,
        x: baseX + 30,
        y: rowY,
        width: rowWidth - 30,
        height: 44,
        fontSize: 26,
        fontWeight: 500,
        fill: textColor,
        textAlign: align === 'center' ? 'center' : 'left',
        lineHeight: 1.3,
        opacity: 0.95,
      }),
    ]
  })
}

/** Mock UI chrome inside feature card rectangles */
export function mockCardContent(
  x: number,
  y: number,
  width: number,
  height: number,
  accent: string,
): TemplateElement[] {
  const pad = width * 0.1
  return [
    shapeEl({
      name: 'CardLine1',
      shapeKind: 'rectangle',
      x: x + pad,
      y: y + height * 0.2,
      width: width * 0.55,
      height: 14,
      fill: { type: 'solid', color: 'rgba(255,255,255,0.5)' },
      cornerRadius: 7,
    }),
    shapeEl({
      name: 'CardLine2',
      shapeKind: 'rectangle',
      x: x + pad,
      y: y + height * 0.38,
      width: width * 0.75,
      height: 10,
      fill: { type: 'solid', color: 'rgba(255,255,255,0.28)' },
      cornerRadius: 5,
    }),
    shapeEl({
      name: 'CardChip',
      shapeKind: 'rectangle',
      x: x + pad,
      y: y + height * 0.58,
      width: width * 0.35,
      height: 28,
      fill: { type: 'solid', color: accent },
      cornerRadius: 14,
      opacity: 0.85,
    }),
  ]
}

/** Five-star social proof row */
export function starRatingRow(
  x: number,
  y: number,
  color: string,
  label = '4.9 · 12K reviews',
): TemplateElement[] {
  const stars: TemplateElement[] = Array.from({ length: 5 }, (_, i) =>
    shapeEl({
      name: `Star${i}`,
      shapeKind: 'circle',
      x: x + i * 22,
      y,
      width: 16,
      height: 16,
      fill: { type: 'solid', color },
      opacity: 0.95,
    }),
  )
  return [
    ...stars,
    textEl({
      name: 'RatingLabel',
      text: label,
      x: x + 120,
      y: y - 4,
      width: 280,
      height: 28,
      fontSize: 20,
      fontWeight: 500,
      fill: color,
      opacity: 0.85,
    }),
  ]
}

/** Vertical accent strip — editorial split-layout detail */
export function verticalAccentBar(x: number, y: number, height: number, color: string): TemplateElement {
  return shapeEl({
    name: 'VerticalAccent',
    shapeKind: 'rectangle',
    x,
    y,
    width: 6,
    height,
    fill: { type: 'solid', color },
    cornerRadius: 3,
  })
}

/** Soft ambient orb for depth */
export function ambientOrb(
  x: number,
  y: number,
  size: number,
  color: string,
  opacity = 0.2,
): TemplateElement {
  return shapeEl({
    name: 'AmbientOrb',
    shapeKind: 'circle',
    x,
    y,
    width: size,
    height: size,
    fill: { type: 'solid', color },
    opacity,
  })
}

function shade(hex: string, percent: number): string {
  if (!hex.startsWith('#') || hex.length < 7) return hex
  const num = parseInt(hex.slice(1), 16)
  const r = Math.min(255, Math.max(0, ((num >> 16) & 0xff) + percent))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + percent))
  const b = Math.min(255, Math.max(0, (num & 0xff) + percent))
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}
