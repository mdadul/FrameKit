import type { Element, Screen } from '@/lib/types'

function elementSignature(
  element: Element,
  assetResolver: (assetId?: string) => string | undefined,
): string {
  const base = [
    element.id,
    element.type,
    element.x,
    element.y,
    element.width,
    element.height,
    element.rotation,
    element.opacity,
    element.visible,
    element.zIndex,
    element.groupId ?? '',
    element.locked,
  ]
  if (element.type === 'text') {
    base.push(
      element.text,
      element.fontFamily,
      element.fontSize,
      element.fill,
      element.fontWeight,
      element.fontStyle,
    )
  }
  if (element.type === 'image') {
    base.push(element.assetId ?? '', element.src ?? '', assetResolver(element.assetId) ?? '')
  }
  if (element.type === 'device') {
    base.push(
      element.deviceId,
      element.screenshotAssetId ?? '',
      assetResolver(element.screenshotAssetId) ?? '',
      element.colorVariant ?? '',
      String(element.showFrame !== false),
    )
  }
  if (element.type === 'shape') {
    base.push(element.shapeKind, JSON.stringify(element.fill), element.stroke, element.strokeWidth)
  }
  return base.join('|')
}

/** Stable content fingerprint without stringifying the entire screen object. */
export function screenContentSignature(
  screen: Screen,
  assetResolver: (assetId?: string) => string | undefined,
): string {
  const elements = [...screen.elements]
    .sort((a, b) => a.zIndex - b.zIndex)
    .map((element) => elementSignature(element, assetResolver))
    .join(';;')
  return [
    screen.id,
    screen.width,
    screen.height,
    JSON.stringify(screen.background),
    elements,
  ].join('::')
}
