import type { Element, Screen } from '@/lib/types'

export type ResizeStrategy = 'fit' | 'fill' | 'crop'

export interface ResizeResult {
  width: number
  height: number
  elements: Element[]
  background: Screen['background']
}

export interface AutoResizeOptions {
  strategy?: ResizeStrategy
}

function scaleElement(element: Element, scale: number, offsetX: number, offsetY: number): Element {
  const resized = {
    ...structuredClone(element),
    x: element.x * scale + offsetX,
    y: element.y * scale + offsetY,
    width: element.width * scale,
    height: element.height * scale,
  }

  if (resized.type === 'text') {
    resized.fontSize = Math.round(resized.fontSize * scale)
    resized.letterSpacing = resized.letterSpacing * scale
    if (resized.strokeWidth) resized.strokeWidth = resized.strokeWidth * scale
    if (resized.shadow?.enabled) {
      resized.shadow = {
        ...resized.shadow,
        offsetX: resized.shadow.offsetX * scale,
        offsetY: resized.shadow.offsetY * scale,
        blur: resized.shadow.blur * scale,
      }
    }
  }

  if (resized.type === 'shape') {
    resized.strokeWidth = resized.strokeWidth * scale
    resized.cornerRadius = resized.cornerRadius * scale
    if (resized.shadow?.enabled) {
      resized.shadow = {
        ...resized.shadow,
        offsetX: resized.shadow.offsetX * scale,
        offsetY: resized.shadow.offsetY * scale,
        blur: resized.shadow.blur * scale,
      }
    }
  }

  if (resized.type === 'image') {
    resized.borderWidth = resized.borderWidth * scale
    resized.cornerRadius = resized.cornerRadius * scale
    resized.blur = resized.blur * scale
    if (resized.shadow?.enabled) {
      resized.shadow = {
        ...resized.shadow,
        offsetX: resized.shadow.offsetX * scale,
        offsetY: resized.shadow.offsetY * scale,
        blur: resized.shadow.blur * scale,
      }
    }
  }

  if (resized.type === 'device') {
    resized.shadowSpread = resized.shadowSpread * scale
  }

  return resized
}

export function autoResizeScreen(
  screen: Screen,
  targetWidth: number,
  targetHeight: number,
  options: AutoResizeOptions = {},
): ResizeResult {
  const strategy = options.strategy ?? 'fit'
  const scaleX = targetWidth / screen.width
  const scaleY = targetHeight / screen.height

  let scale: number
  let offsetX: number
  let offsetY: number

  if (strategy === 'fit') {
    scale = Math.min(scaleX, scaleY)
    offsetX = (targetWidth - screen.width * scale) / 2
    offsetY = (targetHeight - screen.height * scale) / 2
  } else if (strategy === 'fill') {
    scale = Math.max(scaleX, scaleY)
    offsetX = (targetWidth - screen.width * scale) / 2
    offsetY = (targetHeight - screen.height * scale) / 2
  } else {
    scale = Math.max(scaleX, scaleY)
    offsetX = 0
    offsetY = 0
  }

  const elements = screen.elements.map((element) => scaleElement(element, scale, offsetX, offsetY))

  return {
    width: targetWidth,
    height: targetHeight,
    elements,
    background: structuredClone(screen.background),
  }
}
