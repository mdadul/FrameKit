import type Konva from 'konva'

export interface KonvaExportOptions {
  /** Matches Konva's toDataURL pixelRatio — 2 exports at 2× resolution on Retina. */
  pixelRatio?: number
  mimeType?: 'image/png' | 'image/jpeg'
  quality?: number
}

export interface KonvaStageExportContext {
  stage: Konva.Stage
  screenId: string
  /** Screen must be the active artboard (full element tree, not snapshot LOD). */
  isActiveOnCanvas: boolean
}

/** Locate the drawable artboard group for a screen (excludes workspace offset). */
export function findScreenArtboardNode(
  stage: Konva.Stage,
  screenId: string,
): Konva.Group | null {
  const screenGroup = stage.findOne(`#screen-${screenId}`) as Konva.Group | undefined
  if (!screenGroup) return null
  const artboard = screenGroup.findOne(
    (node: Konva.Node) => node.name() === `screen-artboard-${screenId}`,
  )
  return (artboard ?? screenGroup) as Konva.Group
}

function hideExportChrome(stage: Konva.Stage): () => void {
  const hidden: Array<{ node: Konva.Node; wasVisible: boolean }> = []
  const chromeSelectors = ['Transformer', '.interaction-overlay']
  for (const selector of chromeSelectors) {
    const node = stage.findOne(selector)
    if (node) {
      hidden.push({ node, wasVisible: node.visible() })
      node.visible(false)
    }
  }
  stage.batchDraw()
  return () => {
    for (const { node, wasVisible } of hidden) {
      node.visible(wasVisible)
    }
    stage.batchDraw()
  }
}

/**
 * Export a Konva node using the native toDataURL API.
 * @see https://konvajs.org/docs/data_and_serialization/High-Quality-Export.html
 */
export function exportKonvaNodeToDataUrl(
  node: Konva.Node,
  options: KonvaExportOptions = {},
): string {
  const { pixelRatio = 1, mimeType = 'image/png', quality = 0.92 } = options
  return node.toDataURL({
    pixelRatio,
    mimeType,
    quality: mimeType === 'image/jpeg' ? quality : undefined,
  })
}

export function exportKonvaNodeToBlob(
  node: Konva.Node,
  options: KonvaExportOptions = {},
): Promise<Blob> {
  const { pixelRatio = 1, mimeType = 'image/png', quality = 0.92 } = options
  return new Promise((resolve, reject) => {
    try {
      node.toBlob({
        pixelRatio,
        mimeType,
        quality: mimeType === 'image/jpeg' ? quality : undefined,
        callback: (blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Konva toBlob returned no data'))
        },
      })
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Export the active screen artboard from the live Konva stage.
 * Returns null when the screen is not fully rendered (inactive LOD / off-screen).
 */
export function exportActiveScreenFromStage(
  context: KonvaStageExportContext,
  options: KonvaExportOptions = {},
): string | null {
  if (!context.isActiveOnCanvas) return null
  const node = findScreenArtboardNode(context.stage, context.screenId)
  if (!node) return null

  const restore = hideExportChrome(context.stage)
  try {
    return exportKonvaNodeToDataUrl(node, options)
  } finally {
    restore()
  }
}

export async function exportActiveScreenBlobFromStage(
  context: KonvaStageExportContext,
  options: KonvaExportOptions = {},
): Promise<Blob | null> {
  if (!context.isActiveOnCanvas) return null
  const node = findScreenArtboardNode(context.stage, context.screenId)
  if (!node) return null

  const restore = hideExportChrome(context.stage)
  try {
    return await exportKonvaNodeToBlob(node, options)
  } finally {
    restore()
  }
}
