import {
  DEFAULT_DEVICE_HEIGHT,
  DEFAULT_DEVICE_SHADOW_INTENSITY,
  DEFAULT_DEVICE_SHADOW_SPREAD,
  DEFAULT_DEVICE_WIDTH,
  DEFAULT_DEVICE_X,
  DEFAULT_DEVICE_Y,
} from '@/lib/constants'
import { createId } from '@/lib/utils'
import type { DeviceElement } from '@/lib/types'

export function createDefaultDeviceElement(deviceId: string): DeviceElement {
  return {
    id: createId(),
    type: 'device',
    name: 'Device',
    deviceId,
    x: DEFAULT_DEVICE_X,
    y: DEFAULT_DEVICE_Y,
    width: DEFAULT_DEVICE_WIDTH,
    height: DEFAULT_DEVICE_HEIGHT,
    rotation: 0,
    opacity: 1,
    locked: false,
    visible: true,
    zIndex: 3,
    shadowIntensity: DEFAULT_DEVICE_SHADOW_INTENSITY,
    shadowSpread: DEFAULT_DEVICE_SHADOW_SPREAD,
  }
}
