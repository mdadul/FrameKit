import { create } from 'zustand'
import { DEFAULT_USER_PREFERENCES } from '@/lib/constants'
import { getUserPreferences, saveUserPreferences } from '@/lib/db'
import type { BrandKit, ExportPreferences, ThemeMode, UserPreferences, WorkspacePreferences } from '@/lib/types'

interface SettingsState {
  preferences: UserPreferences
  loaded: boolean
  loadPreferences: () => Promise<void>
  setTheme: (theme: ThemeMode) => Promise<void>
  updateWorkspace: (workspace: Partial<WorkspacePreferences>) => Promise<void>
  updateExport: (exportPrefs: Partial<ExportPreferences>) => Promise<void>
  updateBrandKit: (brandKit: Partial<BrandKit>) => Promise<void>
}

async function persist(preferences: UserPreferences) {
  await saveUserPreferences(preferences)
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  preferences: DEFAULT_USER_PREFERENCES,
  loaded: false,

  loadPreferences: async () => {
    const preferences = await getUserPreferences()
    set({ preferences, loaded: true })
    applyTheme(preferences.theme)
  },

  setTheme: async (theme) => {
    const preferences = { ...get().preferences, theme }
    set({ preferences })
    applyTheme(theme)
    await persist(preferences)
  },

  updateWorkspace: async (workspace) => {
    const preferences = {
      ...get().preferences,
      workspace: { ...get().preferences.workspace, ...workspace },
    }
    set({ preferences })
    await persist(preferences)
  },

  updateExport: async (exportPrefs) => {
    const preferences = {
      ...get().preferences,
      export: { ...get().preferences.export, ...exportPrefs },
    }
    set({ preferences })
    await persist(preferences)
  },

  updateBrandKit: async (brandKit) => {
    const preferences = {
      ...get().preferences,
      brandKit: { ...get().preferences.brandKit, ...brandKit },
    }
    set({ preferences })
    await persist(preferences)
  },
}))

export function applyTheme(theme: ThemeMode) {
  const root = document.documentElement
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const isDark = theme === 'dark' || (theme === 'system' && prefersDark)
  root.classList.toggle('dark', isDark)
}
