import {
  DEFAULT_BACKGROUND,
  DEFAULT_DESIGN_HEIGHT,
  DEFAULT_DESIGN_WIDTH,
  DEFAULT_DEVICE_HEIGHT,
  DEFAULT_DEVICE_ID,
  DEFAULT_DEVICE_SHADOW_INTENSITY,
  DEFAULT_DEVICE_SHADOW_SPREAD,
  DEFAULT_DEVICE_WIDTH,
  DEFAULT_DEVICE_X,
  DEFAULT_DEVICE_Y,
  DEFAULT_PROJECT_SETTINGS,
  DEFAULT_SHADOW,
  BRAND_PRIMARY,
} from '@/lib/constants'
import { createId } from '@/lib/utils'
import type {
  DeviceElement,
  Element,
  ImageElement,
  Project,
  Screen,
  ShapeElement,
  TextElement,
} from '@/lib/types'

export function createScreen(name = 'Screen 1'): Screen {
  return {
    id: createId(),
    name,
    width: DEFAULT_DESIGN_WIDTH,
    height: DEFAULT_DESIGN_HEIGHT,
    background: { ...DEFAULT_BACKGROUND },
    elements: [],
    platform: 'apple',
  }
}

function createDefaultDeviceElement(): DeviceElement {
  return {
    id: createId(),
    type: 'device',
    name: 'Device',
    deviceId: DEFAULT_DEVICE_ID,
    x: DEFAULT_DEVICE_X,
    y: DEFAULT_DEVICE_Y,
    width: DEFAULT_DEVICE_WIDTH,
    height: DEFAULT_DEVICE_HEIGHT,
    rotation: 0,
    opacity: 1,
    locked: false,
    visible: true,
    zIndex: 0,
    shadowIntensity: DEFAULT_DEVICE_SHADOW_INTENSITY,
    shadowSpread: DEFAULT_DEVICE_SHADOW_SPREAD,
  }
}

export function createDefaultScreen(name: string): Screen {
  const screen = createScreen(name)
  screen.elements = [createDefaultDeviceElement()]
  return screen
}

export function cloneScreenDesign(source: Screen, name: string): Screen {
  return {
    ...structuredClone(source),
    id: createId(),
    name,
    sourceScreenId: undefined,
    elements: source.elements.map((element) => ({
      ...structuredClone(element),
      id: createId(),
    })),
  }
}

export function createScreenFromPrevious(previous: Screen | undefined, name: string): Screen {
  if (previous) {
    return cloneScreenDesign(previous, name)
  }
  return createDefaultScreen(name)
}

export function createProject(name = 'Untitled Project'): Project {
  const now = new Date().toISOString()
  return {
    version: 1,
    id: createId(),
    name,
    createdAt: now,
    updatedAt: now,
    screens: [createScreen()],
    settings: { ...DEFAULT_PROJECT_SETTINGS },
  }
}

export function createTextElement(partial?: Partial<TextElement>): TextElement {
  return {
    id: createId(),
    type: 'text',
    name: 'Text',
    x: 100,
    y: 200,
    width: 500,
    height: 80,
    rotation: 0,
    opacity: 1,
    locked: false,
    visible: true,
    zIndex: 1,
    text: 'Your headline here',
    fontFamily: 'Inter',
    fontSize: 64,
    fontWeight: 700,
    fontStyle: 'normal',
    lineHeight: 1.2,
    letterSpacing: 0,
    fill: '#0f172a',
    textAlign: 'left',
    verticalAlign: 'top',
    textDecoration: 'none',
    padding: 0,
    shadow: { ...DEFAULT_SHADOW },
    ...partial,
  }
}

export function createShapeElement(
  shapeKind: ShapeElement['shapeKind'] = 'rectangle',
): ShapeElement {
  return {
    id: createId(),
    type: 'shape',
    name: shapeKind,
    x: 120,
    y: 400,
    width: shapeKind === 'line' ? 300 : 200,
    height: shapeKind === 'line' ? 4 : 200,
    rotation: 0,
    opacity: 1,
    locked: false,
    visible: true,
    zIndex: 0,
    shapeKind,
    fill: { type: 'solid', color: BRAND_PRIMARY },
    stroke: '#4338ca',
    strokeWidth: shapeKind === 'line' ? 4 : 0,
    dash: [],
    cornerRadius: shapeKind === 'rectangle' ? 16 : 0,
    shadow: { ...DEFAULT_SHADOW },
  }
}

export function createImageElement(partial?: Partial<ImageElement>): ImageElement {
  return {
    id: createId(),
    type: 'image',
    name: 'Image',
    x: 200,
    y: 600,
    width: 400,
    height: 400,
    rotation: 0,
    opacity: 1,
    locked: false,
    visible: true,
    zIndex: 2,
    cropX: 0,
    cropY: 0,
    cropWidth: 1,
    cropHeight: 1,
    cornerRadius: 0,
    borderWidth: 0,
    borderColor: '#000000',
    brightness: 0,
    contrast: 0,
    saturation: 0,
    blur: 0,
    flipX: false,
    flipY: false,
    objectFit: 'cover',
    shadow: { ...DEFAULT_SHADOW },
    ...partial,
  }
}

export function duplicateElement(element: Element): Element {
  return {
    ...structuredClone(element),
    id: createId(),
    name: `${element.name} copy`,
    x: element.x + 20,
    y: element.y + 20,
  }
}

export type ZIndexSortDirection = 'asc' | 'desc'

export function sortElementsByZIndex(
  elements: Element[],
  direction: ZIndexSortDirection = 'asc',
): Element[] {
  const factor = direction === 'asc' ? 1 : -1
  return [...elements].sort((a, b) => (a.zIndex - b.zIndex) * factor)
}

export function reindexElements(elements: Element[]): Element[] {
  return elements.map((element, index) => ({
    ...element,
    zIndex: index,
  }))
}

export function cloneProject(project: Project, name?: string): Project {
  const now = new Date().toISOString()
  return {
    ...structuredClone(project),
    id: createId(),
    name: name ?? `${project.name} copy`,
    createdAt: now,
    updatedAt: now,
    screens: project.screens.map((screen) => ({
      ...structuredClone(screen),
      id: createId(),
      name: `${screen.name} copy`.replace(/ copy copy/g, ' copy'),
      elements: screen.elements.map((element) => ({
        ...structuredClone(element),
        id: createId(),
      })),
    })),
  }
}
