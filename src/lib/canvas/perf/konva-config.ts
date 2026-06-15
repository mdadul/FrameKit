import Konva from 'konva'

export function applyKonvaPixelRatio(highDpiCanvas: boolean): void {
  Konva.pixelRatio = highDpiCanvas
    ? Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2)
    : 1
}

export function isPerfOverlayEnabled(): boolean {
  if (typeof window === 'undefined') return false
  return (
    new URLSearchParams(window.location.search).has('perf') ||
    window.localStorage.getItem('framekit:perf') === '1'
  )
}
