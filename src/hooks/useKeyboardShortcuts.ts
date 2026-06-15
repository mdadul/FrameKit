import { useEffect } from 'react'
import { useHistoryNavigation } from '@/hooks/useHistoryNavigation'
import { useProjectStore } from '@/stores/project-store'
import { useEditorStore } from '@/stores/editor-store'
import { useSettingsStore } from '@/stores/settings-store'
import { duplicateElement } from '@/lib/factories'
import { clamp } from '@/lib/utils'

export function useKeyboardShortcuts() {
  const updateProject = useProjectStore((state) => state.updateProject)
  const deleteElements = useProjectStore((state) => state.deleteElements)
  const duplicateElements = useProjectStore((state) => state.duplicateElements)
  const groupElements = useProjectStore((state) => state.groupElements)
  const getActiveScreen = useProjectStore((state) => state.getActiveScreen)
  const updateElement = useProjectStore((state) => state.updateElement)
  const bringForward = useProjectStore((state) => state.bringForward)
  const sendBackward = useProjectStore((state) => state.sendBackward)
  const { undo, redo } = useHistoryNavigation()
  const selectedElementIds = useEditorStore((state) => state.selectedElementIds)
  const setSelectedElementIds = useEditorStore((state) => state.setSelectedElementIds)
  const clipboard = useEditorStore((state) => state.clipboard)
  const setClipboard = useEditorStore((state) => state.setClipboard)
  const styleClipboard = useEditorStore((state) => state.styleClipboard)
  const setStyleClipboard = useEditorStore((state) => state.setStyleClipboard)
  const nudgeStep = useSettingsStore((state) => state.preferences.workspace.nudgeStep)
  const workspaceZoom = useEditorStore((state) => state.workspaceZoom)
  const setWorkspaceZoom = useEditorStore((state) => state.setWorkspaceZoom)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return
      }

      const meta = event.metaKey || event.ctrlKey

      if (meta && event.key.toLowerCase() === 'z' && !event.shiftKey) {
        event.preventDefault()
        undo()
        return
      }

      if (meta && (event.key.toLowerCase() === 'y' || (event.shiftKey && event.key.toLowerCase() === 'z'))) {
        event.preventDefault()
        redo()
        return
      }

      if (meta && event.key.toLowerCase() === 'a') {
        event.preventDefault()
        const screen = getActiveScreen()
        if (!screen) return
        setSelectedElementIds(screen.elements.map((element) => element.id))
        return
      }

      if (meta && event.key === ']') {
        event.preventDefault()
        selectedElementIds.forEach((id) => bringForward(id))
        return
      }

      if (meta && event.key === '[') {
        event.preventDefault()
        selectedElementIds.forEach((id) => sendBackward(id))
        return
      }

      if (meta && event.key.toLowerCase() === 'c') {
        const screen = getActiveScreen()
        if (!screen) return
        const elements = screen.elements.filter((element) =>
          selectedElementIds.includes(element.id),
        )
        if (event.altKey) {
          if (elements[0]) setStyleClipboard(elements[0])
        } else if (elements.length > 0) {
          setClipboard(elements.map((element) => structuredClone(element)))
        }
        return
      }

      if (meta && event.key.toLowerCase() === 'x') {
        const screen = getActiveScreen()
        if (!screen) return
        const elements = screen.elements.filter((element) =>
          selectedElementIds.includes(element.id),
        )
        if (elements.length === 0) return
        event.preventDefault()
        setClipboard(elements.map((element) => structuredClone(element)))
        deleteElements(selectedElementIds)
        setSelectedElementIds([])
        return
      }

      if (meta && event.key.toLowerCase() === 'v') {
        const screen = getActiveScreen()
        if (!screen) return
        if (event.altKey && styleClipboard && selectedElementIds[0]) {
          const style = { ...styleClipboard }
          delete (style as { id?: string }).id
          delete (style as { type?: string }).type
          delete (style as { name?: string }).name
          updateElement(selectedElementIds[0], style)
          return
        }
        if (clipboard?.length) {
          const copies = clipboard.map((element) => duplicateElement(element))
          updateProject((project) => {
            const activeScreen = project.screens.find((item) => item.id === screen.id)
            if (!activeScreen) return
            activeScreen.elements.push(...copies)
          })
          setSelectedElementIds(copies.map((element) => element.id))
        }
        return
      }

      if (meta && event.key.toLowerCase() === 'g') {
        event.preventDefault()
        if (event.shiftKey) {
          const groupId = getActiveScreen()?.elements.find((element) =>
            selectedElementIds.includes(element.id),
          )?.groupId
          if (groupId) {
            updateProject((project) => {
              const screen = project.screens.find((item) => item.id === getActiveScreen()?.id)
              if (!screen) return
              screen.elements = screen.elements.map((element) =>
                element.groupId === groupId ? { ...element, groupId: undefined } : element,
              )
            })
          }
        } else {
          groupElements(selectedElementIds)
        }
        return
      }

      if (event.key === 'Delete' || event.key === 'Backspace') {
        if (selectedElementIds.length > 0) {
          event.preventDefault()
          deleteElements(selectedElementIds)
          setSelectedElementIds([])
        }
        return
      }

      if (selectedElementIds.length > 0 && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        event.preventDefault()
        const delta = event.shiftKey ? nudgeStep * 10 : nudgeStep
        updateProject((project) => {
          const screen = project.screens.find((item) => item.id === getActiveScreen()?.id)
          if (!screen) return
          screen.elements = screen.elements.map((element) => {
            if (!selectedElementIds.includes(element.id)) return element
            if (event.key === 'ArrowUp') return { ...element, y: element.y - delta }
            if (event.key === 'ArrowDown') return { ...element, y: element.y + delta }
            if (event.key === 'ArrowLeft') return { ...element, x: element.x - delta }
            return { ...element, x: element.x + delta }
          })
        })
      }

      if (meta && event.key.toLowerCase() === 'd') {
        event.preventDefault()
        duplicateElements(selectedElementIds)
      }

      if (meta && (event.key === '=' || event.key === '+')) {
        event.preventDefault()
        setWorkspaceZoom(clamp(workspaceZoom * 1.1, 0.08, 2.5))
        return
      }

      if (meta && event.key === '-') {
        event.preventDefault()
        setWorkspaceZoom(clamp(workspaceZoom * 0.9, 0.08, 2.5))
        return
      }

      if (meta && event.key === '0') {
        event.preventDefault()
        useEditorStore.getState().requestFit('active')
        return
      }

      if (event.altKey && event.key === 'ArrowRight') {
        event.preventDefault()
        const project = useProjectStore.getState().project
        const activeId = useEditorStore.getState().activeScreenId
        if (!project || !activeId) return
        const index = project.screens.findIndex((screen) => screen.id === activeId)
        const next = project.screens[index + 1]
        if (!next) return
        useEditorStore.getState().focusScreen(next.id, true)
        return
      }

      if (event.altKey && event.key === 'ArrowLeft') {
        event.preventDefault()
        const project = useProjectStore.getState().project
        const activeId = useEditorStore.getState().activeScreenId
        if (!project || !activeId) return
        const index = project.screens.findIndex((screen) => screen.id === activeId)
        const prev = project.screens[index - 1]
        if (!prev) return
        useEditorStore.getState().focusScreen(prev.id, true)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [
    bringForward,
    clipboard,
    deleteElements,
    duplicateElements,
    getActiveScreen,
    groupElements,
    nudgeStep,
    redo,
    selectedElementIds,
    sendBackward,
    setClipboard,
    setSelectedElementIds,
    setStyleClipboard,
    setWorkspaceZoom,
    styleClipboard,
    undo,
    updateElement,
    updateProject,
    workspaceZoom,
  ])
}
