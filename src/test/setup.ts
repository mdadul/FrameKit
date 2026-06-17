import '@testing-library/jest-dom/vitest'

type MockContext = CanvasRenderingContext2D & {
  __canvas: HTMLCanvasElement
}

function createMockContext2d(canvas: HTMLCanvasElement): MockContext {
  const state = {
    fillStyle: '#000000',
    strokeStyle: '#000000',
    lineWidth: 1,
    globalAlpha: 1,
    font: '10px sans-serif',
    textAlign: 'start' as CanvasTextAlign,
    textBaseline: 'alphabetic' as CanvasTextBaseline,
    shadowColor: 'rgba(0, 0, 0, 0)',
    shadowBlur: 0,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    lineJoin: 'miter' as CanvasLineJoin,
    miterLimit: 10,
    filter: 'none',
    letterSpacing: '0px',
  }

  const context = {
    __canvas: canvas,
    canvas,
    save() {},
    restore() {},
    scale() {},
    translate() {},
    rotate() {},
    clip() {},
    beginPath() {},
    closePath() {},
    moveTo() {},
    lineTo() {},
    stroke() {},
    fill() {},
    arc() {},
    ellipse() {},
    rect() {},
    roundRect() {},
    strokeRect() {},
    fillRect() {},
    drawImage() {},
    measureText(text: string) {
      return { width: text.length * 8 }
    },
    fillText() {},
    strokeText() {},
    setLineDash() {},
    createLinearGradient() {
      const stops: Array<{ offset: number; color: string }> = []
      return {
        addColorStop(offset: number, color: string) {
          stops.push({ offset, color })
        },
        stops,
      }
    },
    createRadialGradient() {
      const stops: Array<{ offset: number; color: string }> = []
      return {
        addColorStop(offset: number, color: string) {
          stops.push({ offset, color })
        },
        stops,
      }
    },
    get fillStyle() {
      return state.fillStyle
    },
    set fillStyle(value: string) {
      state.fillStyle = value
    },
    get strokeStyle() {
      return state.strokeStyle
    },
    set strokeStyle(value: string) {
      state.strokeStyle = value
    },
    get lineWidth() {
      return state.lineWidth
    },
    set lineWidth(value: number) {
      state.lineWidth = value
    },
    get globalAlpha() {
      return state.globalAlpha
    },
    set globalAlpha(value: number) {
      state.globalAlpha = value
    },
    get font() {
      return state.font
    },
    set font(value: string) {
      state.font = value
    },
    get textAlign() {
      return state.textAlign
    },
    set textAlign(value: CanvasTextAlign) {
      state.textAlign = value
    },
    get textBaseline() {
      return state.textBaseline
    },
    set textBaseline(value: CanvasTextBaseline) {
      state.textBaseline = value
    },
    get shadowColor() {
      return state.shadowColor
    },
    set shadowColor(value: string) {
      state.shadowColor = value
    },
    get shadowBlur() {
      return state.shadowBlur
    },
    set shadowBlur(value: number) {
      state.shadowBlur = value
    },
    get shadowOffsetX() {
      return state.shadowOffsetX
    },
    set shadowOffsetX(value: number) {
      state.shadowOffsetX = value
    },
    get shadowOffsetY() {
      return state.shadowOffsetY
    },
    set shadowOffsetY(value: number) {
      state.shadowOffsetY = value
    },
    get lineJoin() {
      return state.lineJoin
    },
    set lineJoin(value: CanvasLineJoin) {
      state.lineJoin = value
    },
    get miterLimit() {
      return state.miterLimit
    },
    set miterLimit(value: number) {
      state.miterLimit = value
    },
    get filter() {
      return state.filter
    },
    set filter(value: string) {
      state.filter = value
    },
    get letterSpacing() {
      return state.letterSpacing
    },
    set letterSpacing(value: string) {
      state.letterSpacing = value
    },
  }

  return context as unknown as MockContext
}

const originalCreateElement = document.createElement.bind(document)

document.createElement = ((tagName: string, options?: ElementCreationOptions) => {
  const element = originalCreateElement(tagName, options)
  if (tagName.toLowerCase() !== 'canvas') return element

  const canvas = element as HTMLCanvasElement
  const context = createMockContext2d(canvas)

  canvas.getContext = ((contextId: string) => {
    if (contextId === '2d') return context
    return null
  }) as typeof canvas.getContext

  canvas.toDataURL = ((type?: string) => {
    const mime = type?.includes('jpeg') ? 'image/jpeg' : 'image/png'
    const payload = btoa(`${mime}:${canvas.width}x${canvas.height}`)
    return `data:${mime};base64,${payload}`
  }) as typeof canvas.toDataURL

  return canvas
}) as typeof document.createElement

class MockImage {
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  crossOrigin = ''
  naturalWidth = 100
  naturalHeight = 100
  width = 100
  height = 100
  private _src = ''

  get src() {
    return this._src
  }

  set src(value: string) {
    this._src = value
    queueMicrotask(() => this.onload?.())
  }
}

if (typeof globalThis.Image === 'undefined') {
  globalThis.Image = MockImage as unknown as typeof Image
}
