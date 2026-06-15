import type {
  BackgroundConfig,
  Element,
  ExportFormat,
  FillConfig,
  ImageElement,
  Screen,
  TextElement,
} from '@/lib/types'
import { autoResizeScreen } from '@/lib/resize/auto-resize'
import { getBackgroundGradientProps, getElementShadowProps, getGradientProps } from '@/lib/canvas/helpers'
import { renderDeviceComposite } from '@/lib/canvas/device-render'
import { buildBackgroundCanvas } from '@/lib/canvas/backgrounds'
import { BRAND_PRIMARY } from '@/lib/constants'

export interface RenderScreenOptions {
  screen: Screen
  assetResolver: (assetId?: string) => string | undefined
  /** Output scale multiplier (same effect as Konva's pixelRatio on toDataURL). */
  scale?: number
  /** Konva-compatible alias for scale — 2 exports at 2× pixel dimensions. */
  pixelRatio?: number
  format?: ExportFormat
  jpegQuality?: number
  transparentBackground?: boolean
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })
}

// Deterministic PRNG (mulberry32) so seeded backgrounds (e.g. noise) render
// identically on every export instead of using Math.random().
function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0 || 1
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hashSeed(input: string): number {
  let hash = 2166136261
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function drawBackground(
  context: CanvasRenderingContext2D,
  background: BackgroundConfig,
  width: number,
  height: number,
  image?: HTMLImageElement,
) {
  // The noise pattern (drawn inside buildBackgroundCanvas, which lives in
  // backgrounds.ts) relies on Math.random(). Temporarily swap in a seeded RNG
  // derived from stable screen properties so export output is reproducible.
  const needsSeed = background.type === 'pattern' && background.patternKind === 'noise'
  const originalRandom = Math.random
  if (needsSeed) {
    const seed = hashSeed(
      `${width}x${height}:${background.patternColor ?? ''}:${background.patternScale ?? 32}`,
    )
    Math.random = createSeededRandom(seed)
  }
  try {
    const canvas = buildBackgroundCanvas(background, width, height, image)
    context.drawImage(canvas, 0, 0, width, height)
  } finally {
    if (needsSeed) Math.random = originalRandom
  }
}

function createCanvasGradient(
  context: CanvasRenderingContext2D,
  fill: FillConfig,
  width: number,
  height: number,
): CanvasGradient | null {
  if (fill.type !== 'gradient' || !fill.gradient) return null
  const definition = fill.gradient
  let gradient: CanvasGradient
  if (definition.type === 'radial') {
    gradient = context.createRadialGradient(
      width / 2,
      height / 2,
      0,
      width / 2,
      height / 2,
      Math.max(width, height) / 2,
    )
  } else {
    const angle = ((definition.angle ?? 180) * Math.PI) / 180
    const cx = width / 2
    const cy = height / 2
    const len = Math.max(width, height)
    gradient = context.createLinearGradient(
      cx - (Math.cos(angle) * len) / 2,
      cy - (Math.sin(angle) * len) / 2,
      cx + (Math.cos(angle) * len) / 2,
      cy + (Math.sin(angle) * len) / 2,
    )
  }
  for (const stop of definition.stops) {
    gradient.addColorStop(stop.offset, stop.color)
  }
  return gradient
}

function drawTextDecoration(
  context: CanvasRenderingContext2D,
  decoration: TextElement['textDecoration'],
  color: string,
  startX: number,
  lineWidth: number,
  y: number,
  fontSize: number,
) {
  if (decoration === 'none' || lineWidth <= 0) return
  const tokens = decoration.split(/\s+/).filter((token) => token !== 'none')
  context.save()
  context.setLineDash([])
  context.strokeStyle = color
  context.lineWidth = Math.max(1, fontSize / 16)
  for (const token of tokens) {
    const offsetY = token === 'underline' ? fontSize * 0.92 : fontSize * 0.55
    context.beginPath()
    context.moveTo(startX, y + offsetY)
    context.lineTo(startX + lineWidth, y + offsetY)
    context.stroke()
  }
  context.restore()
}

function drawJustifiedLine(
  context: CanvasRenderingContext2D,
  line: string,
  startX: number,
  y: number,
  innerWidth: number,
  hasStroke: boolean,
) {
  context.textAlign = 'left'
  const words = line.split(' ').filter(Boolean)
  if (words.length <= 1) {
    if (hasStroke) context.strokeText(line, startX, y)
    context.fillText(line, startX, y)
    return
  }
  const wordsWidth = words.reduce((sum, word) => sum + context.measureText(word).width, 0)
  const gap = (innerWidth - wordsWidth) / (words.length - 1)
  let x = startX
  for (const word of words) {
    if (hasStroke) context.strokeText(word, x, y)
    context.fillText(word, x, y)
    x += context.measureText(word).width + gap
  }
}

function drawImageWithFit(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  element: ImageElement,
) {
  const naturalWidth = image.naturalWidth || image.width
  const naturalHeight = image.naturalHeight || image.height
  if (!naturalWidth || !naturalHeight) return

  // Crop is stored normalized (0..1); defaults are 0/0/1/1 (no crop).
  const sourceX = (element.cropX ?? 0) * naturalWidth
  const sourceY = (element.cropY ?? 0) * naturalHeight
  const sourceWidth = (element.cropWidth ?? 1) * naturalWidth
  const sourceHeight = (element.cropHeight ?? 1) * naturalHeight
  if (sourceWidth <= 0 || sourceHeight <= 0) return

  const { width, height } = element
  const fit = element.objectFit ?? 'cover'

  if (fit === 'fill') {
    context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, width, height)
    return
  }

  const scale =
    fit === 'contain'
      ? Math.min(width / sourceWidth, height / sourceHeight)
      : Math.max(width / sourceWidth, height / sourceHeight)
  const drawWidth = sourceWidth * scale
  const drawHeight = sourceHeight * scale
  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    (width - drawWidth) / 2,
    (height - drawHeight) / 2,
    drawWidth,
    drawHeight,
  )
}

