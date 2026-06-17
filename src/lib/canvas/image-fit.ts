export type ImageObjectFit = 'cover' | 'contain' | 'fill'

export interface ImageFitRect {
  x: number
  y: number
  width: number
  height: number
}

export function drawImageWithObjectFit(
  context: CanvasRenderingContext2D,
  image: CanvasImageSource,
  source: ImageFitRect,
  dest: ImageFitRect,
  fit: ImageObjectFit,
  options?: { letterboxFill?: string },
) {
  const { x: sourceX, y: sourceY, width: sourceWidth, height: sourceHeight } = source
  if (sourceWidth <= 0 || sourceHeight <= 0) return

  if (fit === 'fill') {
    context.drawImage(
      image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      dest.x,
      dest.y,
      dest.width,
      dest.height,
    )
    return
  }

  const scale =
    fit === 'contain'
      ? Math.min(dest.width / sourceWidth, dest.height / sourceHeight)
      : Math.max(dest.width / sourceWidth, dest.height / sourceHeight)
  const drawWidth = sourceWidth * scale
  const drawHeight = sourceHeight * scale
  const drawX = dest.x + (dest.width - drawWidth) / 2
  const drawY = dest.y + (dest.height - drawHeight) / 2

  if (fit === 'contain' && options?.letterboxFill) {
    context.fillStyle = options.letterboxFill
    context.fillRect(dest.x, dest.y, dest.width, dest.height)
  }

  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    drawX,
    drawY,
    drawWidth,
    drawHeight,
  )
}
