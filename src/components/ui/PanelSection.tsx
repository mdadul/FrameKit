import type { ComponentType, ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PanelSectionProps {
  title: string
  children: ReactNode
  defaultOpen?: boolean
  icon?: ComponentType<{ size?: number | string; className?: string; strokeWidth?: number }>
}

export function PanelSection({
  title,
  children,
  defaultOpen = true,
  icon: Icon,
}: PanelSectionProps) {
  return (
    <details className="group border-b border-border/50" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2.5 transition-colors hover:bg-muted/40 [&::-webkit-details-marker]:hidden">
        <ChevronRight
          size={14}
          strokeWidth={2}
          className="shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-90"
        />
        {Icon ? (
          <Icon size={14} strokeWidth={2} className="shrink-0 text-muted-foreground" />
        ) : null}
        <span className="flex-1 text-[12px] font-medium text-foreground">{title}</span>
      </summary>
      <div className={cn('space-y-3 px-3 pb-3 pt-0')}>{children}</div>
    </details>
  )
}
