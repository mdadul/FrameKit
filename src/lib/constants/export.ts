import type { ExportPreferences } from '@/lib/types'

export const DEFAULT_EXPORT_PREFS: ExportPreferences = {
  defaultFormat: 'png',
  defaultScale: 1,
  jpegQuality: 0.92,
  transparentBackground: false,
  fileNamePattern: '{project}-{screen}-{preset}',
  lastUsedPresets: [],
  resizeStrategy: 'fit',
}
