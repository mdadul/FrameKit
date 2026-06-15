import { useMemo } from 'react'
import { resolveSelectedElements } from '@/lib/selection/resolve-selected-elements'
import { useProjectStore } from '@/stores/project-store'
import { useEditorStore } from '@/stores/editor-store'

export function useSelectedElements() {
  const screen = useProjectStore((state) => state.getActiveScreen())
  const selectedElementIds = useEditorStore((state) => state.selectedElementIds)

  return useMemo(() => {
    if (!screen) return []
    return resolveSelectedElements(screen, selectedElementIds)
  }, [screen, selectedElementIds])
}
