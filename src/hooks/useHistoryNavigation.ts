import { useCallback } from 'react'
import { useHistoryStore } from '@/stores/history-store'
import { useProjectStore } from '@/stores/project-store'

export function useHistoryNavigation() {
  const canUndo = useHistoryStore((state) => state.canUndo)
  const canRedo = useHistoryStore((state) => state.canRedo)
  const undo = useHistoryStore((state) => state.undo)
  const redo = useHistoryStore((state) => state.redo)
  const restoreFromHistory = useProjectStore((state) => state.restoreFromHistory)

  const handleUndo = useCallback(() => {
    const project = undo()
    if (project) restoreFromHistory(project)
  }, [undo, restoreFromHistory])

  const handleRedo = useCallback(() => {
    const project = redo()
    if (project) restoreFromHistory(project)
  }, [redo, restoreFromHistory])

  return { canUndo, canRedo, undo: handleUndo, redo: handleRedo }
}
