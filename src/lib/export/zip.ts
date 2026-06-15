import JSZip from 'jszip'
import { renderScreenToBlob } from '@/lib/export/renderer'
import { autoResizeScreen } from '@/lib/resize/auto-resize'
import { applyFileNamePattern } from '@/lib/utils'
import type { ExportFormat, Project, Screen } from '@/lib/types'
import type { StorePreset } from '@/lib/types'

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
}

export async function exportScreensAsZip(options: BulkExportOptions): Promise<Blob> {
  const zip = new JSZip()
  const total = options.screens.length * options.presets.length
  let completed = 0

  const iosFolder = options.organizeByPlatform ? zip.folder('ios') : zip
  const androidFolder = options.organizeByPlatform ? zip.folder('android') : zip

  for (const [screenIndex, screen] of options.screens.entries()) {
    const sequence = String(screenIndex + 1).padStart(2, '0')
    const safeScreenName = screen.name.replace(/[^\w-]+/g, '_')

    for (const preset of options.presets) {
      const resized = autoResizeScreen(screen, preset.width, preset.height)
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
      options.onProgress?.(completed, total)
    }
  }

  return zip.generateAsync({ type: 'blob' })
}

export interface SingleExportOptions
  extends Omit<BulkExportOptions, 'screens' | 'presets' | 'onProgress'> {
  preset?: StorePreset
}

export async function exportSingleScreen(
  screen: Screen,
  options: SingleExportOptions,
): Promise<Blob> {
  // When a store preset is targeted, resize to it and render at scale 1 so the
  // output is exactly the preset size (no double-scale bug). Otherwise export
  // the screen at its real design size, honoring the retina scale option.
  if (options.preset) {
    const resized = autoResizeScreen(screen, options.preset.width, options.preset.height)
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
    scale: options.scale,
    format: options.format,
    jpegQuality: options.jpegQuality,
    transparentBackground: options.transparentBackground,
  })
}
