import { useReducer, type Dispatch } from 'react'
import type { ExportPreferences } from '@/lib/types'
import {
  createExportFormState,
  exportFormReducer,
  type ExportFormAction,
  type ExportFormState,
} from '@/lib/export/export-form-state'

export function useExportFormReducer(
  prefs: ExportPreferences,
  defaultPresets: string[],
): [ExportFormState, Dispatch<ExportFormAction>] {
  return useReducer(
    exportFormReducer,
    { prefs, defaultPresets },
    ({ prefs, defaultPresets }) => createExportFormState(prefs, defaultPresets),
  )
}
