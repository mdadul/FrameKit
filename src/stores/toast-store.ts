import { create } from 'zustand'

export type ToastVariant = 'default' | 'success' | 'error'

export interface Toast {
  id: string
  message: string
  variant: ToastVariant
}

interface ToastState {
  toasts: Toast[]
  addToast: (message: string, variant?: ToastVariant, duration?: number) => void
  removeToast: (id: string) => void
}

let toastCounter = 0

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],

  addToast: (message, variant = 'default', duration = 3500) => {
    const id = `toast-${++toastCounter}`
    set({ toasts: [...get().toasts, { id, message, variant }] })
    if (duration > 0) {
      setTimeout(() => get().removeToast(id), duration)
    }
  },

  removeToast: (id) => {
    set({ toasts: get().toasts.filter((toast) => toast.id !== id) })
  },
}))

export function toast(message: string, variant?: ToastVariant) {
  useToastStore.getState().addToast(message, variant)
}
