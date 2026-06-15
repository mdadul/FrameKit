import type {
  BackgroundConfig,
  BrandKit,
  ExportPreferences,
  ProjectSettings,
  ShadowConfig,
  UserPreferences,
  WorkspacePreferences,
} from '@/lib/types'

export const BRAND_PRIMARY = '#0D9488'
export const BRAND_PRIMARY_LIGHT = '#2DD4BF'

export const APP_NAME = 'Framekit'
export const APP_TAGLINE = 'Store-ready screenshots'
export const APP_DESCRIPTION =
  'Design App Store and Google Play screenshots in your browser. Device mockups, templates, multi-screen projects, and one-click store export — local-first, no account.'

export const DEFAULT_DESIGN_WIDTH = 1290
export const DEFAULT_DESIGN_HEIGHT = 2796

/** Matches toolbar “Add device” — iPhone 16 Pro Max at full artboard scale */
export const DEFAULT_DEVICE_ID = 'iphone-16-pro-max'
export const DEFAULT_DEVICE_WIDTH = 1000
export const DEFAULT_DEVICE_HEIGHT = 2000
export const DEFAULT_DEVICE_SHADOW_INTENSITY = 0.35
export const DEFAULT_DEVICE_SHADOW_SPREAD = 24
export const DEFAULT_DEVICE_X = (DEFAULT_DESIGN_WIDTH - DEFAULT_DEVICE_WIDTH) / 2
export const DEFAULT_DEVICE_Y = 300

export function scaledDeviceFrame(scale: number) {
  return {
    width: Math.round(DEFAULT_DEVICE_WIDTH * scale),
    height: Math.round(DEFAULT_DEVICE_HEIGHT * scale),
  }
}
export const MAX_SCREENS = 10
export const MAX_HISTORY = 100
export const MAX_ELEMENTS_SOFT = 50

export const DEFAULT_SHADOW: ShadowConfig = {
  enabled: false,
  offsetX: 0,
  offsetY: 4,
  blur: 12,
  color: 'rgba(0,0,0,0.25)',
}

export const DEFAULT_BACKGROUND: BackgroundConfig = {
  type: 'solid',
  color: '#ffffff',
}

export const DEFAULT_PROJECT_SETTINGS: ProjectSettings = {
  designWidth: DEFAULT_DESIGN_WIDTH,
  designHeight: DEFAULT_DESIGN_HEIGHT,
}

export const DEFAULT_BRAND_KIT: BrandKit = {
  colors: ['#0D9488', '#0891B2', '#ec4899', '#f59e0b', '#10b981', '#1c1917', '#ffffff'],
  fonts: ['Inter', 'Roboto', 'Poppins', 'Montserrat', 'Open Sans'],
}

export const DEFAULT_WORKSPACE: WorkspacePreferences = {
  showGrid: false,
  gridSize: 20,
  showRulers: false,
  showSmartGuides: true,
  snapSensitivity: 8,
  defaultZoom: 0.35,
  nudgeStep: 1,
  canvasCheckerboard: true,
  highDpiCanvas: true,
}

export const DEFAULT_EXPORT_PREFS: ExportPreferences = {
  defaultFormat: 'png',
  defaultScale: 1,
  jpegQuality: 0.92,
  transparentBackground: false,
  fileNamePattern: '{project}-{screen}-{preset}',
  lastUsedPresets: [],
  resizeStrategy: 'fit',
}

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  id: 'default',
  theme: 'system',
  workspace: DEFAULT_WORKSPACE,
  export: DEFAULT_EXPORT_PREFS,
  brandKit: DEFAULT_BRAND_KIT,
}

export const GOOGLE_FONTS = [
  'Inter',
  'Roboto',
  'Poppins',
  'Montserrat',
  'Open Sans',
  'Lato',
  'Oswald',
  'Raleway',
  'Nunito',
  'Playfair Display',
]

export const GITHUB_REPO_URL = 'https://github.com/emdadulislam/app-screen-generator'
