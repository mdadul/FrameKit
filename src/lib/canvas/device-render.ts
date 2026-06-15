import { getDevice, getDeviceVariant } from '@/lib/assets/devices'
import { buildDeviceCanvas, type ScreenshotSource } from '@/lib/canvas/device-frame'
import { computeTiltCorners, hasTilt, warpToCorners } from '@/lib/canvas/perspective'
import type { DeviceElement } from '@/lib/types'

export interface DeviceRenderResult {
  canvas: HTMLCanvasElement
  offsetX: number
  offsetY: number
  width: number
  height: number
}

export function renderDeviceComposite(
  element: DeviceElement,
  screenshot: ScreenshotSource,
  pixelRatio = 2,
): DeviceRenderResult | null {
  const device = getDevice(element.deviceId)
  if (!device) return null

  const variant = getDeviceVariant(device, element.colorVariant)
  const width = element.width
  const height = element.height

  const base = buildDeviceCanvas({
    device,
    variant,
    width,
    height,
    showFrame: element.showFrame !== false,
    screenshot,
    screenshotFit: element.screenshotFit ?? 'cover',
    pixelRatio,
  })

  const tiltX = element.tiltX ?? 0
  const tiltY = element.tiltY ?? 0
  const perspective = element.perspective ?? 50

  if (!hasTilt(tiltX, tiltY)) {
    return { canvas: base, offsetX: 0, offsetY: 0, width, height }
  }

  const corners = computeTiltCorners(width, height, tiltX, tiltY, perspective)
  const warped = warpToCorners(base, width, height, corners, pixelRatio)
  return {
    canvas: warped.canvas,
    offsetX: warped.offsetX,
    offsetY: warped.offsetY,
    width: warped.width,
    height: warped.height,
  }
}
