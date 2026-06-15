import { createId } from '@/lib/utils'
import type { BackgroundConfig, Element, Screen, TemplateApplyMode } from '@/lib/types'

export function applyTemplateToScreen(
  screen: Screen,
  elements: Element[],
  background: BackgroundConfig,
  mode: TemplateApplyMode = 'replace',
): Screen {
  const next = structuredClone(screen)

  if (mode === 'background') {
    next.background = structuredClone(background)
    return next
  }

  const templateElements = elements.map((element, index) => ({
    ...structuredClone(element),
    id: createId(),
    zIndex: index,
  }))

  if (mode === 'add-elements') {
    const maxZ = next.elements.reduce((max, element) => Math.max(max, element.zIndex), -1)
    next.elements = [
      ...next.elements,
      ...templateElements.map((element, index) => ({
        ...element,
        zIndex: maxZ + 1 + index,
      })),
    ]
    return next
  }

  next.background = structuredClone(background)
  next.elements = templateElements
  return next
}
