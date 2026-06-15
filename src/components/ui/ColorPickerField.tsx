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
  variant?: 'default' | 'property'
}

export function ColorPickerField({
  label,
  value,
  onChange,
  onCommit,
  compact = false,
  variant = 'default',
}: ColorPickerFieldProps) {
  const isProperty = variant === 'property'

  return (
    <div className={cn('min-w-0', compact || isProperty ? 'space-y-1' : 'space-y-1.5')}>
      <span
        className={cn(
          isProperty
            ? 'text-[11px] font-medium text-muted-foreground'
            : 'text-[10px] font-medium uppercase tracking-wide text-muted-foreground',
        )}
      >
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
              isProperty
                ? 'h-8 gap-2 border border-input bg-card px-2 hover:bg-muted/30'
                : compact
                  ? 'h-7 gap-1.5 bg-muted/40 px-1.5 hover:bg-muted/55'
                  : 'h-8 gap-2 bg-muted/40 px-2 hover:bg-muted/55',
            )}
            aria-label={`${label} color picker`}
          >
            <span
              className={cn(
                'shrink-0 rounded-[3px] border border-border/70 shadow-sm',
                compact || isProperty ? 'h-4 w-4' : 'h-5 w-5',
              )}
              style={{ backgroundColor: value }}
            />
            <span
              className={cn(
                'min-w-0 flex-1 truncate text-left font-mono tabular-nums text-foreground',
                isProperty ? 'text-[11px] uppercase' : 'text-[10px] uppercase',
              )}
            >
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
