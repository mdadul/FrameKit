import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const fieldClassName =
  'flex h-7 items-center gap-1 rounded-md bg-muted/40 px-1.5 transition hover:bg-muted/55 focus-within:bg-muted/60 focus-within:ring-1 focus-within:ring-ring/30'

const labelClassName =
  'flex w-4 shrink-0 items-center justify-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground'

const inputClassName =
  'min-w-0 flex-1 bg-transparent text-right text-[11px] tabular-nums text-foreground outline-none'

export function NumberField({
  label,
  icon: Icon,
  value,
  suffix,
  onChange,
}: {
  label: string
  icon?: LucideIcon
  value: number
  suffix?: string
  onChange: (value: number) => void
}) {
  return (
    <label className={fieldClassName}>
      <span className={labelClassName} aria-hidden={Boolean(Icon)}>
        {Icon ? <Icon size={11} strokeWidth={2} className="text-muted-foreground" /> : label}
      </span>
      <input
        type="number"
        aria-label={label}
        value={value}
        onChange={(event) => {
          const next = Number(event.target.value)
          if (!Number.isFinite(next)) return
          onChange(next)
        }}
        className={inputClassName}
      />
      {suffix ? (
        <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">{suffix}</span>
      ) : null}
    </label>
  )
}

export function MixedNumberField({
  label,
  icon: Icon,
  value,
  onChange,
}: {
  label: string
  icon?: LucideIcon
  value: number | null
  onChange: (value: number) => void
}) {
  return (
    <label className={fieldClassName}>
      <span className={labelClassName} aria-hidden={Boolean(Icon)}>
        {Icon ? <Icon size={11} strokeWidth={2} className="text-muted-foreground" /> : label}
      </span>
      <input
        type="number"
        aria-label={label}
        value={value === null ? '' : value}
        placeholder={value === null ? 'Mixed' : undefined}
        onChange={(event) => {
          if (event.target.value === '') return
          const next = Number(event.target.value)
          if (!Number.isFinite(next)) return
          onChange(next)
        }}
        className={cn(inputClassName, 'placeholder:text-muted-foreground/70')}
      />
    </label>
  )
}
