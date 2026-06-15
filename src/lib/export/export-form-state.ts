import type { ExportDialogTab } from '@/lib/export/types'
import type { ExportFormat, ExportPreferences, ResizeStrategy } from '@/lib/types'

export interface ExportFormState {
  tab: ExportDialogTab
  format: ExportFormat
  scale: 1 | 2 | 3
  transparentBackground: boolean
  jpegQuality: number
  resizeStrategy: ResizeStrategy
  currentTarget: string
  selectedPresets: string[]
  selectedScreenIds: string[]
  organizeByPlatform: boolean
  platformAware: boolean
  progress: { completed: number; total: number } | null
  busy: boolean
}

export type ExportFormAction =
  | { type: 'set_tab'; tab: ExportDialogTab }
  | { type: 'set_format'; format: ExportFormat }
  | { type: 'set_scale'; scale: 1 | 2 | 3 }
  | { type: 'set_transparent_background'; value: boolean }
  | { type: 'set_jpeg_quality'; value: number }
  | { type: 'set_resize_strategy'; value: ResizeStrategy }
  | { type: 'set_current_target'; value: string }
  | { type: 'toggle_preset'; presetId: string; checked: boolean }
  | { type: 'toggle_screen'; screenId: string; checked: boolean }
  | { type: 'toggle_all_screens'; checked: boolean; allIds: string[] }
  | { type: 'set_organize_by_platform'; value: boolean }
  | { type: 'set_platform_aware'; value: boolean }
  | { type: 'set_progress'; progress: ExportFormState['progress'] }
  | { type: 'set_busy'; busy: boolean }
  | { type: 'init_screens'; screenIds: string[] }

export function createExportFormState(
  prefs: ExportPreferences,
  defaultPresets: string[],
): ExportFormState {
  return {
    tab: 'quick',
    format: prefs.defaultFormat,
    scale: prefs.defaultScale,
    transparentBackground: prefs.transparentBackground,
    jpegQuality: prefs.jpegQuality,
    resizeStrategy: prefs.resizeStrategy ?? 'fit',
    currentTarget: 'design',
    selectedPresets:
      prefs.lastUsedPresets.length > 0 ? prefs.lastUsedPresets : defaultPresets,
    selectedScreenIds: [],
    organizeByPlatform: true,
    platformAware: true,
    progress: null,
    busy: false,
  }
}

export function exportFormReducer(
  state: ExportFormState,
  action: ExportFormAction,
): ExportFormState {
  switch (action.type) {
    case 'set_tab':
      return { ...state, tab: action.tab }
    case 'set_format':
      return { ...state, format: action.format }
    case 'set_scale':
      return { ...state, scale: action.scale }
    case 'set_transparent_background':
      return { ...state, transparentBackground: action.value }
    case 'set_jpeg_quality':
      return { ...state, jpegQuality: action.value }
    case 'set_resize_strategy':
      return { ...state, resizeStrategy: action.value }
    case 'set_current_target':
      return { ...state, currentTarget: action.value }
    case 'toggle_preset':
      return {
        ...state,
        selectedPresets: action.checked
          ? [...state.selectedPresets, action.presetId]
          : state.selectedPresets.filter((id) => id !== action.presetId),
      }
    case 'toggle_screen':
      return {
        ...state,
        selectedScreenIds: action.checked
          ? [...state.selectedScreenIds, action.screenId]
          : state.selectedScreenIds.filter((id) => id !== action.screenId),
      }
    case 'toggle_all_screens':
      return {
        ...state,
        selectedScreenIds: action.checked ? action.allIds : [],
      }
    case 'set_organize_by_platform':
      return { ...state, organizeByPlatform: action.value }
    case 'set_platform_aware':
      return { ...state, platformAware: action.value }
    case 'set_progress':
      return { ...state, progress: action.progress }
    case 'set_busy':
      return { ...state, busy: action.busy }
    case 'init_screens':
      return { ...state, selectedScreenIds: action.screenIds }
    default:
      return state
  }
}
