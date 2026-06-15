import { shapeEl, textEl } from '@/lib/templates/helpers'
import type { TemplateElement } from '@/lib/templates/types'

/** Floating light-mode sheet card — Dark Mode compare layout */
export function floatingCompareCard(
  x: number,
  y: number,
  width: number,
  height: number,
  accent: string,
  rotation = 10,
): TemplateElement[] {
  const pad = width * 0.08
  return [
    shapeEl({
      name: 'CompareCard',
      shapeKind: 'rectangle',
      x,
      y,
      width,
      height,
      rotation,
      fill: { type: 'solid', color: '#ffffff' },
      cornerRadius: 28,
      shadow: { enabled: true, offsetX: 0, offsetY: 16, blur: 40, color: 'rgba(0,0,0,0.18)' },
    }),
    textEl({
      name: 'CompareCardTitle',
      text: 'Send to',
      x: x + pad,
      y: y + pad * 1.2,
      width: width - pad * 2,
      height: 36,
      fontSize: 22,
      fontWeight: 700,
      fill: '#0f172a',
    }),
    ...Array.from({ length: 4 }, (_, i) =>
      shapeEl({
        name: `CompareAvatar${i}`,
        shapeKind: 'circle',
        x: x + pad + i * (width * 0.19),
        y: y + height * 0.22,
        width: width * 0.14,
        height: width * 0.14,
        fill: {
          type: 'solid',
          color: i === 0 ? '#facc15' : ['#fda4af', '#93c5fd', '#cbd5e1'][i - 1] ?? '#e2e8f0',
        },
      }),
    ),
    shapeEl({
      name: 'CompareInput',
      shapeKind: 'rectangle',
      x: x + pad,
      y: y + height * 0.52,
      width: width - pad * 2,
      height: height * 0.14,
      fill: { type: 'solid', color: '#f1f5f9' },
      cornerRadius: 14,
    }),
    shapeEl({
      name: 'CompareButton',
      shapeKind: 'rectangle',
      x: x + pad,
      y: y + height * 0.72,
      width: width - pad * 2,
      height: height * 0.14,
      fill: { type: 'solid', color: accent },
      cornerRadius: 18,
    }),
    textEl({
      name: 'CompareButtonLabel',
      text: 'Send',
      x: x + pad,
      y: y + height * 0.72,
      width: width - pad * 2,
      height: height * 0.14,
      fontSize: 20,
      fontWeight: 700,
      fill: '#ffffff',
      textAlign: 'center',
      verticalAlign: 'middle',
    }),
  ]
}

/** Sun / moon theme toggle pill */
export function themeTogglePill(x: number, y: number, accent: string): TemplateElement[] {
  const w = 200
  const h = 56
  return [
    shapeEl({
      name: 'ToggleTrack',
      shapeKind: 'rectangle',
      x,
      y,
      width: w,
      height: h,
      fill: { type: 'solid', color: '#e2e8f0' },
      cornerRadius: h / 2,
      shadow: { enabled: true, offsetX: 0, offsetY: 8, blur: 20, color: 'rgba(0,0,0,0.12)' },
    }),
    shapeEl({
      name: 'ToggleSun',
      shapeKind: 'circle',
      x: x + 12,
      y: y + 10,
      width: 36,
      height: 36,
      fill: { type: 'solid', color: '#94a3b8' },
    }),
    shapeEl({
      name: 'ToggleMoon',
      shapeKind: 'rectangle',
      x: x + w / 2 + 8,
      y: y + 6,
      width: w / 2 - 14,
      height: h - 12,
      fill: { type: 'solid', color: accent },
      cornerRadius: (h - 12) / 2,
    }),
    textEl({
      name: 'ToggleMoonIcon',
      text: '☾',
      x: x + w / 2 + 8,
      y: y + 6,
      width: w / 2 - 14,
      height: h - 12,
      fontSize: 22,
      fill: '#ffffff',
      textAlign: 'center',
      verticalAlign: 'middle',
    }),
  ]
}

/** Playful heart sticker — bold brand layout */
export function heartSticker(x: number, y: number, size: number): TemplateElement[] {
  return [
    shapeEl({
      name: 'HeartSticker',
      shapeKind: 'circle',
      x,
      y,
      width: size,
      height: size,
      fill: {
        type: 'gradient',
        gradient: {
          type: 'linear',
          angle: 145,
          stops: [
            { offset: 0, color: '#fb7185' },
            { offset: 1, color: '#e11d48' },
          ],
        },
      },
      shadow: { enabled: true, offsetX: 0, offsetY: 12, blur: 24, color: 'rgba(0,0,0,0.2)' },
    }),
    shapeEl({
      name: 'HeartEyeL',
      shapeKind: 'circle',
      x: x + size * 0.28,
      y: y + size * 0.3,
      width: size * 0.1,
      height: size * 0.1,
      fill: { type: 'solid', color: '#1e3a8a' },
    }),
    shapeEl({
      name: 'HeartEyeR',
      shapeKind: 'circle',
      x: x + size * 0.58,
      y: y + size * 0.3,
      width: size * 0.1,
      height: size * 0.1,
      fill: { type: 'solid', color: '#1e3a8a' },
    }),
    shapeEl({
      name: 'HeartMouth',
      shapeKind: 'rectangle',
      x: x + size * 0.32,
      y: y + size * 0.52,
      width: size * 0.36,
      height: size * 0.22,
      fill: { type: 'solid', color: '#1e3a8a' },
      cornerRadius: size * 0.12,
    }),
  ]
}

/** Cool flame sticker — bold brand layout */
export function flameSticker(x: number, y: number, size: number, rotation = -12): TemplateElement[] {
  return [
    shapeEl({
      name: 'FlameBody',
      shapeKind: 'triangle',
      x,
      y,
      width: size,
      height: size * 1.15,
      rotation,
      fill: {
        type: 'gradient',
        gradient: {
          type: 'linear',
          angle: 180,
          stops: [
            { offset: 0, color: '#fde047' },
            { offset: 1, color: '#f97316' },
          ],
        },
      },
      shadow: { enabled: true, offsetX: 0, offsetY: 10, blur: 20, color: 'rgba(0,0,0,0.18)' },
    }),
    shapeEl({
      name: 'FlameShades',
      shapeKind: 'rectangle',
      x: x + size * 0.18,
      y: y + size * 0.38,
      width: size * 0.64,
      height: size * 0.18,
      rotation,
      fill: { type: 'solid', color: '#0f172a' },
      cornerRadius: size * 0.06,
    }),
  ]
}

/** Soft background wave for angled hero */
export function backgroundWave(x: number, y: number, size: number, color: string): TemplateElement {
  return shapeEl({
    name: 'BackgroundWave',
    shapeKind: 'circle',
    x,
    y,
    width: size,
    height: size,
    fill: { type: 'solid', color },
    opacity: 0.35,
  })
}
