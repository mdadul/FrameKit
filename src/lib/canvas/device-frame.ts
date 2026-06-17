import { drawImageWithObjectFit } from '@/lib/canvas/image-fit'
import type { DeviceColorVariant, DeviceDefinition, ScreenshotFit } from '@/lib/types'

export type ScreenshotSource =
  | (CanvasImageSource & { width: number; height: number })
  | null
  | undefined

export interface BuildDeviceCanvasOptions {
  device: DeviceDefinition
  variant: DeviceColorVariant
  width: number
  height: number
  showFrame: boolean
  screenshot?: ScreenshotSource
  screenshotFit: ScreenshotFit
  pixelRatio?: number
}

function drawImageFitted(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource & { width: number; height: number },
  dx: number,
  dy: number,
  dw: number,
  dh: number,
  fit: ScreenshotFit,
) {
  drawImageWithObjectFit(
    ctx,
    image,
    { x: 0, y: 0, width: image.width, height: image.height },
    { x: dx, y: dy, width: dw, height: dh },
    fit,
    fit === 'contain' ? { letterboxFill: '#000000' } : undefined,
  )
}

function drawNotch(
  ctx: CanvasRenderingContext2D,
  device: DeviceDefinition,
  sx: number,
  sy: number,
  sw: number,
  scaleX: number,
  scaleY: number,
) {
  ctx.fillStyle = '#000000'
  const centerX = sx + sw / 2

  if (device.notch === 'island') {
    const w = 92 * scaleX
    const h = 28 * scaleY
    const y = sy + 14 * scaleY
    ctx.beginPath()
    ctx.roundRect(centerX - w / 2, y, w, h, h / 2)
    ctx.fill()
  } else if (device.notch === 'notch') {
    const w = 150 * scaleX
    const h = 30 * scaleY
    ctx.beginPath()
    ctx.roundRect(centerX - w / 2, sy, w, h, [0, 0, h / 2, h / 2])
    ctx.fill()
  } else if (device.notch === 'punch-hole') {
    const r = 9 * scaleX
    ctx.beginPath()
    ctx.arc(centerX, sy + 22 * scaleY, r, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawSideButtons(
  ctx: CanvasRenderingContext2D,
  variant: DeviceColorVariant,
  width: number,
  height: number,
  scaleX: number,
  scaleY: number,
) {
  ctx.fillStyle = variant.edge
  const btnW = 3 * scaleX
  const radius = btnW / 2

  // Power button (right edge)
  const powerH = 70 * scaleY
  ctx.beginPath()
  ctx.roundRect(width - btnW + 0.5, height * 0.28, btnW, powerH, radius)
  ctx.fill()

  // Volume buttons (left edge)
  const volH = 44 * scaleY
  ctx.beginPath()
  ctx.roundRect(-0.5, height * 0.24, btnW, volH, radius)
  ctx.fill()
  ctx.beginPath()
  ctx.roundRect(-0.5, height * 0.24 + volH + 18 * scaleY, btnW, volH, radius)
  ctx.fill()

  // Action/mute button (left edge, upper)
  ctx.beginPath()
  ctx.roundRect(-0.5, height * 0.18, btnW, 24 * scaleY, radius)
  ctx.fill()
}

export function buildDeviceCanvas(options: BuildDeviceCanvasOptions): HTMLCanvasElement {
  const {
    device,
    variant,
    width,
    height,
    showFrame,
    screenshot,
    screenshotFit,
    pixelRatio = 2,
  } = options

  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(width * pixelRatio))
  canvas.height = Math.max(1, Math.round(height * pixelRatio))
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas
  ctx.scale(pixelRatio, pixelRatio)

  const scaleX = width / device.frameWidth
  const scaleY = height / device.frameHeight
  const screenX = device.screenX * scaleX
  const screenY = device.screenY * scaleY
  const screenWidth = device.screenWidth * scaleX
  const screenHeight = device.screenHeight * scaleY
  const screenRadius = device.screenRadius * scaleX

  if (!showFrame) {
    ctx.save()
    ctx.beginPath()
    ctx.roundRect(0, 0, width, height, screenRadius)
    ctx.clip()
    if (screenshot) {
      drawImageFitted(ctx, screenshot, 0, 0, width, height, screenshotFit)
    } else {
      ctx.fillStyle = '#111827'
      ctx.fillRect(0, 0, width, height)
    }
    ctx.restore()
    return canvas
  }

  const bodyRadius = device.bodyRadius * scaleX

  // Outer body
  ctx.fillStyle = variant.body
  ctx.beginPath()
  ctx.roundRect(0, 0, width, height, bodyRadius)
  ctx.fill()

  // Metallic edge highlight
  ctx.strokeStyle = variant.edge
  ctx.lineWidth = Math.max(1, 2 * scaleX)
  ctx.beginPath()
  ctx.roundRect(1.5 * scaleX, 1.5 * scaleY, width - 3 * scaleX, height - 3 * scaleY, bodyRadius - 2 * scaleX)
  ctx.stroke()

  drawSideButtons(ctx, variant, width, height, scaleX, scaleY)

  // Inner bezel
  ctx.fillStyle = '#050505'
  ctx.beginPath()
  ctx.roundRect(
    screenX - 3 * scaleX,
    screenY - 3 * scaleY,
    screenWidth + 6 * scaleX,
    screenHeight + 6 * scaleY,
    screenRadius + 3 * scaleX,
  )
  ctx.fill()

  // Screen content (clipped)
  ctx.save()
  ctx.beginPath()
  ctx.roundRect(screenX, screenY, screenWidth, screenHeight, screenRadius)
  ctx.clip()
  if (screenshot) {
    drawImageFitted(ctx, screenshot, screenX, screenY, screenWidth, screenHeight, screenshotFit)
  } else {
    ctx.fillStyle = '#111827'
    ctx.fillRect(screenX, screenY, screenWidth, screenHeight)
  }
  ctx.restore()

  drawNotch(ctx, device, screenX, screenY, screenWidth, scaleX, scaleY)

  return canvas
}
