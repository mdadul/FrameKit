import { describe, expect, it } from 'vitest'
import { createScreen, createTextElement } from '@/lib/factories'
import {
  androidCopyName,
  cloneScreenForAndroid,
  getScreenPlatform,
  swapDevicesForAndroid,
} from '@/lib/platform-copy'
import type { DeviceElement } from '@/lib/types'

describe('platform-copy', () => {
  it('creates an android copy linked to the source screen', () => {
    const source = createScreen('Screen 1')
    source.elements = [
      createTextElement({ id: 'text-1', name: 'Title' }),
      {
        id: 'device-1',
        type: 'device',
        name: 'Device',
        deviceId: 'iphone-16-pro-max',
        x: 100,
        y: 200,
        width: 1000,
        height: 2000,
        rotation: 0,
        opacity: 1,
        locked: false,
        visible: true,
        zIndex: 1,
        shadowIntensity: 0.3,
        shadowSpread: 20,
      } satisfies DeviceElement,
    ]

    const copy = cloneScreenForAndroid(source, 'pixel-9')

    expect(copy.id).not.toBe(source.id)
    expect(copy.name).toBe('Screen 1 (Android)')
    expect(copy.platform).toBe('android')
    expect(copy.sourceScreenId).toBe(source.id)
    expect(copy.elements).toHaveLength(2)
    expect(copy.elements.every((element) => element.id !== 'text-1' && element.id !== 'device-1')).toBe(
      true,
    )
    expect((copy.elements[1] as DeviceElement).deviceId).toBe('pixel-9')
    expect((copy.elements[1] as DeviceElement).colorVariant).toBeUndefined()
  })

  it('names android copies without duplicating the suffix', () => {
    expect(androidCopyName('Screen 1 (Android)')).toBe('Screen 1 (Android)')
  })

  it('leaves existing android device frames unchanged', () => {
    const device: DeviceElement = {
      id: 'device-1',
      type: 'device',
      name: 'Device',
      deviceId: 'pixel-9',
      x: 0,
      y: 0,
      width: 300,
      height: 620,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 0,
      shadowIntensity: 0.3,
      shadowSpread: 20,
    }

    const swapped = swapDevicesForAndroid([device], 'galaxy-s25')
    expect((swapped[0] as DeviceElement).deviceId).toBe('pixel-9')
  })

  it('defaults legacy screens to apple platform', () => {
    const screen = createScreen('Legacy')
    delete screen.platform
    expect(getScreenPlatform(screen)).toBe('apple')
  })
})
