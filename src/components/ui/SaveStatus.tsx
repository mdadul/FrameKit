import { Cloud, CloudOff, Loader2 } from 'lucide-react'
import { useProjectStore } from '@/stores/project-store'
import { cn } from '@/lib/utils'

export function SaveStatus() {
  const saveStatus = useProjectStore((state) => state.saveStatus)

  const config = {
    saved: { icon: Cloud, label: 'Saved', className: 'text-muted-foreground' },
    saving: { icon: Loader2, label: 'Saving…', className: 'text-muted-foreground' },
    unsaved: { icon: CloudOff, label: 'Unsaved', className: 'text-amber-600 dark:text-amber-400' },
  }[saveStatus]

  const Icon = config.icon

  return (
    <span
      className={cn(
        'hidden items-center gap-1.5 text-xs font-medium sm:inline-flex',
        config.className,
      )}
      title={config.label}
    >
      <Icon size={14} className={saveStatus === 'saving' ? 'animate-spin' : ''} />
      {config.label}
    </span>
  )
}
