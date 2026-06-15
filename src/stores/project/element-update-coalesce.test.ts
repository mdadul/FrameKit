import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  COALESCE_WINDOW_MS,
  buildElementCoalesceKey,
  endElementCoalesce,
  resetElementCoalesce,
  resolveElementUpdateHistory,
} from '@/stores/project/element-update-coalesce'

describe('element-update-coalesce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    resetElementCoalesce()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('builds a stable key from element id and sorted patch fields', () => {
    expect(buildElementCoalesceKey('el-1', { opacity: 0.5, x: 10 })).toBe('el-1:opacity,x')
  })

  it('records history on the first update and coalesces rapid repeats', () => {
    expect(resolveElementUpdateHistory('el-1', { opacity: 0.5 })).toBe(true)
    expect(resolveElementUpdateHistory('el-1', { opacity: 0.6 })).toBe(false)
    expect(resolveElementUpdateHistory('el-1', { opacity: 0.7 })).toBe(false)
  })

  it('records history again when patch fields change', () => {
    resolveElementUpdateHistory('el-1', { opacity: 0.5 })
    expect(resolveElementUpdateHistory('el-1', { x: 12 })).toBe(true)
  })

  it('records history again after endElementCoalesce', () => {
    resolveElementUpdateHistory('el-1', { opacity: 0.5 })
    endElementCoalesce()
    expect(resolveElementUpdateHistory('el-1', { opacity: 0.6 })).toBe(true)
  })

  it('records history again after the coalesce window expires', () => {
    resolveElementUpdateHistory('el-1', { opacity: 0.5 })
    vi.advanceTimersByTime(COALESCE_WINDOW_MS + 1)
    expect(resolveElementUpdateHistory('el-1', { opacity: 0.6 })).toBe(true)
  })
})
