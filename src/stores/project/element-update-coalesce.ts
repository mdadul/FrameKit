import type { Element } from '@/lib/types'

export const COALESCE_WINDOW_MS = 500

let coalesceKey: string | null = null
let coalesceTimer: ReturnType<typeof setTimeout> | null = null

export function buildElementCoalesceKey(elementId: string, patch: Partial<Element>): string {
  return `${elementId}:${Object.keys(patch).sort().join(',')}`
}

function scheduleCoalesceClear() {
  if (coalesceTimer) clearTimeout(coalesceTimer)
  coalesceTimer = setTimeout(resetElementCoalesce, COALESCE_WINDOW_MS)
}

/** Returns whether this update should push a new history baseline. */
export function resolveElementUpdateHistory(
  elementId: string,
  patch: Partial<Element>,
): boolean {
  const key = buildElementCoalesceKey(elementId, patch)
  const recordHistory = key !== coalesceKey
  coalesceKey = key
  scheduleCoalesceClear()
  return recordHistory
}

export function resetElementCoalesce() {
  coalesceKey = null
  if (coalesceTimer) {
    clearTimeout(coalesceTimer)
    coalesceTimer = null
  }
}

export function endElementCoalesce() {
  resetElementCoalesce()
}
