import type { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type InputVariant = 'default' | 'muted'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: InputVariant
}

const variantClassName: Record<InputVariant, string> = {
  default:
    'h-9 rounded-md border border-input bg-card px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
  muted:
    'h-7 rounded-md bg-muted/40 px-2 text-[11px] text-foreground transition placeholder:text-muted-foreground hover:bg-muted/55 focus:bg-muted/60 focus:outline-none focus:ring-1 focus:ring-ring/30',
}

export function Input({ className, variant = 'default', ...props }: InputProps) {
  return (
    <input
      className={cn('w-full', variantClassName[variant], className)}
      {...props}
    />
  )
}
