import type { BackgroundConfig, MeshBlob, PatternKind } from '@/lib/types'
import { BRAND_PRIMARY } from '@/lib/constants'
import { fillRectWithCanvasGradient } from '@/lib/canvas/create-canvas-gradient'
import { drawImageWithObjectFit } from '@/lib/canvas/image-fit'

const DEFAULT_MESH_LAYOUT: Array<{ x: number; y: number; radius: number }> = [
  { x: 0.2, y: 0.2, radius: 0.7 },
  { x: 0.85, y: 0.25, radius: 0.6 },
  { x: 0.25, y: 0.85, radius: 0.65 },
  { x: 0.8, y: 0.8, radius: 0.7 },
]

function resolveMeshBlobs(background: BackgroundConfig, width: number, height: number): MeshBlob[] {
  if (background.meshBlobs?.length) return background.meshBlobs
  const colors = background.meshColors ?? [BRAND_PRIMARY, '#ec4899', '#22d3ee', '#1c1917']
  const diag = Math.max(width, height)
  return colors.slice(0, DEFAULT_MESH_LAYOUT.length).map((color, index) => {
    const layout = DEFAULT_MESH_LAYOUT[index] ?? DEFAULT_MESH_LAYOUT[0]
    return {
      color,
      x: layout.x * width,
      y: layout.y * height,
      radius: layout.radius * diag,
    }
  })
}

function drawPattern(
  ctx: CanvasRenderingContext2D,
  kind: PatternKind,
  fg: string,
  scale: number,
  width: number,
  height: number,
) {
  ctx.fillStyle = fg
  ctx.strokeStyle = fg
  ctx.lineWidth = Math.max(1, scale / 16)
  const s = Math.max(8, scale)

  if (kind === 'dots') {
    const r = s / 8
    for (let y = s / 2; y < height; y += s) {
      for (let x = s / 2; x < width; x += s) {
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    return
  }

  if (kind === 'grid') {
    for (let x = 0; x <= width; x += s) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }
    for (let y = 0; y <= height; y += s) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }
    return
  }

  if (kind === 'diagonal' || kind === 'crosshatch') {
    for (let d = -height; d < width; d += s) {
      ctx.beginPath()
      ctx.moveTo(d, 0)
      ctx.lineTo(d + height, height)
      ctx.stroke()
    }
    if (kind === 'crosshatch') {
      for (let d = 0; d < width + height; d += s) {
        ctx.beginPath()
        ctx.moveTo(d, 0)
        ctx.lineTo(d - height, height)
        ctx.stroke()
      }
    }
    return
  }

  if (kind === 'checker') {
    for (let y = 0; y < height; y += s) {
      for (let x = 0; x < width; x += s) {
        if (((x / s) | 0) % 2 === ((y / s) | 0) % 2) {
          ctx.fillRect(x, y, s, s)
        }
      }
    }
    return
  }

  if (kind === 'triangles') {
    for (let y = 0; y < height; y += s) {
      for (let x = 0; x < width; x += s) {
        ctx.globalAlpha = ((x / s + y / s) | 0) % 2 === 0 ? 0.5 : 0.18
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x + s, y)
        ctx.lineTo(x, y + s)
        ctx.closePath()
        ctx.fill()
      }
    }
    ctx.globalAlpha = 1
    return
  }

  if (kind === 'noise') {
    const count = Math.floor((width * height) / (s * s)) * 6
    ctx.globalAlpha = 0.25
    for (let i = 0; i < count; i += 1) {
      const x = Math.random() * width
      const y = Math.random() * height
      ctx.fillRect(x, y, 1.5, 1.5)
    }
    ctx.globalAlpha = 1
  }
}

export function buildBackgroundCanvas(
  background: BackgroundConfig,
  width: number,
  height: number,
  image?: (CanvasImageSource & { width: number; height: number }) | null,
  pixelRatio = 1,
): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(width * pixelRatio))
  canvas.height = Math.max(1, Math.round(height * pixelRatio))
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas
  ctx.scale(pixelRatio, pixelRatio)

  ctx.fillStyle = background.color ?? '#ffffff'
  ctx.fillRect(0, 0, width, height)

  if (background.type === 'solid') {
    return canvas
  }

  if (
    (background.type === 'linear-gradient' || background.type === 'radial-gradient') &&
    background.gradient
  ) {
    fillRectWithCanvasGradient(
      ctx,
      {
        type: background.type === 'radial-gradient' ? 'radial' : 'linear',
        angle: background.gradient.angle,
        stops: background.gradient.stops,
      },
      width,
      height,
    )
    return canvas
  }

  if (background.type === 'mesh') {
    const blobs = resolveMeshBlobs(background, width, height)
    for (const blob of blobs) {
      const radial = ctx.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, blob.radius)
      radial.addColorStop(0, blob.color)
      radial.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = radial
      ctx.fillRect(0, 0, width, height)
    }
    return canvas
  }

  if (background.type === 'pattern') {
    drawPattern(
      ctx,
      background.patternKind ?? 'dots',
      background.patternColor ?? BRAND_PRIMARY,
      background.patternScale ?? 32,
      width,
      height,
    )
    return canvas
  }

  if (background.type === 'image' && image) {
    drawImageWithObjectFit(
      ctx,
      image,
      { x: 0, y: 0, width: image.width, height: image.height },
      { x: 0, y: 0, width, height },
      background.imageFit ?? 'cover',
    )
    if (background.overlayColor) {
      ctx.fillStyle = background.overlayColor
      ctx.fillRect(0, 0, width, height)
    }
    return canvas
  }

  return canvas
}
