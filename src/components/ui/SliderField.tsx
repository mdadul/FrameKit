import * as Slider from '@radix-ui/react-slider'
import { cn } from '@/lib/utils'
import { endElementCoalesce } from '@/stores/project-store'

interface SliderFieldProps {
  label: string
  value: number
  min?: number
  max?: number
  step?: number
  suffix?: string
  onChange: (value: number) => void
  /** Fired once when the drag ends. Optional; live `onChange` still fires during drag. */
  onCommit?: (value: number) => void
}

export function SliderField({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  suffix = '',
  onChange,
  onCommit,
}: SliderFieldProps) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="w-[4.5rem] shrink-0 truncate text-[11px] font-medium text-muted-foreground">
        {label}
      </span>
      <Slider.Root
        className="relative flex h-3 min-w-0 flex-1 touch-none items-center"
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([next]) => onChange(next)}
        onValueCommit={([next]) => {
          endElementCoalesce()
          onCommit?.(next)
        }}
      >
        <Slider.Track className="relative h-0.5 grow rounded-full bg-border/80">
          <Slider.Range className="absolute h-full rounded-full bg-foreground/70" />
        </Slider.Track>
        <Slider.Thumb
          className={cn(
            'block h-2.5 w-2.5 rounded-full border border-foreground/20 bg-background shadow-sm',
            'transition hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
          )}
          aria-label={label}
        />
      </Slider.Root>
      <span className="min-w-[2.25rem] shrink-0 rounded bg-muted/40 px-1 py-0.5 text-right text-[10px] font-medium tabular-nums text-foreground">
        {value}
        {suffix}
      </span>
    </div>
  )
}
