import { findScreenById } from '@/stores/project/element-mutations'
import { useEditorStore } from '@/stores/editor-store'
import type { Project, Screen } from '@/lib/types'

export function resolveActiveScreenId(project: Project | null): string | null {
  if (!project || project.screens.length === 0) return null
  const activeId = useEditorStore.getState().activeScreenId
  return project.screens.find((screen) => screen.id === activeId)?.id ?? project.screens[0].id
}

export function withActiveScreen(
  project: Project,
  activeScreenId: string,
  mutateScreen: (screen: Screen) => void,
) {
  const screen = findScreenById(project, activeScreenId)
  if (!screen) return
  mutateScreen(screen)
}

export function mutateOnActiveScreen(
  project: Project | null,
  updateProject: (updater: (draft: Project) => void, recordHistory?: boolean) => void,
  mutateScreen: (screen: Screen) => void,
  recordHistory = true,
): boolean {
  const activeId = resolveActiveScreenId(project)
  if (!activeId) return false
  updateProject((draft) => {
    withActiveScreen(draft, activeId, mutateScreen)
  }, recordHistory)
  return true
}
