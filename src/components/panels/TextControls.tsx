import { useMemo, useState } from 'react'
import * as Popover from '@radix-ui/react-popover'
import {
  AlignCenter,
  AlignEndVertical,
  AlignJustify,
  AlignLeft,
  AlignRight,
  AlignStartVertical,
  AlignCenterVertical,
  Check,
  ChevronDown,
  Italic,
  Search,
  Strikethrough,
  Underline,
  type LucideIcon,
} from 'lucide-react'
import { GOOGLE_FONTS } from '@/lib/constants'
import type { TextElement } from '@/lib/types'
import { SliderField } from '@/components/ui/SliderField'
import { ColorPickerField } from '@/components/ui/ColorPickerField'
import { FieldGroup } from '@/components/ui/FieldGroup'
import { NumberField } from '@/components/ui/NumberField'
import { cn } from '@/lib/utils'

type TextAlign = TextElement['textAlign']
type VerticalAlign = TextElement['verticalAlign']

const ALIGN_OPTIONS: Array<{ value: TextAlign; icon: LucideIcon; label: string }> = [
  { value: 'left', icon: AlignLeft, label: 'Align left' },
  { value: 'center', icon: AlignCenter, label: 'Align center' },
  { value: 'right', icon: AlignRight, label: 'Align right' },
  { value: 'justify', icon: AlignJustify, label: 'Justify' },
]

const VERTICAL_ALIGN_OPTIONS: Array<{
  value: VerticalAlign
  icon: LucideIcon
  label: string
}> = [
  { value: 'top', icon: AlignStartVertical, label: 'Align top' },
  { value: 'middle', icon: AlignCenterVertical, label: 'Align middle' },
  { value: 'bottom', icon: AlignEndVertical, label: 'Align bottom' },
]

const DEFAULT_STROKE_COLOR = '#000000'

const MUTED_CONTROL_CLASSNAME =
  'h-7 w-full min-w-0 rounded-md bg-muted/40 px-2 text-[11px] text-foreground outline-none transition hover:bg-muted/55 focus:bg-muted/60 focus:ring-1 focus:ring-ring/30'

const SEGMENT_ACTIVE = 'bg-background text-foreground shadow-sm ring-1 ring-border/50'
const SEGMENT_INACTIVE = 'text-muted-foreground hover:bg-background/60 hover:text-foreground'

function parseDecorations(value: TextElement['textDecoration'] | undefined): string[] {
  return (value ?? 'none').split(/\s+/).filter((token) => token && token !== 'none')
}

function joinDecorations(tokens: string[]): TextElement['textDecoration'] {
  return (tokens.length > 0 ? tokens.join(' ') : 'none') as TextElement['textDecoration']
}

const WEIGHT_OPTIONS: Array<{ value: number; label: string }> = [
  { value: 300, label: 'Light' },
  { value: 400, label: 'Regular' },
  { value: 500, label: 'Medium' },
  { value: 600, label: 'Semibold' },
  { value: 700, label: 'Bold' },
  { value: 800, label: 'Extrabold' },
  { value: 900, label: 'Black' },
]

interface TextControlsProps {
  element: TextElement
  onChange: (patch: Partial<TextElement>) => void
}

function IconSegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: Array<{ value: T; icon: LucideIcon; label: string }>
  value: T
  onChange: (value: T) => void
}) {
  return (
    <div
      className="grid gap-0.5 rounded-md bg-muted/50 p-0.5"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((option) => {
        const Icon = option.icon
        const active = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            aria-label={option.label}
            title={option.label}
            onClick={() => onChange(option.value)}
            className={cn(
              'flex h-6 items-center justify-center rounded-sm transition',
              active ? SEGMENT_ACTIVE : SEGMENT_INACTIVE,
            )}
          >
            <Icon size={13} strokeWidth={2} />
          </button>
        )
      })}
    </div>
  )
}