async function drawElement(
  context: CanvasRenderingContext2D,
  element: Element,
  assetResolver: (assetId?: string) => string | undefined,
) {
  if (!element.visible) return

  context.save()
  context.globalAlpha = element.opacity
  context.translate(element.x + element.width / 2, element.y + element.height / 2)
  context.rotate((element.rotation * Math.PI) / 180)
  context.translate(-element.width / 2, -element.height / 2)

  if (element.shadow?.enabled) {
    context.shadowColor = element.shadow.color
    context.shadowBlur = element.shadow.blur
    context.shadowOffsetX = element.shadow.offsetX
    context.shadowOffsetY = element.shadow.offsetY
  }

  if (element.type === 'shape') {
    if (element.fill.type === 'solid') {
      context.fillStyle = element.fill.color ?? BRAND_PRIMARY
    } else {
      const gradient = createCanvasGradient(context, element.fill, element.width, element.height)
      if (gradient) context.fillStyle = gradient
    }

    context.strokeStyle = element.stroke
    context.lineWidth = element.strokeWidth
    context.setLineDash(element.dash ?? [])

    if (element.shapeKind === 'rectangle') {
      const radius = element.cornerRadius
      context.beginPath()
      context.roundRect(0, 0, element.width, element.height, radius)
      context.fill()
      if (element.strokeWidth > 0) context.stroke()
    } else if (element.shapeKind === 'circle') {
      context.beginPath()
      context.ellipse(
        element.width / 2,
        element.height / 2,
        element.width / 2,
        element.height / 2,
        0,
        0,
        Math.PI * 2,
      )
      context.fill()
      if (element.strokeWidth > 0) context.stroke()
    } else if (element.shapeKind === 'line') {
      context.beginPath()
      context.moveTo(0, element.height / 2)
      context.lineTo(element.width, element.height / 2)
      context.stroke()
    } else {
      context.beginPath()
      context.moveTo(element.width / 2, 0)
      context.lineTo(element.width, element.height)
      context.lineTo(0, element.height)
      context.closePath()
      context.fill()
      if (element.strokeWidth > 0) context.stroke()
    }
    context.setLineDash([])
  }

  if (element.type === 'text') {
    const padding = element.padding ?? 0
    const fontStyle = element.fontStyle === 'italic' ? 'italic' : 'normal'
    context.fillStyle = element.fill
    context.font = `${fontStyle} ${element.fontWeight} ${element.fontSize}px ${element.fontFamily}`
    context.textBaseline = 'top'
    const hasStroke = Boolean(element.stroke) && (element.strokeWidth ?? 0) > 0
    if (hasStroke) {
      context.strokeStyle = element.stroke as string
      context.lineWidth = element.strokeWidth as number
      context.lineJoin = 'round'
      context.miterLimit = 2
    }
    if ('letterSpacing' in context) {
      ;(context as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${element.letterSpacing ?? 0}px`
    }
    const innerWidth = Math.max(0, element.width - padding * 2)
    const lines = element.text.split('\n')
    const lineStep = element.fontSize * element.lineHeight
    const textBlockHeight = lines.length * lineStep
    const innerHeight = Math.max(0, element.height - padding * 2)
    const verticalAlign = element.verticalAlign ?? 'top'
    let verticalOffset = 0
    if (verticalAlign === 'middle') {
      verticalOffset = Math.max(0, (innerHeight - textBlockHeight) / 2)
    } else if (verticalAlign === 'bottom') {
      verticalOffset = Math.max(0, innerHeight - textBlockHeight)
    }
    lines.forEach((line, index) => {
      const y = padding + verticalOffset + index * lineStep
      const isLastLine = index === lines.length - 1
      if (element.textAlign === 'justify' && !isLastLine && line.trim().includes(' ')) {
        drawJustifiedLine(context, line, padding, y, innerWidth, hasStroke)
        drawTextDecoration(
          context,
          element.textDecoration,
          element.fill,
          padding,
          innerWidth,
          y,
          element.fontSize,
        )
        return
      }
      context.textAlign =
        element.textAlign === 'center'
          ? 'center'
          : element.textAlign === 'right'
            ? 'right'
            : 'left'
      let x = padding
      if (element.textAlign === 'center') x = padding + innerWidth / 2
      if (element.textAlign === 'right') x = padding + innerWidth
      // Konva draws fill first, then stroke on top by default.
      context.fillText(line, x, y)
      if (hasStroke) context.strokeText(line, x, y)

      if (element.textDecoration !== 'none') {
        const measuredWidth = context.measureText(line).width
        let decorationStart = x
        if (element.textAlign === 'center') decorationStart = x - measuredWidth / 2
        if (element.textAlign === 'right') decorationStart = x - measuredWidth
        drawTextDecoration(
          context,
          element.textDecoration,
          element.fill,
          decorationStart,
          measuredWidth,
          y,
          element.fontSize,
        )
      }
    })
    if ('letterSpacing' in context) {
      ;(context as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '0px'
    }
  }

  if (element.type === 'image') {
    const src = element.src ?? assetResolver(element.assetId)
    if (src) {
      const image = await loadImage(src)
      const radius = element.cornerRadius
      context.save()
      if (radius > 0) {
        context.beginPath()
        context.roundRect(0, 0, element.width, element.height, radius)
        context.clip()
      }

      const filters: string[] = []
      if (element.brightness) filters.push(`brightness(${100 + element.brightness}%)`)
      if (element.contrast) filters.push(`contrast(${100 + element.contrast}%)`)
      if (element.saturation) filters.push(`saturate(${100 + element.saturation}%)`)
      if (element.blur) filters.push(`blur(${element.blur}px)`)
      if (filters.length > 0 && 'filter' in context) {
        context.filter = filters.join(' ')
      }

      if (element.flipX || element.flipY) {
        context.translate(element.flipX ? element.width : 0, element.flipY ? element.height : 0)
        context.scale(element.flipX ? -1 : 1, element.flipY ? -1 : 1)
      }

      drawImageWithFit(context, image, element)
      if ('filter' in context) context.filter = 'none'
      context.restore()

      if (element.borderWidth > 0) {
        context.strokeStyle = element.borderColor
        context.lineWidth = element.borderWidth
        if (radius > 0) {
          context.beginPath()
          context.roundRect(0, 0, element.width, element.height, radius)
          context.stroke()
        } else {
          context.strokeRect(0, 0, element.width, element.height)
        }
      }
    }
  }

  if (element.type === 'device') {
    const screenshotSrc = assetResolver(element.screenshotAssetId)
    const screenshot = screenshotSrc ? await loadImage(screenshotSrc) : undefined
    const composite = renderDeviceComposite(element, screenshot, 3)
    if (composite) {
      const intensity = element.shadowIntensity ?? 0
      const spread = element.shadowSpread ?? 0
      if (intensity > 0 && spread > 0) {
        // Matches the editor's Group shadow (rgba(0,0,0,0.45) * shadowOpacity).
        context.shadowColor = `rgba(0,0,0,${Math.min(1, 0.45 * intensity)})`
        context.shadowBlur = spread
        context.shadowOffsetX = 0
        context.shadowOffsetY = 0
      }
      context.drawImage(
        composite.canvas,
        composite.offsetX,
        composite.offsetY,
        composite.width,
        composite.height,
      )
    }
  }

  context.restore()
}

export async function renderScreenToDataUrl(
  options: RenderScreenOptions,
): Promise<string> {
  const {
    screen,
    assetResolver,
    scale: scaleOption,
    pixelRatio,
    format = 'png',
    jpegQuality = 0.92,
    transparentBackground = false,
  } = options

  const scale = pixelRatio ?? scaleOption ?? 1

  const canvas = document.createElement('canvas')
  canvas.width = screen.width * scale
  canvas.height = screen.height * scale
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Could not create canvas context')

  context.scale(scale, scale)

  if (!transparentBackground) {
    const backgroundImageSrc =
      screen.background.type === 'image'
        ? assetResolver(screen.background.imageAssetId)
        : undefined
    const backgroundImage = backgroundImageSrc
      ? await loadImage(backgroundImageSrc)
      : undefined
    drawBackground(context, screen.background, screen.width, screen.height, backgroundImage)
  }

  const sorted = [...screen.elements].sort((a, b) => a.zIndex - b.zIndex)
  for (const element of sorted) {
    await drawElement(context, element, assetResolver)
  }

  const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png'
  return canvas.toDataURL(mimeType, format === 'jpeg' ? jpegQuality : undefined)
}

export async function renderScreenToBlob(
  options: RenderScreenOptions,
): Promise<Blob> {
  const dataUrl = await renderScreenToDataUrl(options)
  const response = await fetch(dataUrl)
  return response.blob()
}

export { autoResizeScreen, getBackgroundGradientProps, getElementShadowProps, getGradientProps }
