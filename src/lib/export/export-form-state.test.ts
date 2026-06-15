import { describe, expect, it } from 'vitest'
import {
  createExportFormState,
  exportFormReducer,
  type ExportFormState,
} from '@/lib/export/export-form-state'
import { DEFAULT_EXPORT_PREFS } from '@/lib/constants/export'

const baseState = createExportFormState(DEFAULT_EXPORT_PREFS, ['preset-a', 'preset-b'])

describe('exportFormReducer', () => {
  it('toggles a screen id on and off', () => {
    const added = exportFormReducer(baseState, {
      type: 'toggle_screen',
      screenId: 'screen-1',
      checked: true,
    })
    expect(added.selectedScreenIds).toEqual(['screen-1'])

    const removed = exportFormReducer(added, {
      type: 'toggle_screen',
      screenId: 'screen-1',
      checked: false,
    })
    expect(removed.selectedScreenIds).toEqual([])
  })

  it('selects all screens when toggle_all_screens is checked', () => {
    const next = exportFormReducer(baseState, {
      type: 'toggle_all_screens',
      checked: true,
      allIds: ['a', 'b'],
    })
    expect(next.selectedScreenIds).toEqual(['a', 'b'])
  })

  it('initializes selected screens from init_screens', () => {
    const next = exportFormReducer(baseState, {
      type: 'init_screens',
      screenIds: ['x', 'y'],
    })
    expect(next.selectedScreenIds).toEqual(['x', 'y'])
  })

  it('tracks export progress and busy state', () => {
    let state: ExportFormState = exportFormReducer(baseState, { type: 'set_busy', busy: true })
    state = exportFormReducer(state, {
      type: 'set_progress',
      progress: { completed: 2, total: 5 },
    })
    expect(state.busy).toBe(true)
    expect(state.progress).toEqual({ completed: 2, total: 5 })
  })
})