function FontPicker({
  value,
  onChange,
}: {
  value: string
  onChange: (font: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const filtered = useMemo(
    () => GOOGLE_FONTS.filter((font) => font.toLowerCase().includes(query.toLowerCase())),
    [query],
  )

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className={cn(
            MUTED_CONTROL_CLASSNAME,
            'flex items-center justify-between gap-1.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/30',
          )}
        >
          <span style={{ fontFamily: value }} className="min-w-0 truncate text-left">
            {value}
          </span>
          <ChevronDown size={12} className="shrink-0 text-muted-foreground" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={4}
          className="z-50 w-[var(--radix-popover-trigger-width)] rounded-lg border border-border bg-card p-2 shadow-lg"
        >
          <div className="mb-2 flex items-center gap-2 rounded-md bg-muted/50 px-2">
            <Search size={13} className="shrink-0 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search fonts"
              className="h-7 w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="max-h-60 overflow-auto">
            {filtered.length === 0 && (
              <div className="px-2 py-3 text-center text-[11px] text-muted-foreground">
                No fonts found
              </div>
            )}
            {filtered.map((font) => (
              <button
                key={font}
                type="button"
                onClick={() => {
                  onChange(font)
                  setOpen(false)
                  setQuery('')
                }}
                className={cn(
                  'flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-xs transition hover:bg-muted',
                  font === value && 'bg-muted',
                )}
                style={{ fontFamily: font }}
              >
                <span className="truncate">{font}</span>
                {font === value && <Check size={13} className="shrink-0 text-primary" />}
              </button>
            ))}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

export function TextControls({ element, onChange }: TextControlsProps) {
  const decorations = parseDecorations(element.textDecoration)
  const hasUnderline = decorations.includes('underline')
  const hasStrike = decorations.includes('line-through')

  const toggleDecoration = (token: 'underline' | 'line-through') => {
    const next = decorations.includes(token)
      ? decorations.filter((current) => current !== token)
      : [...decorations, token]
    onChange({ textDecoration: joinDecorations(next) })
  }

  return (
    <div className="min-w-0 space-y-2">
      <FieldGroup label="Content">
        <textarea
          className="min-h-14 w-full resize-y rounded-md bg-muted/40 px-2 py-1.5 text-[11px] text-foreground outline-none transition placeholder:text-muted-foreground hover:bg-muted/55 focus:bg-muted/60 focus:ring-1 focus:ring-ring/30"
          value={element.text}
          onChange={(event) => onChange({ text: event.target.value })}
        />
      </FieldGroup>

      <div className="grid min-w-0 grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-1.5">
        <FieldGroup label="Font" className="min-w-0">
          <FontPicker value={element.fontFamily} onChange={(fontFamily) => onChange({ fontFamily })} />
        </FieldGroup>
        <FieldGroup label="Weight" className="min-w-0">
          <select
            className={MUTED_CONTROL_CLASSNAME}
            value={element.fontWeight}
            onChange={(event) => onChange({ fontWeight: Number(event.target.value) })}
          >
            {WEIGHT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FieldGroup>
      </div>

      <div className="grid min-w-0 grid-cols-3 gap-1.5">
        <NumberField
          label="Size"
          value={element.fontSize}
          onChange={(fontSize) => onChange({ fontSize })}
        />
        <NumberField
          label="Line"
          value={Math.round(element.lineHeight * 100)}
          suffix="%"
          onChange={(value) => onChange({ lineHeight: value / 100 })}
        />
        <NumberField
          label="Track"
          value={element.letterSpacing}
          onChange={(letterSpacing) => onChange({ letterSpacing })}
        />
      </div>

      <div className="grid min-w-0 grid-cols-2 gap-1.5">
        <FieldGroup label="Style">
          <div className="grid grid-cols-3 gap-0.5 rounded-md bg-muted/50 p-0.5">
            <button
              type="button"
              aria-label="Italic"
              aria-pressed={element.fontStyle === 'italic'}
              title="Italic"
              onClick={() =>
                onChange({ fontStyle: element.fontStyle === 'italic' ? 'normal' : 'italic' })
              }
              className={cn(
                'flex h-6 items-center justify-center rounded-sm transition',
                element.fontStyle === 'italic' ? SEGMENT_ACTIVE : SEGMENT_INACTIVE,
              )}
            >
              <Italic size={13} strokeWidth={2} />
            </button>
            <button
              type="button"
              aria-label="Underline"
              aria-pressed={hasUnderline}
              title="Underline"
              onClick={() => toggleDecoration('underline')}
              className={cn(
                'flex h-6 items-center justify-center rounded-sm transition',
                hasUnderline ? SEGMENT_ACTIVE : SEGMENT_INACTIVE,
              )}
            >
              <Underline size={13} strokeWidth={2} />
            </button>
            <button
              type="button"
              aria-label="Strikethrough"
              aria-pressed={hasStrike}
              title="Strikethrough"
              onClick={() => toggleDecoration('line-through')}
              className={cn(
                'flex h-6 items-center justify-center rounded-sm transition',
                hasStrike ? SEGMENT_ACTIVE : SEGMENT_INACTIVE,
              )}
            >
              <Strikethrough size={13} strokeWidth={2} />
            </button>
          </div>
        </FieldGroup>
        <FieldGroup label="Align">
          <IconSegmentedControl
            options={ALIGN_OPTIONS}
            value={element.textAlign}
            onChange={(textAlign) => onChange({ textAlign })}
          />
        </FieldGroup>
      </div>

      <FieldGroup label="Vertical">
        <IconSegmentedControl
          options={VERTICAL_ALIGN_OPTIONS}
          value={element.verticalAlign ?? 'top'}
          onChange={(verticalAlign) => onChange({ verticalAlign })}
        />
      </FieldGroup>

      <div className="grid min-w-0 grid-cols-2 gap-1.5">
        <ColorPickerField
          compact
          label="Fill"
          value={element.fill}
          onChange={(fill) => onChange({ fill })}
        />
        <ColorPickerField
          compact
          label="Stroke"
          value={element.stroke ?? DEFAULT_STROKE_COLOR}
          onChange={(stroke) => onChange({ stroke })}
        />
      </div>

      <SliderField
        label="Stroke W"
        value={element.strokeWidth ?? 0}
        min={0}
        max={20}
        onChange={(strokeWidth) => onChange({ strokeWidth })}
      />

      <SliderField
        label="Padding"
        value={element.padding ?? 0}
        min={0}
        max={120}
        onChange={(padding) => onChange({ padding })}
      />
    </div>
  )
}
