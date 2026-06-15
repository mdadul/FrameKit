import { useCallback, useState } from 'react'
import { findScreenAtPoint } from '@/lib/canvas/workspace-layout'
import { MAX_SCREENS } from '@/lib/constants'
import { confirm } from '@/stores/confirm-store'
import type { Project, Screen } from '@/lib/types'

interface ScreenLayoutEntry {
  x: number
  y: number
}

interface UseScreenContextMenuOptions {
  screens: Screen[]
  screenLayout: Record<string, ScreenLayoutEntry>
  project: Project | null
  clientToWorkspace: (clientX: number, clientY: number) => { x: number; y: number } | null
  setActiveScreen: (screenId: string, options?: { clearSelection?: boolean }) => void
  duplicateScreen: (screenId: string) => void
  deleteScreen: (screenId: string) => void
}

export function useScreenContextMenu({
  screens,
  screenLayout,
  project,
  clientToWorkspace,
  setActiveScreen,
  duplicateScreen,
  deleteScreen,
}: UseScreenContextMenuOptions) {
  const [screenContextMenu, setScreenContextMenu] = useState<{
    screenId: string
    x: number
    y: number
  } | null>(null)

  const atScreenLimit = (project?.screens.length ?? 0) >= MAX_SCREENS

  const dismissScreenContextMenu = useCallback(() => {
    setScreenContextMenu(null)
  }, [])

  const handleScreenContextMenu = useCallback(
    (event: React.MouseEvent | MouseEvent) => {
      event.preventDefault()
      const point = clientToWorkspace(event.clientX, event.clientY)
      if (!point) return
      const screen = findScreenAtPoint(point, screens, screenLayout)
      if (!screen) {
        setScreenContextMenu(null)
        return
      }
      setActiveScreen(screen.id, { clearSelection: true })
      setScreenContextMenu({
        screenId: screen.id,
        x: event.clientX,
        y: event.clientY,
      })
    },
    [clientToWorkspace, screenLayout, screens, setActiveScreen],
  )

  const handleDuplicateScreen = useCallback(
    (screenId: string) => {
      if (atScreenLimit) return
      duplicateScreen(screenId)
    },
    [atScreenLimit, duplicateScreen],
  )

  const handleDeleteScreen = useCallback(
    async (screenId: string) => {
      setScreenContextMenu(null)
      const screen = screens.find((item) => item.id === screenId)
      if (!screen || screens.length <= 1) return
      const confirmed = await confirm({
        title: 'Delete screen?',
        description: `"${screen.name}" and all its elements will be removed.`,
        confirmLabel: 'Delete',
        destructive: true,
      })
      if (confirmed) deleteScreen(screenId)
    },
    [deleteScreen, screens],
  )

  const contextMenuScreen = screenContextMenu
    ? screens.find((screen) => screen.id === screenContextMenu.screenId)
    : undefined

  return {
    screenContextMenu,
    contextMenuScreen,
    atScreenLimit,
    handleScreenContextMenu,
    dismissScreenContextMenu,
    handleDuplicateScreen,
    handleDeleteScreen,
  }
}
