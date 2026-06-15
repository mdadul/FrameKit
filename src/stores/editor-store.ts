import { computePlatformLayout } from '@/lib/canvas/workspace-layout'
import type { KonvaExportOptions } from '@/lib/canvas/konva-export'
import type { Screen } from '@/lib/types'
import { create } from 'zustand'

export type FitRequest = 'all' | 'active' | null

export interface ScreenPosition {
  x: number
  y: number
}

export interface KonvaStageBridge {
  activeScreenId: string | null
  exportActiveScreen: (
    screenId: string,
    options: KonvaExportOptions,
  ) => Promise<Blob | null>
}

interface EditorState {
  selectedElementIds: string[]
  activeScreenId: string | null
  workspaceZoom: number
  panX: number
  panY: number
  screenLayout: Record<string, ScreenPosition>
  fitRequest: FitRequest
  focusScreenId: string | null
  isPanning: boolean
  isSpacePressed: boolean
  leftPanelTab: 'layers' | 'assets' | 'screens' | 'templates' | 'brand'
  viewMode: 'canvas' | 'overview'
  clipboard: import('@/lib/types').Element[] | null
  styleClipboard: Partial<import('@/lib/types').Element> | null
  marquee: { x: number; y: number; width: number; height: number; screenId: string } | null
  konvaStageBridge: KonvaStageBridge | null
  setSelectedElementIds: (ids: string[]) => void
  toggleSelection: (id: string) => void
  clearSelection: () => void
  setActiveScreenId: (id: string | null) => void
  setWorkspaceZoom: (zoom: number) => void
  setPan: (x: number, y: number) => void
  syncScreenLayout: (screens: Screen[]) => void
  setScreenLayout: (layout: Record<string, ScreenPosition>) => void
  requestFit: (mode: Exclude<FitRequest, null>) => void
  consumeFitRequest: () => FitRequest
  focusScreen: (screenId: string, fit?: boolean) => void
  consumeFocusScreen: () => string | null
  setIsPanning: (value: boolean) => void
  setIsSpacePressed: (value: boolean) => void
  setLeftPanelTab: (tab: EditorState['leftPanelTab']) => void
  setViewMode: (mode: EditorState['viewMode']) => void
  setClipboard: (elements: import('@/lib/types').Element[] | null) => void
  setStyleClipboard: (style: Partial<import('@/lib/types').Element> | null) => void
  setMarquee: (marquee: EditorState['marquee']) => void
  setKonvaStageBridge: (bridge: KonvaStageBridge | null) => void
}

export const useEditorStore = create<EditorState>((set, get) => ({
  selectedElementIds: [],
  activeScreenId: null,
  workspaceZoom: 0.5,
  panX: 0,
  panY: 0,
  screenLayout: {},
  fitRequest: null,
  focusScreenId: null,
  isPanning: false,
  isSpacePressed: false,
  leftPanelTab: 'layers',
  viewMode: 'canvas',
  clipboard: null,
  styleClipboard: null,
  marquee: null,
  konvaStageBridge: null,

  setSelectedElementIds: (ids) => set({ selectedElementIds: ids }),
  toggleSelection: (id) => {
    const current = get().selectedElementIds
    if (current.includes(id)) {
      set({ selectedElementIds: current.filter((item) => item !== id) })
    } else {
      set({ selectedElementIds: [...current, id] })
    }
  },
  clearSelection: () => set({ selectedElementIds: [] }),
  setActiveScreenId: (id) => set({ activeScreenId: id }),
  setWorkspaceZoom: (workspaceZoom) => set({ workspaceZoom }),
  setPan: (panX, panY) => set({ panX, panY }),
  syncScreenLayout: (screens) => set({ screenLayout: computePlatformLayout(screens) }),
  setScreenLayout: (screenLayout) => set({ screenLayout }),
  requestFit: (mode) => set({ fitRequest: mode }),
  consumeFitRequest: () => {
    const mode = get().fitRequest
    if (mode) set({ fitRequest: null })
    return mode
  },
  focusScreen: (screenId, fit = true) =>
    set({
      activeScreenId: screenId,
      focusScreenId: screenId,
      fitRequest: fit ? 'active' : null,
      selectedElementIds: [],
    }),
  consumeFocusScreen: () => {
    const id = get().focusScreenId
    if (id) set({ focusScreenId: null })
    return id
  },
  setIsPanning: (value) => set({ isPanning: value }),
  setIsSpacePressed: (value) => set({ isSpacePressed: value }),
  setLeftPanelTab: (tab) => set({ leftPanelTab: tab }),
  setViewMode: (viewMode) => set({ viewMode }),
  setClipboard: (elements) => set({ clipboard: elements }),
  setStyleClipboard: (style) => set({ styleClipboard: style }),
  setMarquee: (marquee) => set({ marquee }),
  setKonvaStageBridge: (bridge) => set({ konvaStageBridge: bridge }),
}))
