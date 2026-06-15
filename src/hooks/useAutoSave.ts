import { useEffect } from 'react'
import { useProjectStore } from '@/stores/project-store'

export function useAutoSave(delay = 500) {
  const dirty = useProjectStore((state) => state.dirty)
  const persistProject = useProjectStore((state) => state.persistProject)

  useEffect(() => {
    if (!dirty) return
    const timer = window.setTimeout(() => {
      void persistProject()
    }, delay)
    return () => window.clearTimeout(timer)
  }, [dirty, delay, persistProject])
}
