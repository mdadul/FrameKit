import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import {
  createImageElement,
  createProject,
  createShapeElement,
  createTextElement,
} from '@/lib/factories'
import {
  resetElementCoalesce,
  resolveElementUpdateHistory,
} from '@/stores/project/element-update-coalesce'
import {
  alignElementsOnScreen,
  alignElementsToArtboard,
  distributeElementsOnScreen,
} from '@/stores/project/element-alignment'
import {
  addElementToScreen,
  bringForwardElement,
  deleteElementsFromScreen,
  duplicateElementsOnScreen,
  findScreenById,
  groupElementsOnScreen,
  reorderElementsOnScreen,
  sendBackwardElement,
  ungroupElementsOnScreen,
  updateElementOnScreen,
} from '@/stores/project/element-mutations'
import { createDefaultDeviceElement } from '@/stores/project/create-device-element'
import {
  addScreenToProject,
  applyTemplateToAllScreensInProject,
  applyTemplateToScreenInProject,
  copyAllScreensToAndroidInProject,
  copyScreenToAndroidInProject,
  deleteScreenFromProject,
  duplicateScreenInProject,
  renameScreenInProject,
  reorderScreensInProject,
  resolveNextActiveScreenId,
  setScreenBackground,
  syncLinkedAndroidScreenInProject,
} from '@/stores/project/screen-mutations'
import { saveProject } from '@/lib/db'
import { useHistoryStore } from '@/stores/history-store'
import { useEditorStore } from '@/stores/editor-store'
import type {
  BackgroundConfig,
  BrandKit,
  Element,
  Project,
  Screen,
  TemplateApplyMode,
  TextElement,
} from '@/lib/types'

export type SaveStatus = 'saved' | 'saving' | 'unsaved'

