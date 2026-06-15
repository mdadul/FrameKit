import { HexColorPicker } from 'react-colorful'
import * as Popover from '@radix-ui/react-popover'
import { endElementCoalesce } from '@/stores/project-store'
import { cn } from '@/lib/utils'

interface ColorPickerFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  /** Fired once when the picker popover closes. Optional; live `onChange` still fires while dragging. */
  onCommit?: (value: string) => void
  compact?: boolean
}

export function ColorPickerField({
  label,
  value,
  onChange,
  onCommit,
  compact = false,
}: ColorPickerFieldProps) {
  return (
    <div className={cn('min-w-0', compact ? 'space-y-1' : 'space-y-1.5')}>
      <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <Popover.Root
        onOpenChange={(open) => {
          if (!open) {
            endElementCoalesce()
            onCommit?.(value)
          }
        }}
      >
        <Popover.Trigger asChild>
          <button
            type="button"
            className={cn(
              'flex w-full min-w-0 items-center rounded-md transition focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/40',
              compact
                ? 'h-7 gap-1.5 bg-muted/40 px-1.5 hover:bg-muted/55'
                : 'h-8 gap-2 bg-muted/40 px-2 hover:bg-muted/55',
            )}
            aria-label={`${label} color picker`}
          >
            <span
              className={cn(
                'shrink-0 rounded-sm border border-border/60',
                compact ? 'h-4 w-4' : 'h-5 w-5',
              )}
              style={{ backgroundColor: value }}
            />
            <span className="min-w-0 flex-1 truncate text-left font-mono text-[10px] uppercase tabular-nums text-foreground">
              {value}
            </span>
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content className="rounded-lg border border-border bg-card p-3 shadow-lg">
            <HexColorPicker color={value} onChange={onChange} />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  )
}
