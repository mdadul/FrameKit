import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function FieldGroup({
  label,
  children,
  className,
  hideLabel = false,
}: {
  label: string
  children: ReactNode
  className?: string
  hideLabel?: boolean
}) {
  return (
    <div className={cn('space-y-1', className)}>
      {hideLabel ? null : (
        <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
      )}
      {children}
    </div>
  )
}
