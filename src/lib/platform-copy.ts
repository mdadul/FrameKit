import { mapDeviceToAndroid } from '@/lib/assets/device-mapping'
import { getDevice } from '@/lib/assets/devices'
import { createId } from '@/lib/utils'
import type { DeviceElement, Element, Screen, ScreenPlatform } from '@/lib/types'

export function getScreenPlatform(screen: Screen): ScreenPlatform {
  return screen.platform ?? 'apple'
}

export function cloneElementsWithNewIds(elements: Element[]): Element[] {
  const idMap = new Map<string, string>()
  const cloned = elements.map((element) => {
    const newId = createId()
    idMap.set(element.id, newId)
    return { ...structuredClone(element), id: newId }
  })

  return cloned.map((element) => {
    if (element.type !== 'group') return element
    return {
      ...element,
      childIds: element.childIds.map((childId) => idMap.get(childId) ?? childId),
    }
  })
}

export function swapDevicesForAndroid(
  elements: Element[],
  targetDeviceId: string,
): Element[] {
  return elements.map((element) => {
    if (element.type !== 'device') return element
    const device = getDevice(element.deviceId)
    if (!device || device.platform === 'android') return element
    const next: DeviceElement = {
      ...element,
      deviceId: mapDeviceToAndroid(element.deviceId, targetDeviceId),
      colorVariant: undefined,
    }
    return next
  })
}

export function androidCopyName(sourceName: string): string {
  const base = sourceName.replace(/ \(Android\)$/i, '')
  return `${base} (Android)`
}

export function cloneScreenForAndroid(
  source: Screen,
  targetDeviceId: string,
): Screen {
  const elements = swapDevicesForAndroid(cloneElementsWithNewIds(source.elements), targetDeviceId)
  return {
    ...structuredClone(source),
    id: createId(),
    name: androidCopyName(source.name),
    platform: 'android',
    sourceScreenId: source.id,
    elements,
  }
}

export function sortScreensByPlatform(screens: Screen[]): Screen[] {
  const apple = screens.filter((screen) => getScreenPlatform(screen) !== 'android')
  const android = screens.filter((screen) => getScreenPlatform(screen) === 'android')
  return [...apple, ...android]
}

export function isAppleScreen(screen: Screen): boolean {
  return getScreenPlatform(screen) !== 'android'
}
