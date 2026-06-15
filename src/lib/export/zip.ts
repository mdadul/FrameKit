import JSZip from 'jszip'
import { renderScreenToBlob } from '@/lib/export/renderer'
import { buildExportPlan } from '@/lib/export/export-plan'
import { autoResizeScreen } from '@/lib/resize/auto-resize'
import type { KonvaStageBridge } from '@/stores/editor-store'
import type { ResizeStrategy } from '@/lib/resize/auto-resize'
import { applyFileNamePattern } from '@/lib/utils'
import type { ExportFormat, Project, Screen, StorePreset } from '@/lib/types'

export interface BulkExportOptions {
  project: Project
  screens: Screen[]
  presets: StorePreset[]
  format: ExportFormat
  scale: 1 | 2 | 3
  jpegQuality: number
  transparentBackground: boolean
  fileNamePattern: string
  assetResolver: (assetId?: string) => string | undefined
  onProgress?: (completed: number, total: number) => void
  organizeByPlatform?: boolean
  platformAware?: boolean
  resizeStrategy?: ResizeStrategy
}

export async function exportScreensAsZip(options: BulkExportOptions): Promise<Blob> {
  const zip = new JSZip()
  const plan = buildExportPlan(options.screens, options.presets.map((p) => p.id), {
    platformAware: options.platformAware ?? true,
  })
  let completed = 0

  const iosFolder = options.organizeByPlatform ? zip.folder('ios') : zip
  const androidFolder = options.organizeByPlatform ? zip.folder('android') : zip

  const screenIndexById = new Map(options.screens.map((screen, index) => [screen.id, index]))

  for (const { screen, preset } of plan) {
    const screenIndex = screenIndexById.get(screen.id) ?? 0
    const sequence = String(screenIndex + 1).padStart(2, '0')
    const safeScreenName = screen.name.replace(/[^\w-]+/g, '_')

    const resized = autoResizeScreen(screen, preset.width, preset.height, {
      strategy: options.resizeStrategy ?? 'fit',
    })
    const blob = await renderScreenToBlob({
      screen: {
        ...screen,
        width: resized.width,
        height: resized.height,
        background: resized.background,
        elements: resized.elements,
      },
      assetResolver: options.assetResolver,
      scale: 1,
      format: options.format,
      jpegQuality: options.jpegQuality,
      transparentBackground: options.transparentBackground,
    })

    const filename = applyFileNamePattern(options.fileNamePattern, {
      project: options.project.name,
      screen: screen.name,
      preset: preset.id,
    })

    const extension = options.format === 'jpeg' ? 'jpg' : 'png'
    const baseName = filename || preset.id
    const filePath = `${sequence}-${baseName}.${extension}`

    if (options.organizeByPlatform) {
      const platformFolder =
        preset.platform === 'apple'
          ? iosFolder?.folder(safeScreenName)
          : androidFolder?.folder(safeScreenName)
      platformFolder?.file(filePath, blob)
    } else {
      const screenFolder = zip.folder(safeScreenName)
      screenFolder?.file(filePath, blob)
    }

    completed += 1
    options.onProgress?.(completed, plan.length)
  }

  return zip.generateAsync({ type: 'blob' })
}

export interface SingleExportOptions
  extends Omit<BulkExportOptions, 'screens' | 'presets' | 'onProgress' | 'platformAware'> {
  preset?: StorePreset
  /** When set, exports the live Konva artboard for the active screen (WYSIWYG, high pixelRatio). */
  konvaStageBridge?: KonvaStageBridge | null
}

export async function exportSingleScreen(
  screen: Screen,
  options: SingleExportOptions,
): Promise<Blob> {
  if (
    !options.preset &&
    !options.transparentBackground &&
    options.konvaStageBridge &&
    options.konvaStageBridge.activeScreenId === screen.id
  ) {
    const mimeType = options.format === 'jpeg' ? 'image/jpeg' : 'image/png'
    const konvaBlob = await options.konvaStageBridge.exportActiveScreen(screen.id, {
      pixelRatio: options.scale,
      mimeType,
      quality: options.jpegQuality,
    })
    if (konvaBlob) return konvaBlob
  }

  if (options.preset) {
    const resized = autoResizeScreen(screen, options.preset.width, options.preset.height, {
      strategy: options.resizeStrategy ?? 'fit',
    })
    return renderScreenToBlob({
      screen: {
        ...screen,
        width: resized.width,
        height: resized.height,
        background: resized.background,
        elements: resized.elements,
      },
      assetResolver: options.assetResolver,
      scale: 1,
      format: options.format,
      jpegQuality: options.jpegQuality,
      transparentBackground: options.transparentBackground,
    })
  }

  return renderScreenToBlob({
    screen,
    assetResolver: options.assetResolver,
    pixelRatio: options.scale,
    format: options.format,
    jpegQuality: options.jpegQuality,
    transparentBackground: options.transparentBackground,
  })
}
