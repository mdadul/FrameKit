import { CheckCircle2, X, XCircle } from 'lucide-react'
import { useToastStore } from '@/stores/toast-store'
import { cn } from '@/lib/utils'

export function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts)
  const removeToast = useToastStore((state) => state.removeToast)

  if (toasts.length === 0) return null

  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-[100] flex flex-col gap-2"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'pointer-events-auto flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm shadow-lg',
            toast.variant === 'success' && 'border-emerald-500/30 bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100',
            toast.variant === 'error' && 'border-destructive/30 bg-destructive/10 text-destructive',
            toast.variant === 'default' && 'border-border bg-card text-foreground',
          )}
        >
          {toast.variant === 'success' && <CheckCircle2 size={16} className="shrink-0" />}
          {toast.variant === 'error' && <XCircle size={16} className="shrink-0" />}
          <span className="flex-1">{toast.message}</span>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => removeToast(toast.id)}
            className="shrink-0 rounded p-0.5 opacity-60 hover:opacity-100"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
