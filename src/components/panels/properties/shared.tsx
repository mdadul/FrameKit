import type { ReactNode } from 'react'
import { BRAND_PRIMARY } from '@/lib/constants'
import type { GradientFill, ImageFit } from '@/lib/types'

export function Hint({ children }: { children: ReactNode }) {
  return <p className="text-xs leading-relaxed text-muted-foreground">{children}</p>
}

export const OBJECT_FIT_OPTIONS: Array<{ value: ImageFit; label: string }> = [
  { value: 'cover', label: 'Cover' },
  { value: 'contain', label: 'Contain' },
  { value: 'fill', label: 'Fill' },
]

export const DEFAULT_GRADIENT: GradientFill = {
  type: 'linear',
  angle: 90,
  stops: [
    { offset: 0, color: BRAND_PRIMARY },
    { offset: 1, color: '#0f172a' },
  ],
}