interface ProjectState {
  project: Project | null
  assetUrls: Record<string, string>
  dirty: boolean
  saveStatus: SaveStatus
  loadProject: (project: Project) => void
  restoreFromHistory: (project: Project) => void
  updateProject: (updater: (project: Project) => void, recordHistory?: boolean) => void
  persistProject: () => Promise<void>
  getActiveScreen: () => Screen | null
  setProjectName: (name: string) => void
  setBrandKitOverride: (brandKit: Partial<BrandKit>) => void
  clearBrandKitOverride: () => void
  applyBrandToAllText: (scope: 'screen' | 'all', color?: string, font?: string) => void
  applyTemplateToAllScreens: (
    elements: Element[],
    background: BackgroundConfig,
    mode?: TemplateApplyMode,
  ) => void
  getElementCount: () => number
  addScreen: () => void
  duplicateScreen: (screenId: string) => void
  copyScreenToAndroid: (screenId: string, targetDeviceId: string) => string | null
  syncLinkedAndroidScreen: (appleScreenId: string) => boolean
  copyAllScreensToAndroid: (targetDeviceId: string) => string[]
  deleteScreen: (screenId: string) => void
  reorderScreens: (screenIds: string[]) => void
  renameScreen: (screenId: string, name: string) => void
  setActiveScreenBackground: (background: BackgroundConfig) => void
  addElement: (element: Element) => void
  updateElement: (id: string, patch: Partial<Element>) => void
  deleteElements: (ids: string[]) => void
  duplicateElements: (ids: string[]) => void
  reorderElements: (elementIds: string[]) => void
  bringForward: (id: string) => void
  sendBackward: (id: string) => void
  groupElements: (ids: string[]) => void
  ungroupElements: (groupId: string) => void
  applyTemplateToScreen: (
    screenId: string,
    elements: Element[],
    background: BackgroundConfig,
    mode?: TemplateApplyMode,
  ) => void
  registerAssetUrl: (assetId: string, url: string) => void
  addText: () => void
  addShape: (kind?: import('@/lib/types').ShapeKind) => void
  addImageFromAsset: (assetId: string, src: string) => void
  addDevice: (deviceId: string) => void
  alignElements: (ids: string[], alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void
  alignToArtboard: (ids: string[], axis: 'horizontal' | 'vertical') => void
  distributeElements: (ids: string[], axis: 'horizontal' | 'vertical') => void
}

function withHistory(project: Project, recordHistory = true) {
  useHistoryStore.getState().setPresent(project, recordHistory)
}

export { endElementCoalesce } from '@/stores/project/element-update-coalesce'

export const useProjectStore = create<ProjectState>()(
  immer((set, get) => ({
    project: null,
    assetUrls: {},
    dirty: false,
    saveStatus: 'saved',

    loadProject: (project) => {
      resetElementCoalesce()
      useHistoryStore.getState().reset(project)
      set({ project, dirty: false, saveStatus: 'saved' })
    },

    restoreFromHistory: (project) => {
      // Apply an undo/redo result WITHOUT resetting the history stacks, so that
      // multi-step undo and redo keep working. The history store has already
      // advanced its present pointer; we only mirror it into project state.
      resetElementCoalesce()
      set({ project, dirty: true, saveStatus: 'unsaved' })
    },

    updateProject: (updater, recordHistory = true) => {
      const current = get().project
      if (!current) return
      const next = structuredClone(current)
      updater(next)
      next.updatedAt = new Date().toISOString()
      withHistory(next, recordHistory)
      set({ project: next, dirty: true, saveStatus: 'unsaved' })
    },

    persistProject: async () => {
      const project = get().project
      if (!project) return
      set({ saveStatus: 'saving' })
      await saveProject(project)
      set({ dirty: false, saveStatus: 'saved' })
    },

    getActiveScreen: () => {
      const project = get().project
      if (!project || project.screens.length === 0) return null
      const activeId = useEditorStore.getState().activeScreenId
      return project.screens.find((screen) => screen.id === activeId) ?? project.screens[0]
    },

    setProjectName: (name) => {
      get().updateProject((project) => {
        project.name = name
      })
    },

    setBrandKitOverride: (brandKit) => {
      get().updateProject((project) => {
        const current = project.settings.brandKitOverride ?? { colors: [], fonts: [] }
        project.settings.brandKitOverride = { ...current, ...brandKit }
      })
    },

    clearBrandKitOverride: () => {
      get().updateProject((project) => {
        delete project.settings.brandKitOverride
      })
    },

    applyBrandToAllText: (scope, color, font) => {
      get().updateProject((project) => {
        const screens = scope === 'all' ? project.screens : [get().getActiveScreen()].filter(Boolean) as Screen[]
        for (const screen of screens) {
          for (const element of screen.elements) {
            if (element.type !== 'text') continue
            if (color) (element as TextElement).fill = color
            if (font) (element as TextElement).fontFamily = font
          }
        }
      })
    },

    applyTemplateToAllScreens: (elements, background, mode = 'replace') => {
      get().updateProject((project) => {
        applyTemplateToAllScreensInProject(project, elements, background, mode)
      })
    },

    getElementCount: () => {
      const project = get().project
      if (!project) return 0
      return project.screens.reduce((sum, screen) => sum + screen.elements.length, 0)
    },

    addScreen: () => {
      get().updateProject((project) => {
        addScreenToProject(project)
      })
    },

    duplicateScreen: (screenId) => {
      get().updateProject((project) => {
        duplicateScreenInProject(project, screenId)
      })
    },

    copyScreenToAndroid: (screenId, targetDeviceId) => {
      let createdId: string | null = null
      get().updateProject((project) => {
        createdId = copyScreenToAndroidInProject(project, screenId, targetDeviceId)
      })
      return createdId
    },

    syncLinkedAndroidScreen: (appleScreenId) => {
      let synced = false
      get().updateProject((project) => {
        synced = syncLinkedAndroidScreenInProject(project, appleScreenId)
      })
      return synced
    },

    copyAllScreensToAndroid: (targetDeviceId) => {
      let createdIds: string[] = []
      get().updateProject((project) => {
        createdIds = copyAllScreensToAndroidInProject(project, targetDeviceId)
      })
      return createdIds
    },

    deleteScreen: (screenId) => {
      let nextActiveId: string | null = null
      get().updateProject((project) => {
        const result = deleteScreenFromProject(project, screenId)
        if (!result) return
        nextActiveId = resolveNextActiveScreenId(
          result.deletedIndex,
          result.remaining,
          useEditorStore.getState().activeScreenId,
        )
      })
      if (nextActiveId) {
        useEditorStore.getState().focusScreen(nextActiveId, false)
      } else {
        useEditorStore.getState().clearSelection()
      }
    },

    reorderScreens: (screenIds) => {
      get().updateProject((project) => {
        reorderScreensInProject(project, screenIds)
      })
    },

    renameScreen: (screenId, name) => {
      get().updateProject((project) => {
        renameScreenInProject(project, screenId, name)
      })
    },

    setActiveScreenBackground: (background) => {
      const activeScreen = get().getActiveScreen()
      if (!activeScreen) return
      get().updateProject((project) => {
        const screen = findScreenById(project, activeScreen.id)
        if (screen) setScreenBackground(screen, background)
      })
    },

    addElement: (element) => {
      const activeScreen = get().getActiveScreen()
      if (!activeScreen) return
      get().updateProject((project) => {
        const screen = findScreenById(project, activeScreen.id)
        if (!screen) return
        addElementToScreen(screen, element)
      })
    },

    updateElement: (id, patch) => {
      const activeScreen = get().getActiveScreen()
      if (!activeScreen) return
      const recordHistory = resolveElementUpdateHistory(id, patch)
      get().updateProject((project) => {
        const screen = findScreenById(project, activeScreen.id)
        if (!screen) return
        updateElementOnScreen(screen, id, patch)
      }, recordHistory)
    },

    deleteElements: (ids) => {
      const activeScreen = get().getActiveScreen()
      if (!activeScreen) return
      get().updateProject((project) => {
        const screen = findScreenById(project, activeScreen.id)
        if (!screen) return
        deleteElementsFromScreen(screen, ids)
      })
    },

    duplicateElements: (ids) => {
      const activeScreen = get().getActiveScreen()
      if (!activeScreen) return
      get().updateProject((project) => {
        const screen = findScreenById(project, activeScreen.id)
        if (!screen) return
        duplicateElementsOnScreen(screen, ids)
      })
    },

    reorderElements: (elementIds) => {
      const activeScreen = get().getActiveScreen()
      if (!activeScreen) return
      get().updateProject((project) => {
        const screen = findScreenById(project, activeScreen.id)
        if (!screen) return
        reorderElementsOnScreen(screen, elementIds)
      })
    },

    bringForward: (id) => {
      const activeScreen = get().getActiveScreen()
      if (!activeScreen) return
      get().updateProject((project) => {
        const screen = findScreenById(project, activeScreen.id)
        if (!screen) return
        bringForwardElement(screen, id)
      })
    },

    sendBackward: (id) => {
      const activeScreen = get().getActiveScreen()
      if (!activeScreen) return
      get().updateProject((project) => {
        const screen = findScreenById(project, activeScreen.id)
        if (!screen) return
        sendBackwardElement(screen, id)
      })
    },

    groupElements: (ids) => {
      if (ids.length < 2) return
      const activeScreen = get().getActiveScreen()
      if (!activeScreen) return
      get().updateProject((project) => {
        const screen = findScreenById(project, activeScreen.id)
        if (!screen) return
        groupElementsOnScreen(screen, ids)
      })
    },

    ungroupElements: (groupId) => {
      const activeScreen = get().getActiveScreen()
      if (!activeScreen) return
      get().updateProject((project) => {
        const screen = findScreenById(project, activeScreen.id)
        if (!screen) return
        ungroupElementsOnScreen(screen, groupId)
      })
    },

    applyTemplateToScreen: (screenId, elements, background, mode = 'replace') => {
      get().updateProject((project) => {
        applyTemplateToScreenInProject(project, screenId, elements, background, mode)
      })
    },

    registerAssetUrl: (assetId, url) => {
      set((state) => {
        state.assetUrls[assetId] = url
      })
    },

    addText: () => {
      get().addElement(createTextElement())
    },

    addShape: (kind = 'rectangle') => {
      get().addElement(createShapeElement(kind))
    },

    addImageFromAsset: (assetId, src) => {
      get().addElement(createImageElement({ assetId, src, name: 'Image' }))
    },

    addDevice: (deviceId) => {
      get().addElement(createDefaultDeviceElement(deviceId))
    },

    alignElements: (ids, alignment) => {
      const activeScreen = get().getActiveScreen()
      if (!activeScreen || ids.length === 0) return
      get().updateProject((project) => {
        const screen = findScreenById(project, activeScreen.id)
        if (!screen) return
        alignElementsOnScreen(screen, ids, alignment)
      })
    },

    alignToArtboard: (ids, axis) => {
      const activeScreen = get().getActiveScreen()
      if (!activeScreen || ids.length === 0) return
      get().updateProject((project) => {
        const screen = findScreenById(project, activeScreen.id)
        if (!screen) return
        alignElementsToArtboard(screen, ids, axis)
      })
    },

    distributeElements: (ids, axis) => {
      const activeScreen = get().getActiveScreen()
      if (!activeScreen || ids.length < 3) return
      get().updateProject((project) => {
        const screen = findScreenById(project, activeScreen.id)
        if (!screen) return
        distributeElementsOnScreen(screen, ids, axis)
      })
    },
  })),
)

export function createAndLoadProject(name?: string) {
  const project = createProject(name)
  useProjectStore.getState().loadProject(project)
  return project
}
