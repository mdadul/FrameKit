import { cn } from '@/lib/utils'

interface BrandMarkProps {
  className?: string
  size?: number
}

/**
 * Brand logo lockup: a rounded gradient badge containing a stylized
 * device-screen glyph. Renders entirely from inline SVG/CSS so it stays
 * crisp on any background and in both light and dark themes.
 */
export function BrandMark({ className, size = 32 }: BrandMarkProps) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-lg shadow-sm ring-1 ring-black/5',
        'bg-gradient-to-br from-teal-600 via-teal-500 to-cyan-500',
        className,
      )}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg
        width={size * 0.6}
        height={size * 0.6}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* device frame */}
        <rect
          x="5"
          y="2.5"
          width="14"
          height="19"
          rx="3"
          stroke="white"
          strokeWidth="1.8"
        />
        {/* screen content: stacked screenshot blocks */}
        <rect x="8" y="6" width="8" height="2.2" rx="1.1" fill="white" opacity="0.95" />
        <rect x="8" y="10" width="8" height="5" rx="1.4" fill="white" opacity="0.55" />
        <rect x="8" y="16.5" width="5" height="2" rx="1" fill="white" opacity="0.9" />
      </svg>
    </span>
  )
}
