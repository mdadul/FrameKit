import { autoResizeScreen } from '@/lib/resize/auto-resize'
import type { ResizeStrategy } from '@/lib/resize/auto-resize'
import type { Screen, StorePreset } from '@/lib/types'

export function prepareExportScreen(
  screen: Screen,
  preset: Pick<StorePreset, 'width' | 'height'>,
  strategy: ResizeStrategy,
): Screen {
  const resized = autoResizeScreen(screen, preset.width, preset.height, { strategy })
  return {
    ...screen,
    width: resized.width,
    height: resized.height,
    background: resized.background,
    elements: resized.elements,
  }
}
