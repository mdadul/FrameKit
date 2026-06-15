import { useMemo } from 'react'
import { resolveSelectedElementsById } from '@/lib/selection/resolve-selected-elements'
import { useProjectStore } from '@/stores/project-store'
import { useEditorStore } from '@/stores/editor-store'
import type { Element } from '@/lib/types'

export function useSelectionCapabilities() {
  const project = useProjectStore((state) => state.project)
  const activeScreenId = useEditorStore((state) => state.activeScreenId)
  const selectedElementIds = useEditorStore((state) => state.selectedElementIds)

  return useMemo(() => {
    const screen = project?.screens.find((item) => item.id === activeScreenId)
    const selectedElements = resolveSelectedElementsById(screen, selectedElementIds)
    const hasText = selectedElements.some((item) => item.type === 'text')
    const hasShape = selectedElements.some((item) => item.type === 'shape')

    return {
      hasSelection: selectedElements.length > 0,
      hasText,
      hasShape,
      canApplyColor: hasText || hasShape,
      canApplyFont: hasText,
      selectedElements: selectedElements as Element[],
    }
  }, [project, activeScreenId, selectedElementIds])
}
