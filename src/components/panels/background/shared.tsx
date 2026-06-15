import { useState, type ReactNode } from 'react'
import {
  Blend,
  Grid3x3,
  Image as ImageIcon,
  Palette,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import {
  ALL_BACKGROUND_PRESETS,
  buildBackgroundCanvas,
  type BackgroundPreset,
} from '@/lib/canvas/backgrounds'
import type { BackgroundConfig, BackgroundType } from '@/lib/types'

export const PRESET_PREVIEW_LIMIT = 8

export const TYPE_TABS: Array<{ id: BackgroundType; label: string; icon: LucideIcon }> = [
  { id: 'solid', label: 'Solid', icon: Palette },
  { id: 'linear-gradient', label: 'Gradient', icon: Blend },
  { id: 'mesh', label: 'Mesh', icon: Sparkles },
  { id: 'pattern', label: 'Pattern', icon: Grid3x3 },
  { id: 'image', label: 'Image', icon: ImageIcon },
]

const DEFAULT_OVERLAY_HEX = '#000000'
const DEFAULT_OVERLAY_ALPHA = 0.35

export interface BackgroundSectionProps {
  background: BackgroundConfig
  patch: (next: Partial<BackgroundConfig>) => void
  setBackground: (background: BackgroundConfig) => void
}

export function presetThumb(background: BackgroundConfig): string {
  const canvas = buildBackgroundCanvas(background, 64, 64)
  return canvas.toDataURL()
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const normalized = hex.replace('#', '')
  const full =
    normalized.length === 3
      ? normalized
          .split('')
          .map((char) => char + char)
          .join('')
      : normalized.padEnd(6, '0').slice(0, 6)
  const int = Number.parseInt(full, 16)
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 }
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (value: number) =>
    Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

export function parseOverlay(value: string | undefined): { hex: string; alpha: number } {
  if (!value) return { hex: DEFAULT_OVERLAY_HEX, alpha: DEFAULT_OVERLAY_ALPHA }
  const rgba = value.match(/rgba?\(([^)]+)\)/i)
  if (rgba) {
    const parts = rgba[1].split(',').map((part) => Number.parseFloat(part.trim()))
    const [r = 0, g = 0, b = 0, a = 1] = parts
    return { hex: rgbToHex(r, g, b), alpha: Number.isFinite(a) ? a : 1 }
  }
  if (value.startsWith('#')) return { hex: value, alpha: 1 }
  return { hex: DEFAULT_OVERLAY_HEX, alpha: DEFAULT_OVERLAY_ALPHA }
}

export function composeOverlay(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${Number(alpha.toFixed(2))})`
}

export function PropertyBlock({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="space-y-2.5">
      {title ? (
        <p className="text-[11px] font-medium text-muted-foreground">{title}</p>
      ) : null}
      {children}
    </div>
  )
}

export function getVisiblePresetGroups(background: BackgroundConfig, isGradient: boolean) {
  if (background.type === 'solid' || background.type === 'image') return []
  if (isGradient) {
    return ALL_BACKGROUND_PRESETS.filter(
      (group) => group.title === 'Gradients' || group.title === 'Glass',
    )
  }
  if (background.type === 'mesh') {
    return ALL_BACKGROUND_PRESETS.filter((group) => group.title === 'Mesh')
  }
  if (background.type === 'pattern') {
    return ALL_BACKGROUND_PRESETS.filter((group) => group.title === 'Patterns')
  }
  return []
}

export function PresetGroup({
  title,
  presets,
  onSelect,
}: {
  title: string
  presets: BackgroundPreset[]
  onSelect: (background: BackgroundConfig) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const hasMore = presets.length > PRESET_PREVIEW_LIMIT
  const visible = expanded ? presets : presets.slice(0, PRESET_PREVIEW_LIMIT)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] text-muted-foreground">{title}</p>
        {hasMore && (
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="text-[10px] font-medium text-foreground/70 hover:text-foreground"
          >
            {expanded ? 'Less' : `All ${presets.length}`}
          </button>
        )}
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {visible.map((preset) => (
          <button
            key={preset.id}
            type="button"
            title={preset.label}
            aria-label={preset.label}
            onClick={() => onSelect({ ...preset.background })}
            className="group relative aspect-square overflow-hidden rounded-md border border-border/70 transition hover:border-foreground/25 hover:ring-1 hover:ring-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{
              backgroundImage: `url(${presetThumb(preset.background)})`,
              backgroundSize: 'cover',
            }}
          >
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-1 py-0.5 text-[8px] font-medium text-white opacity-0 transition group-hover:opacity-100">
              {preset.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
