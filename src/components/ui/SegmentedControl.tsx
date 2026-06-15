import { cn } from '@/lib/utils'

export interface SegmentedControlOption<T extends string> {
  value: T
  label: string
}

interface SegmentedControlProps<T extends string> {
  options: Array<SegmentedControlOption<T>>
  value: T
  onChange: (value: T) => void
  label?: string
  ariaLabel?: string
  className?: string
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  ariaLabel,
  className,
}: SegmentedControlProps<T>) {
  const control = (
    <div
      className={cn(
        'inline-flex w-full gap-0.5 rounded-md border border-border/60 bg-muted/40 p-0.5',
        className,
      )}
      role="tablist"
      aria-label={ariaLabel ?? label}
      style={{ display: 'grid', gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((option) => {
        const active = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'rounded-[5px] py-1.5 text-[11px] font-medium capitalize transition',
              active
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )

  if (!label) return control

  return (
    <div className="space-y-1.5">
      <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
      {control}
    </div>
  )
}
