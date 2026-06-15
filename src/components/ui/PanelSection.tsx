import type { ComponentType, ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PanelSectionProps {
  title: string
  children: ReactNode
  defaultOpen?: boolean
  icon?: ComponentType<{ size?: number | string; className?: string; strokeWidth?: number }>
}

export function PanelSection({ title, children, defaultOpen = true, icon: Icon }: PanelSectionProps) {
  return (
    <details className="group border-b border-border/50" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center gap-1.5 px-3 py-2 transition-colors hover:bg-muted/30 [&::-webkit-details-marker]:hidden">
        {Icon ? (
          <Icon size={12} strokeWidth={2} className="shrink-0 text-muted-foreground" />
        ) : null}
        <span className="flex-1 text-[11px] font-semibold uppercase tracking-wide text-foreground/90">
          {title}
        </span>
        <ChevronDown
          size={12}
          strokeWidth={2}
          className="shrink-0 text-muted-foreground/60 transition-transform duration-200 group-open:rotate-180"
        />
      </summary>
      <div className={cn('space-y-2 px-3 pb-2.5 pt-0')}>{children}</div>
    </details>
  )
}
