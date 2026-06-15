import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import {
  DEFAULT_DEVICE_HEIGHT,
  DEFAULT_DEVICE_SHADOW_INTENSITY,
  DEFAULT_DEVICE_SHADOW_SPREAD,
  DEFAULT_DEVICE_WIDTH,
  DEFAULT_DEVICE_X,
  DEFAULT_DEVICE_Y,
  MAX_SCREENS,
} from '@/lib/constants'
import {
  cloneScreenDesign,
  createImageElement,
  createProject,
  createScreenFromPrevious,
  createShapeElement,
  createTextElement,
  duplicateElement,
  reindexElements,
  sortElementsByZIndex,
} from '@/lib/factories'
import { saveProject } from '@/lib/db'
import {
  cloneScreenForAndroid,
  getScreenPlatform,
  isAppleScreen,
  sortScreensByPlatform,
} from '@/lib/platform-copy'
import { createId } from '@/lib/utils'
import { useHistoryStore } from '@/stores/history-store'
import { useEditorStore } from '@/stores/editor-store'
import type {
  BackgroundConfig,
  BrandKit,
  DeviceElement,
  Element,
  Project,
  Screen,
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
  applyTemplateToAllScreens: (elements: Element[], background: BackgroundConfig) => void
  getElementCount: () => number
  addScreen: () => void
  duplicateScreen: (screenId: string) => void
  copyScreenToAndroid: (screenId: string, targetDeviceId: string) => string | null
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
  applyTemplateToScreen: (screenId: string, elements: Element[], background: BackgroundConfig) => void
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

/**
 * History coalescing for continuous interactions (slider/color drags, canvas
 * moves). Repeated `updateElement` calls that target the same element + same
 * patched fields within a short window collapse into a SINGLE undo step:
 * the first call records a history baseline, subsequent calls only replace the
 * present without pushing more past entries. The window auto-closes after
 * inactivity; `endElementCoalesce()` lets callers close it deterministically
 * (e.g. on slider commit or color popover close).
 */
const COALESCE_WINDOW_MS = 500
let coalesceKey: string | null = null
let coalesceTimer: ReturnType<typeof setTimeout> | null = null

function resetCoalesce() {
  coalesceKey = null
  if (coalesceTimer) {
    clearTimeout(coalesceTimer)
    coalesceTimer = null
  }
}

function scheduleCoalesceClear() {
  if (coalesceTimer) clearTimeout(coalesceTimer)
  coalesceTimer = setTimeout(resetCoalesce, COALESCE_WINDOW_MS)
}

export function endElementCoalesce() {
  resetCoalesce()
}

export const useProjectStore = create<ProjectState>()(
  immer((set, get) => ({
    project: null,
    assetUrls: {},
    dirty: false,
    saveStatus: 'saved',

    loadProject: (project) => {
      resetCoalesce()
      useHistoryStore.getState().reset(project)
      set({ project, dirty: false, saveStatus: 'saved' })
    },

    restoreFromHistory: (project) => {
      // Apply an undo/redo result WITHOUT resetting the history stacks, so that
      // multi-step undo and redo keep working. The history store has already
      // advanced its present pointer; we only mirror it into project state.
      resetCoalesce()
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

    applyTemplateToAllScreens: (elements, background) => {
      get().updateProject((project) => {
        for (const screen of project.screens) {
          screen.background = structuredClone(background)
          screen.elements = elements.map((element, index) => ({
            ...structuredClone(element),
            id: createId(),
            zIndex: index,
          }))
        }
      })
    },

    getElementCount: () => {
      const project = get().project
      if (!project) return 0
      return project.screens.reduce((sum, screen) => sum + screen.elements.length, 0)
    },

    addScreen: () => {
      get().updateProject((project) => {
        if (project.screens.length >= MAX_SCREENS) return
        const previous = project.screens.at(-1)
        project.screens.push(
          createScreenFromPrevious(previous, `Screen ${project.screens.length + 1}`),
        )
      })
    },

    duplicateScreen: (screenId) => {
      get().updateProject((project) => {
        if (project.screens.length >= MAX_SCREENS) return
        const source = project.screens.find((screen) => screen.id === screenId)
        if (!source) return
        project.screens.push(cloneScreenDesign(source, `${source.name} copy`))
      })
    },

    copyScreenToAndroid: (screenId, targetDeviceId) => {
      let createdId: string | null = null
      get().updateProject((project) => {
        const source = project.screens.find((screen) => screen.id === screenId)
        if (!source || !isAppleScreen(source)) return

        project.screens = project.screens.filter(
          (screen) =>
            !(getScreenPlatform(screen) === 'android' && screen.sourceScreenId === screenId),
        )

        if (project.screens.length >= MAX_SCREENS) return

        const copy = cloneScreenForAndroid(source, targetDeviceId)
        createdId = copy.id
        project.screens = sortScreensByPlatform([...project.screens, copy])
      })
      return createdId
    },

    copyAllScreensToAndroid: (targetDeviceId) => {
      const createdIds: string[] = []
      get().updateProject((project) => {
        const appleScreens = project.screens.filter(isAppleScreen)
        if (appleScreens.length === 0) return

        const appleIds = new Set(appleScreens.map((screen) => screen.id))
        project.screens = project.screens.filter(
          (screen) =>
            getScreenPlatform(screen) !== 'android' ||
            !screen.sourceScreenId ||
            !appleIds.has(screen.sourceScreenId),
        )

        const slotsAvailable = MAX_SCREENS - project.screens.length
        const toCopy = appleScreens.slice(0, slotsAvailable)
        const copies = toCopy.map((screen) => cloneScreenForAndroid(screen, targetDeviceId))
        createdIds.push(...copies.map((screen) => screen.id))
        project.screens = sortScreensByPlatform([...project.screens, ...copies])
      })
      return createdIds
    },

    deleteScreen: (screenId) => {
      let nextActiveId: string | null = null
      get().updateProject((project) => {
        if (project.screens.length <= 1) return
        const index = project.screens.findIndex((screen) => screen.id === screenId)
        if (index === -1) return
        const remaining = project.screens.filter((screen) => screen.id !== screenId)
        const activeId = useEditorStore.getState().activeScreenId
        if (!activeId || activeId === screenId || !remaining.some((screen) => screen.id === activeId)) {
          nextActiveId = remaining[Math.min(index, remaining.length - 1)]?.id ?? remaining[0]?.id ?? null
        }
        project.screens = remaining
      })
      if (nextActiveId) {
        useEditorStore.getState().focusScreen(nextActiveId, false)
      } else {
        useEditorStore.getState().clearSelection()
      }
    },

    reorderScreens: (screenIds) => {
      get().updateProject((project) => {
        const map = new Map(project.screens.map((screen) => [screen.id, screen]))
        project.screens = screenIds
          .map((id) => map.get(id))
          .filter((screen): screen is Screen => Boolean(screen))
      })
    },

    renameScreen: (screenId, name) => {
      get().updateProject((project) => {
        const screen = project.screens.find((item) => item.id === screenId)
        if (screen) screen.name = name
      })
    },

    setActiveScreenBackground: (background) => {
      const activeScreen = get().getActiveScreen()
      if (!activeScreen) return
      get().updateProject((project) => {
        const screen = project.screens.find((item) => item.id === activeScreen.id)
        if (screen) screen.background = background
      })
    },

    addElement: (element) => {
      const activeScreen = get().getActiveScreen()
      if (!activeScreen) return
      get().updateProject((project) => {
        const screen = project.screens.find((item) => item.id === activeScreen.id)
        if (!screen) return
        const zIndex = screen.elements.length
        screen.elements.push({ ...element, zIndex })
      })
    },

    updateElement: (id, patch) => {
      const activeScreen = get().getActiveScreen()
      if (!activeScreen) return
      // Coalesce rapid updates to the same element + same fields (slider/color
      // drags, canvas moves) into one undo step: the first update records a
      // baseline, later ones in the window only replace the present.
      const key = `${id}:${Object.keys(patch).sort().join(',')}`
      const recordHistory = key !== coalesceKey
      coalesceKey = key
      scheduleCoalesceClear()
      get().updateProject((project) => {
        const screen = project.screens.find((item) => item.id === activeScreen.id)
        if (!screen) return
        const index = screen.elements.findIndex((element) => element.id === id)
        if (index === -1) return
        screen.elements[index] = {
          ...screen.elements[index],
          ...patch,
        } as Element
      }, recordHistory)
    },

    deleteElements: (ids) => {
      const activeScreen = get().getActiveScreen()
      if (!activeScreen) return
      get().updateProject((project) => {
        const screen = project.screens.find((item) => item.id === activeScreen.id)
        if (!screen) return
        screen.elements = reindexElements(
          sortElementsByZIndex(screen.elements).filter((element) => !ids.includes(element.id)),
        )
      })
    },

    duplicateElements: (ids) => {
      const activeScreen = get().getActiveScreen()
      if (!activeScreen) return
      get().updateProject((project) => {
        const screen = project.screens.find((item) => item.id === activeScreen.id)
        if (!screen) return
        const copies = screen.elements
          .filter((element) => ids.includes(element.id))
          .map((element) => duplicateElement(element))
        screen.elements = reindexElements([...sortElementsByZIndex(screen.elements), ...copies])
      })
    },

    reorderElements: (elementIds) => {
      const activeScreen = get().getActiveScreen()
      if (!activeScreen) return
      get().updateProject((project) => {
        const screen = project.screens.find((item) => item.id === activeScreen.id)
        if (!screen) return
        const map = new Map(screen.elements.map((element) => [element.id, element]))
        const orderedIds = new Set(elementIds)
        const ordered = elementIds
          .map((id) => map.get(id))
          .filter((element): element is Element => Boolean(element))
        const remaining = sortElementsByZIndex(
          screen.elements.filter((element) => !orderedIds.has(element.id)),
        )
        screen.elements = reindexElements([...ordered, ...remaining])
      })
    },

    bringForward: (id) => {
      const activeScreen = get().getActiveScreen()
      if (!activeScreen) return
      get().updateProject((project) => {
        const screen = project.screens.find((item) => item.id === activeScreen.id)
        if (!screen) return
        const sorted = sortElementsByZIndex(screen.elements)
        const index = sorted.findIndex((element) => element.id === id)
        if (index < 0 || index === sorted.length - 1) return
        ;[sorted[index], sorted[index + 1]] = [sorted[index + 1], sorted[index]]
        screen.elements = reindexElements(sorted)
      })
    },

    sendBackward: (id) => {
      const activeScreen = get().getActiveScreen()
      if (!activeScreen) return
      get().updateProject((project) => {
        const screen = project.screens.find((item) => item.id === activeScreen.id)
        if (!screen) return
        const sorted = sortElementsByZIndex(screen.elements)
        const index = sorted.findIndex((element) => element.id === id)
        if (index <= 0) return
        ;[sorted[index], sorted[index - 1]] = [sorted[index - 1], sorted[index]]
        screen.elements = reindexElements(sorted)
      })
    },

    groupElements: (ids) => {
      if (ids.length < 2) return
      const activeScreen = get().getActiveScreen()
      if (!activeScreen) return
      get().updateProject((project) => {
        const screen = project.screens.find((item) => item.id === activeScreen.id)
        if (!screen) return
        const groupId = createId()
        screen.elements = screen.elements.map((element) =>
          ids.includes(element.id) ? { ...element, groupId } : element,
        )
      })
    },

    ungroupElements: (groupId) => {
      const activeScreen = get().getActiveScreen()
      if (!activeScreen) return
      get().updateProject((project) => {
        const screen = project.screens.find((item) => item.id === activeScreen.id)
        if (!screen) return
        screen.elements = screen.elements.map((element) =>
          element.groupId === groupId ? { ...element, groupId: undefined } : element,
        )
      })
    },

    applyTemplateToScreen: (screenId, elements, background) => {
      get().updateProject((project) => {
        const screen = project.screens.find((item) => item.id === screenId)
        if (!screen) return
        screen.background = background
        screen.elements = elements.map((element, index) => ({
          ...structuredClone(element),
          id: createId(),
          zIndex: index,
        }))
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
      const device: DeviceElement = {
        id: createId(),
        type: 'device',
        name: 'Device',
        deviceId,
        x: DEFAULT_DEVICE_X,
        y: DEFAULT_DEVICE_Y,
        width: DEFAULT_DEVICE_WIDTH,
        height: DEFAULT_DEVICE_HEIGHT,
        rotation: 0,
        opacity: 1,
        locked: false,
        visible: true,
        zIndex: 3,
        shadowIntensity: DEFAULT_DEVICE_SHADOW_INTENSITY,
        shadowSpread: DEFAULT_DEVICE_SHADOW_SPREAD,
      }
      get().addElement(device)
    },

    alignElements: (ids, alignment) => {
      const activeScreen = get().getActiveScreen()
      if (!activeScreen || ids.length === 0) return
      get().updateProject((project) => {
        const screen = project.screens.find((item) => item.id === activeScreen.id)
        if (!screen) return
        const selected = screen.elements.filter((element) => ids.includes(element.id))
        if (selected.length === 0) return

        const bounds = {
          left: Math.min(...selected.map((element) => element.x)),
          right: Math.max(...selected.map((element) => element.x + element.width)),
          top: Math.min(...selected.map((element) => element.y)),
          bottom: Math.max(...selected.map((element) => element.y + element.height)),
        }

        screen.elements = screen.elements.map((element) => {
          if (!ids.includes(element.id)) return element
          const next = { ...element }
          switch (alignment) {
            case 'left':
              next.x = bounds.left
              break
            case 'center':
              next.x = bounds.left + (bounds.right - bounds.left - element.width) / 2
              break
            case 'right':
              next.x = bounds.right - element.width
              break
            case 'top':
              next.y = bounds.top
              break
            case 'middle':
              next.y = bounds.top + (bounds.bottom - bounds.top - element.height) / 2
              break
            case 'bottom':
              next.y = bounds.bottom - element.height
              break
          }
          return next
        })
      })
    },

    alignToArtboard: (ids, axis) => {
      const activeScreen = get().getActiveScreen()
      if (!activeScreen || ids.length === 0) return
      get().updateProject((project) => {
        const screen = project.screens.find((item) => item.id === activeScreen.id)
        if (!screen) return
        screen.elements = screen.elements.map((element) => {
          if (!ids.includes(element.id)) return element
          return axis === 'horizontal'
            ? { ...element, x: (screen.width - element.width) / 2 }
            : { ...element, y: (screen.height - element.height) / 2 }
        })
      })
    },

    distributeElements: (ids, axis) => {
      const activeScreen = get().getActiveScreen()
      if (!activeScreen || ids.length < 3) return
      get().updateProject((project) => {
        const screen = project.screens.find((item) => item.id === activeScreen.id)
        if (!screen) return
        const selected = screen.elements
          .filter((element) => ids.includes(element.id))
          .sort((a, b) => (axis === 'horizontal' ? a.x - b.x : a.y - b.y))
        if (selected.length < 3) return

        const first = selected[0]
        const last = selected[selected.length - 1]
        const totalSpace =
          axis === 'horizontal'
            ? last.x + last.width - first.x
            : last.y + last.height - first.y
        const itemsSize = selected.reduce(
          (sum, element) => sum + (axis === 'horizontal' ? element.width : element.height),
          0,
        )
        const gap = (totalSpace - itemsSize) / (selected.length - 1)

        let cursor = axis === 'horizontal' ? first.x : first.y
        const positions = new Map<string, number>()
        selected.forEach((element) => {
          positions.set(element.id, cursor)
          cursor += (axis === 'horizontal' ? element.width : element.height) + gap
        })

        screen.elements = screen.elements.map((element) => {
          const position = positions.get(element.id)
          if (position === undefined) return element
          return axis === 'horizontal'
            ? { ...element, x: position }
            : { ...element, y: position }
        })
      })
    },
  })),
)

export function createAndLoadProject(name?: string) {
  const project = createProject(name)
  useProjectStore.getState().loadProject(project)
  return project
}
