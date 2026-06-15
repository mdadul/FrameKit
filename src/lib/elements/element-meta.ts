import {
  Circle,
  Folder,
  Image as ImageIcon,
  Layers,
  Minus,
  Smartphone,
  Square,
  Triangle,
  Type,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Element, ShapeElement, ShapeKind, TextElement, ImageElement, DeviceElement } from '@/lib/types'

export const ELEMENT_TYPE_META: Record<
  Element['type'],
  { label: string; icon: LucideIcon }
> = {
  text: { label: 'Text', icon: Type },
  shape: { label: 'Shape', icon: Square },
  image: { label: 'Image', icon: ImageIcon },
  device: { label: 'Device', icon: Smartphone },
  group: { label: 'Group', icon: Layers },
}

const SHAPE_KIND_ICONS: Record<ShapeKind, LucideIcon> = {
  rectangle: Square,
  circle: Circle,
  triangle: Triangle,
  line: Minus,
}

export function isTextElement(element: Element): element is TextElement {
  return element.type === 'text'
}

export function isImageElement(element: Element): element is ImageElement {
  return element.type === 'image'
}

export function isDeviceElement(element: Element): element is DeviceElement {
  return element.type === 'device'
}

export function isShapeElement(element: Element): element is ShapeElement {
  return element.type === 'shape'
}

export function getElementTypeLabel(element: Element): string {
  return ELEMENT_TYPE_META[element.type].label
}

export function getElementTypeIcon(element: Element): LucideIcon {
  if (element.type === 'shape') {
    return SHAPE_KIND_ICONS[element.shapeKind] ?? Square
  }
  return ELEMENT_TYPE_META[element.type].icon
}

export function getLayerIcon(element: Element): LucideIcon {
  if (element.type === 'group') return Folder
  return getElementTypeIcon(element)
}
