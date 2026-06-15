import { DEFAULT_DESIGN_HEIGHT, DEFAULT_DESIGN_WIDTH } from '@/lib/constants'
import { renderScreenToDataUrl } from '@/lib/export/renderer'
import { createId } from '@/lib/utils'
import type { Element, Project, Screen } from '@/lib/types'
import type { TemplateDefinition, TemplateElement } from '@/lib/templates/types'

export const SHOWCASE_TEMPLATE_IDS = [
  'showcase-clutter-free',
  'showcase-dark-mode',
  'showcase-bold-brand',
  'showcase-wellness-angled',
] as const

const thumbnailCache = new Map<string, string>()

export function templateElementsToScreenElements(elements: TemplateElement[]): Element[] {
  return elements.map((element, index) => ({
    ...structuredClone(element),
    id: createId(),
    name: element.name ?? `Element ${index + 1}`,
    zIndex: index,
  })) as Element[]
}

export function templateToScreen(template: TemplateDefinition): Screen {
  return {
    id: 'template-preview',
    name: template.name,
    width: DEFAULT_DESIGN_WIDTH,
    height: DEFAULT_DESIGN_HEIGHT,
    background: structuredClone(template.background),
    elements: templateElementsToScreenElements(template.elements),
    platform: 'apple',
  }
}

export function applyTemplateToProject(
  project: Project,
  template: TemplateDefinition,
): Project {
  const screen = project.screens[0]
  if (!screen) return project
  const now = new Date().toISOString()
  return {
    ...project,
    updatedAt: now,
    screens: project.screens.map((item, index) =>
      index === 0
        ? {
            ...item,
            background: structuredClone(template.background),
            elements: templateElementsToScreenElements(template.elements),
          }
        : item,
    ),
  }
}

export async function renderTemplatePreview(
  template: TemplateDefinition,
  assetResolver: (assetId?: string) => string | undefined = () => undefined,
  scale: 1 | 2 | 3 = 1,
): Promise<string> {
  const cacheKey = `${template.id}@${scale}`
  const cached = thumbnailCache.get(cacheKey)
  if (cached) return cached

  const url = await renderScreenToDataUrl({
    screen: templateToScreen(template),
    assetResolver,
    scale,
    format: 'png',
    jpegQuality: 0.92,
    transparentBackground: false,
  })

  thumbnailCache.set(cacheKey, url)
  return url
}

export function clearTemplatePreviewCache() {
  thumbnailCache.clear()
}
