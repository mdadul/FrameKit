export type ElementType = 'text' | 'image' | 'shape' | 'device' | 'group'
export type ShapeKind = 'rectangle' | 'circle' | 'line' | 'triangle'
export type BackgroundType =
  | 'solid'
  | 'linear-gradient'
  | 'radial-gradient'
  | 'mesh'
  | 'pattern'
  | 'image'

export type PatternKind =
  | 'dots'
  | 'grid'
  | 'diagonal'
  | 'crosshatch'
  | 'checker'
  | 'triangles'
  | 'noise'
export type ImageFit = 'cover' | 'contain' | 'fill'
export type ThemeMode = 'light' | 'dark' | 'system'
export type ExportFormat = 'png' | 'jpeg'

export interface ShadowConfig {
  offsetX: number
  offsetY: number
  blur: number
  color: string
  enabled: boolean
}

export interface GradientStop {
  offset: number
  color: string
}

export interface GradientFill {
  type: 'linear' | 'radial'
  angle?: number
  stops: GradientStop[]
}

export interface FillConfig {
  type: 'solid' | 'gradient'
  color?: string
  gradient?: GradientFill
}

export interface MeshBlob {
  color: string
  x: number
  y: number
  radius: number
}

export interface BackgroundConfig {
  type: BackgroundType
  color?: string
  gradient?: GradientFill
  meshColors?: string[]
  meshBlobs?: MeshBlob[]
  patternKind?: PatternKind
  patternColor?: string
  patternScale?: number
  imageAssetId?: string
  imageFit?: ImageFit
  overlayColor?: string
}

export interface BaseElement {
  id: string
  type: ElementType
  x: number
  y: number
  width: number
  height: number
  rotation: number
  opacity: number
  locked: boolean
  visible: boolean
  name: string
  zIndex: number
  groupId?: string
  shadow?: ShadowConfig
}

export interface TextElement extends BaseElement {
  type: 'text'
  text: string
  fontFamily: string
  fontSize: number
  fontWeight: number
  fontStyle: 'normal' | 'italic'
  lineHeight: number
  letterSpacing: number
  fill: string
  textAlign: 'left' | 'center' | 'right' | 'justify'
  verticalAlign: 'top' | 'middle' | 'bottom'
  textDecoration: 'none' | 'underline' | 'line-through' | 'underline line-through'
  padding: number
  stroke?: string
  strokeWidth?: number
}

export interface ImageElement extends BaseElement {
  type: 'image'
  assetId?: string
  src?: string
  cropX: number
  cropY: number
  cropWidth: number
  cropHeight: number
  cornerRadius: number
  borderWidth: number
  borderColor: string
  brightness: number
  contrast: number
  saturation: number
  blur: number
  flipX: boolean
  flipY: boolean
  objectFit: ImageFit
}

export interface ShapeElement extends BaseElement {
  type: 'shape'
  shapeKind: ShapeKind
  fill: FillConfig
  stroke: string
  strokeWidth: number
  dash: number[]
  cornerRadius: number
}

export type ScreenshotFit = 'cover' | 'contain'

export interface DeviceElement extends BaseElement {
  type: 'device'
  deviceId: string
  screenshotAssetId?: string
  shadowIntensity: number
  shadowSpread: number
  colorVariant?: string
  showFrame?: boolean
  screenshotFit?: ScreenshotFit
  tiltX?: number
  tiltY?: number
  perspective?: number
}

export interface GroupElement extends BaseElement {
  type: 'group'
  childIds: string[]
}

export type Element =
  | TextElement
  | ImageElement
  | ShapeElement
  | DeviceElement
  | GroupElement

export type ScreenPlatform = 'apple' | 'android'

export interface Screen {
  id: string
  name: string
  width: number
  height: number
  background: BackgroundConfig
  elements: Element[]
  platform?: ScreenPlatform
  sourceScreenId?: string
}

export interface BrandKit {
  colors: string[]
  fonts: string[]
}

export interface ProjectSettings {
  designWidth: number
  designHeight: number
  brandKitOverride?: BrandKit
  exportPresets?: string[]
}

export interface Project {
  version: 1
  id: string
  name: string
  createdAt: string
  updatedAt: string
  screens: Screen[]
  settings: ProjectSettings
}

export interface WorkspacePreferences {
  showGrid: boolean
  gridSize: number
  showRulers: boolean
  showSmartGuides: boolean
  snapSensitivity: number
  defaultZoom: number
  nudgeStep: number
  canvasCheckerboard: boolean
}

export interface ExportPreferences {
  defaultFormat: ExportFormat
  defaultScale: 1 | 2 | 3
  jpegQuality: number
  transparentBackground: boolean
  fileNamePattern: string
  lastUsedPresets: string[]
}

export interface UserPreferences {
  id: 'default'
  theme: ThemeMode
  workspace: WorkspacePreferences
  export: ExportPreferences
  brandKit: BrandKit
}

export interface AssetRecord {
  id: string
  projectId: string
  name: string
  type: 'screenshot' | 'logo' | 'background' | 'icon'
  blob: Blob
  mimeType: string
  createdAt: string
}

export type DeviceNotch = 'island' | 'notch' | 'punch-hole' | 'none'

export interface DeviceColorVariant {
  id: string
  name: string
  body: string
  edge: string
}

export interface DeviceDefinition {
  id: string
  name: string
  platform: 'apple' | 'android'
  frameWidth: number
  frameHeight: number
  screenX: number
  screenY: number
  screenWidth: number
  screenHeight: number
  frameColor: string
  bodyRadius: number
  screenRadius: number
  notch: DeviceNotch
  colorVariants: DeviceColorVariant[]
}

export interface StorePreset {
  id: string
  name: string
  platform: 'apple' | 'android'
  width: number
  height: number
}

export type {
  TemplateDefinition,
  TemplateLayoutId,
  TemplateCategory,
} from '@/lib/templates/types'

export interface SSGProjectFile {
  version: 1
  name: string
  createdAt: string
  updatedAt: string
  screens: Screen[]
  settings: ProjectSettings
  assets?: Array<{
    id: string
    name: string
    type: AssetRecord['type']
    mimeType: string
    data: string
  }>
}

export interface ClipboardData {
  elements: Element[]
}
