import { applyTemplateToScreen } from '@/lib/templates/apply-template-to-screen'
import type { BackgroundConfig, Element, Screen, TemplateApplyMode } from '@/lib/types'

export function applyTemplateToScreenState(
  screen: Screen,
  elements: Element[],
  background: BackgroundConfig,
  mode: TemplateApplyMode = 'replace',
) {
  const next = applyTemplateToScreen(screen, elements, background, mode)
  screen.background = next.background
  screen.elements = next.elements
}

export function getAndroidDeviceId(screen: Screen): string | undefined {
  const device = screen.elements.find((element) => element.type === 'device')
  return device?.type === 'device' ? device.deviceId : undefined
}
