import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface TooltipIconButtonProps {
  icon: LucideIcon
  label: string
  onClick: () => void
  className?: string
}

export function TooltipIconButton({
  icon: Icon,
  label,
  onClick,
  className,
}: TooltipIconButtonProps) {
  return (
    <div className="group/tip relative shrink-0">
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        className={cn(
          'inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          className,
        )}
      >
        <Icon size={15} />
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute top-[calc(100%+4px)] right-0 z-50 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[11px] font-medium text-background opacity-0 shadow-md transition-opacity duration-150 group-hover/tip:opacity-100 group-focus-within/tip:opacity-100"
      >
        {label}
      </span>
    </div>
  )
}
