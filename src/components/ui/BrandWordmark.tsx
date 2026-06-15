import { BrandMark } from '@/components/ui/BrandMark'
import { APP_NAME } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface BrandWordmarkProps {
  className?: string
  markSize?: number
  showText?: boolean
  textClassName?: string
  href?: string
}

export function BrandWordmark({
  className,
  markSize = 32,
  showText = true,
  textClassName,
}: BrandWordmarkProps) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <BrandMark size={markSize} className="transition-transform group-hover:scale-105" />
      {showText && (
        <span
          className={cn(
            'brand-gradient-text font-bold tracking-tight',
            textClassName ?? 'text-sm',
          )}
        >
          {APP_NAME}
        </span>
      )}
    </span>
  )
}
