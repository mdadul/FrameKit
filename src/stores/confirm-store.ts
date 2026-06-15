import { create } from 'zustand'

export interface ConfirmOptions {
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
}

interface ConfirmState extends ConfirmOptions {
  open: boolean
  resolve: ((value: boolean) => void) | null
  confirm: (options: ConfirmOptions) => Promise<boolean>
  handleConfirm: () => void
  handleCancel: () => void
}

export const useConfirmStore = create<ConfirmState>((set, get) => ({
  open: false,
  title: '',
  description: '',
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
  destructive: false,
  resolve: null,

  confirm: (options) =>
    new Promise<boolean>((resolve) => {
      set({
        open: true,
        title: options.title,
        description: options.description ?? '',
        confirmLabel: options.confirmLabel ?? 'Confirm',
        cancelLabel: options.cancelLabel ?? 'Cancel',
        destructive: options.destructive ?? false,
        resolve,
      })
    }),

  handleConfirm: () => {
    const { resolve } = get()
    resolve?.(true)
    set({ open: false, resolve: null })
  },

  handleCancel: () => {
    const { resolve } = get()
    resolve?.(false)
    set({ open: false, resolve: null })
  },
}))

export function confirm(options: ConfirmOptions): Promise<boolean> {
  return useConfirmStore.getState().confirm(options)
}
