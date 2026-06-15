import { create } from 'zustand'
import { MAX_HISTORY } from '@/lib/constants'
import type { Project } from '@/lib/types'

interface HistoryState {
  past: Project[]
  present: Project | null
  future: Project[]
  canUndo: boolean
  canRedo: boolean
  setPresent: (project: Project, recordHistory?: boolean) => void
  undo: () => Project | null
  redo: () => Project | null
  reset: (project: Project) => void
}

function cloneProject(project: Project): Project {
  return structuredClone(project)
}

export const useHistoryStore = create<HistoryState>()((set, get) => ({
  past: [],
  present: null,
  future: [],
  canUndo: false,
  canRedo: false,

  setPresent: (project, recordHistory = true) => {
    const current = get().present
    set((state) => {
      const nextPast = recordHistory && current
        ? [...state.past, cloneProject(current)].slice(-MAX_HISTORY)
        : state.past
      return {
        past: nextPast,
        present: cloneProject(project),
        future: recordHistory && current ? [] : state.future,
        canUndo: nextPast.length > 0,
        canRedo: recordHistory && current ? false : state.future.length > 0,
      }
    })
  },

  undo: () => {
    const { past, present, future } = get()
    if (!present || past.length === 0) return null

    const previous = past[past.length - 1]
    set({
      past: past.slice(0, -1),
      present: cloneProject(previous),
      future: [cloneProject(present), ...future],
      canUndo: past.length > 1,
      canRedo: true,
    })
    return cloneProject(previous)
  },

  redo: () => {
    const { past, present, future } = get()
    if (!present || future.length === 0) return null

    const next = future[0]
    set({
      past: [...past, cloneProject(present)],
      present: cloneProject(next),
      future: future.slice(1),
      canUndo: true,
      canRedo: future.length > 1,
    })
    return cloneProject(next)
  },

  reset: (project) => {
    set({
      past: [],
      present: cloneProject(project),
      future: [],
      canUndo: false,
      canRedo: false,
    })
  },
}))
