import {
  DEFAULT_DEVICE_HEIGHT,
  DEFAULT_DEVICE_ID,
  DEFAULT_DEVICE_SHADOW_INTENSITY,
  DEFAULT_DEVICE_SHADOW_SPREAD,
  DEFAULT_DEVICE_WIDTH,
  BRAND_PRIMARY,
} from '@/lib/constants'
import type {
  BackgroundConfig,
  DeviceElement,
  GradientStop,
  ImageElement,
  MeshBlob,
  PatternKind,
  ShapeElement,
  TextElement,
} from '@/lib/types'
import type { TemplateElement } from '@/lib/templates/types'

type TextPartial = Partial<TextElement> & Pick<TextElement, 'name' | 'text' | 'x' | 'y' | 'width' | 'height'>
type ShapePartial = Partial<ShapeElement> & Pick<ShapeElement, 'name' | 'x' | 'y' | 'width' | 'height' | 'shapeKind'>
type DevicePartial = Partial<DeviceElement> & Pick<DeviceElement, 'name' | 'x' | 'y'>
type ImagePartial = Partial<ImageElement> & Pick<ImageElement, 'name' | 'x' | 'y' | 'width' | 'height'>

export function textEl(partial: TextPartial): TemplateElement {
  return {
    type: 'text',
    rotation: 0,
    opacity: 1,
    locked: false,
    visible: true,
    fontFamily: 'Inter',
    fontSize: 64,
    fontWeight: 700,
    fontStyle: 'normal',
    lineHeight: 1.2,
    letterSpacing: 0,
    fill: '#ffffff',
    textAlign: 'left',
    verticalAlign: 'top',
    textDecoration: 'none',
    padding: 0,
    ...partial,
  }
}

export function shapeEl(partial: ShapePartial): TemplateElement {
  return {
    type: 'shape',
    rotation: 0,
    opacity: 1,
    locked: false,
    visible: true,
    fill: { type: 'solid', color: BRAND_PRIMARY },
    stroke: 'transparent',
    strokeWidth: 0,
    dash: [],
    cornerRadius: partial.shapeKind === 'rectangle' ? 16 : 0,
    ...partial,
  }
}

export function deviceEl(partial: DevicePartial): TemplateElement {
  return {
    type: 'device',
    rotation: 0,
    opacity: 1,
    locked: false,
    visible: true,
    deviceId: DEFAULT_DEVICE_ID,
    width: DEFAULT_DEVICE_WIDTH,
    height: DEFAULT_DEVICE_HEIGHT,
    shadowIntensity: DEFAULT_DEVICE_SHADOW_INTENSITY,
    shadowSpread: DEFAULT_DEVICE_SHADOW_SPREAD,
    showFrame: true,
    screenshotFit: 'cover',
    ...partial,
  }
}

export function imageEl(partial: ImagePartial): TemplateElement {
  return {
    type: 'image',
    rotation: 0,
    opacity: 1,
    locked: false,
    visible: true,
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
    ...partial,
  }
}

export function bgSolid(color: string): BackgroundConfig {
  return { type: 'solid', color }
}

export function bgLinear(angle: number, stops: GradientStop[]): BackgroundConfig {
  return {
    type: 'linear-gradient',
    gradient: { type: 'linear', angle, stops },
  }
}

export function bgRadial(stops: GradientStop[]): BackgroundConfig {
  return {
    type: 'radial-gradient',
    gradient: { type: 'radial', stops },
  }
}

export function bgMesh(colors: string[], blobs?: MeshBlob[]): BackgroundConfig {
  return {
    type: 'mesh',
    meshColors: colors,
    meshBlobs: blobs,
  }
}

export function bgPattern(
  baseColor: string,
  patternKind: PatternKind,
  patternColor: string,
  patternScale = 1,
): BackgroundConfig {
  return {
    type: 'pattern',
    color: baseColor,
    patternKind,
    patternColor,
    patternScale,
  }
}

/** Default mesh blob positions tuned for 1290×2796 canvas */
export function defaultMeshBlobs(colors: string[]): MeshBlob[] {
  return [
    { color: colors[0], x: 0.2, y: 0.15, radius: 0.45 },
    { color: colors[1] ?? colors[0], x: 0.75, y: 0.35, radius: 0.4 },
    { color: colors[2] ?? colors[0], x: 0.5, y: 0.7, radius: 0.35 },
  ]
}
