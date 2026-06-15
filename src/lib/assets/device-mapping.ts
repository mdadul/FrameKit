import { DEVICES, getDevice } from '@/lib/assets/devices'

export const DEFAULT_ANDROID_DEVICE_ID = 'pixel-9'

export const ANDROID_DEVICE_IDS = DEVICES.filter((device) => device.platform === 'android').map(
  (device) => device.id,
)

export function mapDeviceToAndroid(sourceDeviceId: string, targetDeviceId: string): string {
  const source = getDevice(sourceDeviceId)
  if (!source) return targetDeviceId
  if (source.platform === 'android') return sourceDeviceId
  return targetDeviceId
}

export function screenHasIpadFrame(elements: import('@/lib/types').Element[]): boolean {
  return elements.some(
    (element) => element.type === 'device' && element.deviceId === 'ipad-pro',
  )
}
