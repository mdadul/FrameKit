import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface TemplatePreviewFrameProps {
  aspectRatio: string
  className?: string
  children: ReactNode
}

/** Shared aspect-ratio wrapper for template and project thumbnails. */
export function TemplatePreviewFrame({
  aspectRatio,
  className,
  children,
}: TemplatePreviewFrameProps) {
  return (
    <div
      className={cn('relative overflow-hidden', className)}
      style={{ aspectRatio }}
    >
      {children}
    </div>
  )
}
