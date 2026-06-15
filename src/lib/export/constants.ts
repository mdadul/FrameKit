/** Default store presets for one-click export (matches common design canvas + Android phone). */
export const SMART_EXPORT_PRESETS = ['apple-6-7', 'android-phone'] as const

export type SmartExportPresetId = (typeof SMART_EXPORT_PRESETS)[number]
