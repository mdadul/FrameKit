import { useMemo, useRef, useState, type ReactNode } from 'react'
import {
  Blend,
  Grid3x3,
  Image as ImageIcon,
  Palette,
  Sparkles,
  Trash2,
  type LucideIcon,
} from 'lucide-react'
import { useProjectStore } from '@/stores/project-store'
import { createAssetFromFile, createAssetObjectUrl } from '@/lib/assets/image-pipeline'
import { saveAsset } from '@/lib/db'
import {
  ALL_BACKGROUND_PRESETS,
  GRADIENT_PRESETS,
  MESH_PRESETS,
  PATTERN_KINDS,
  buildBackgroundCanvas,
  type BackgroundPreset,
} from '@/lib/canvas/backgrounds'
import { BRAND_PRIMARY } from '@/lib/constants'
import type { BackgroundConfig, BackgroundType, ImageFit } from '@/lib/types'
import { ColorPickerField } from '@/components/ui/ColorPickerField'
import { SliderField } from '@/components/ui/SliderField'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

const PRESET_PREVIEW_LIMIT = 8

const TYPE_TABS: Array<{ id: BackgroundType; label: string; icon: LucideIcon }> = [
  { id: 'solid', label: 'Color', icon: Palette },
  { id: 'linear-gradient', label: 'Gradient', icon: Blend },
  { id: 'mesh', label: 'Mesh', icon: Sparkles },
  { id: 'pattern', label: 'Pattern', icon: Grid3x3 },
  { id: 'image', label: 'Image', icon: ImageIcon },
]

const IMAGE_FITS: ImageFit[] = ['cover', 'contain', 'fill']

const DEFAULT_OVERLAY_HEX = '#000000'
const DEFAULT_OVERLAY_ALPHA = 0.35

function presetThumb(background: BackgroundConfig): string {
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

function parseOverlay(value: string | undefined): { hex: string; alpha: number } {
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

function composeOverlay(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${Number(alpha.toFixed(2))})`
}

function ControlGroup({
  title,
  children,
  className,
}: {
  title?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('space-y-2.5 rounded-xl border border-border/50 bg-muted/25 p-3', className)}>
      {title ? <p className="text-xs font-semibold text-foreground">{title}</p> : null}
      {children}
    </div>
  )
}

function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: Array<{ value: T; label: string }>
  value: T
  onChange: (value: T) => void
  ariaLabel?: string
}) {
  return (
    <div
      className="flex gap-1 rounded-lg bg-muted p-1"
      role="tablist"
      aria-label={ariaLabel}
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
              'flex-1 rounded-md py-1.5 text-xs font-medium transition',
              active
                ? 'bg-card text-foreground shadow-sm ring-1 ring-border/60'
                : 'text-muted-foreground hover:bg-card/70 hover:text-foreground',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

function getVisiblePresetGroups(background: BackgroundConfig, isGradient: boolean) {
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

function PresetGroup({
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
        <p className="text-[11px] font-medium text-muted-foreground">{title}</p>
        {hasMore && (
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="text-[11px] font-medium text-primary hover:underline"
          >
            {expanded ? 'Show less' : `Show all (${presets.length})`}
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
            className="group relative aspect-square overflow-hidden rounded-lg border border-border/80 transition hover:ring-2 hover:ring-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            style={{
              backgroundImage: `url(${presetThumb(preset.background)})`,
              backgroundSize: 'cover',
            }}
          >
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent px-1 py-1 text-[9px] font-medium text-white opacity-0 transition group-hover:opacity-100">
              {preset.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

interface BackgroundControlsProps {
  background: BackgroundConfig
}

export function BackgroundControls({ background }: BackgroundControlsProps) {
  const project = useProjectStore((state) => state.project)
  const registerAssetUrl = useProjectStore((state) => state.registerAssetUrl)
  const assetUrls = useProjectStore((state) => state.assetUrls)
  const setBackground = useProjectStore((state) => state.setActiveScreenBackground)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const patch = (next: Partial<BackgroundConfig>) =>
    setBackground({ ...background, ...next })

  const selectType = (type: BackgroundType) => {
    if (type === background.type) return
    if (type === 'solid') {
      setBackground({ type: 'solid', color: background.color ?? '#ffffff' })
    } else if (type === 'linear-gradient') {
      setBackground({ ...GRADIENT_PRESETS[0].background })
    } else if (type === 'mesh') {
      setBackground({ ...MESH_PRESETS[0].background })
    } else if (type === 'pattern') {
      setBackground({
        type: 'pattern',
        color: background.color ?? '#0f172a',
        patternKind: 'dots',
        patternColor: BRAND_PRIMARY,
        patternScale: 32,
      })
    } else if (type === 'image') {
      setBackground({
        type: 'image',
        color: background.color ?? '#0f172a',
        imageAssetId: background.imageAssetId,
        imageFit: background.imageFit ?? 'cover',
        overlayColor: background.overlayColor,
      })
    }
  }

  const handleUpload = async (file: File) => {
    if (!project) return
    const asset = await createAssetFromFile(file, project.id, 'background')
    await saveAsset(asset)
    registerAssetUrl(asset.id, createAssetObjectUrl(asset))
    patch({ type: 'image', imageAssetId: asset.id, imageFit: background.imageFit ?? 'cover' })
  }

  const isGradient =
    background.type === 'linear-gradient' || background.type === 'radial-gradient'
  const imageUrl =
    background.type === 'image' && background.imageAssetId
      ? assetUrls[background.imageAssetId]
      : undefined

  const visiblePresetGroups = useMemo(
    () => getVisiblePresetGroups(background, isGradient),
    [background, isGradient],
  )

  const activeTypeLabel =
    TYPE_TABS.find(
      (tab) =>
        tab.id === background.type || (tab.id === 'linear-gradient' && isGradient),
    )?.label ?? 'Background'

  const previewUrl = useMemo(() => presetThumb(background), [background])
  const overlay = parseOverlay(background.overlayColor)
  const overlayEnabled = Boolean(background.overlayColor)

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-xl border border-border/60 bg-muted/20">
        <div
          className="h-16 w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${previewUrl})` }}
          role="img"
          aria-label={`${activeTypeLabel} background preview`}
        />
        <p className="border-t border-border/50 px-3 py-1.5 text-center text-[11px] font-medium text-muted-foreground">
          {activeTypeLabel} background
        </p>
      </div>

      <div
        className="flex gap-1 rounded-lg bg-muted p-1"
        role="tablist"
        aria-label="Background type"
      >
        {TYPE_TABS.map((tab) => {
          const Icon = tab.icon
          const active =
            tab.id === background.type ||
            (tab.id === 'linear-gradient' && isGradient)
          return (
            <div key={tab.id} className="group/tip relative min-w-0 flex-1">
              <button
                type="button"
                role="tab"
                aria-selected={active}
                aria-label={tab.label}
                onClick={() => selectType(tab.id)}
                className={cn(
                  'flex h-9 w-full items-center justify-center rounded-md transition',
                  active
                    ? 'bg-card text-foreground shadow-sm ring-1 ring-border/60'
                    : 'text-muted-foreground hover:bg-card/70 hover:text-foreground',
                )}
              >
                <Icon size={16} strokeWidth={active ? 2.25 : 2} />
              </button>
              <span
                role="tooltip"
                className="pointer-events-none absolute top-[calc(100%+6px)] left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[11px] font-medium text-background opacity-0 shadow-md transition-opacity duration-150 group-hover/tip:opacity-100 group-focus-within/tip:opacity-100"
              >
                {tab.label}
              </span>
            </div>
          )
        })}
      </div>

      {background.type === 'solid' && (
        <ControlGroup title="Fill">
          <ColorPickerField
            label="Color"
            value={background.color ?? '#ffffff'}
            onChange={(color) => setBackground({ type: 'solid', color })}
          />
        </ControlGroup>
      )}

      {isGradient && background.gradient && (
        <ControlGroup title="Gradient">
          <SegmentedControl
            ariaLabel="Gradient type"
            value={background.type === 'radial-gradient' ? 'radial-gradient' : 'linear-gradient'}
            options={[
              { value: 'linear-gradient', label: 'Linear' },
              { value: 'radial-gradient', label: 'Radial' },
            ]}
            onChange={(type) => patch({ type })}
          />
          {background.type === 'linear-gradient' && (
            <SliderField
              label="Angle"
              min={0}
              max={360}
              value={background.gradient.angle ?? 180}
              onChange={(angle) =>
                patch({ gradient: { ...background.gradient!, angle } })
              }
            />
          )}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <ColorPickerField
              label="Start"
              value={background.gradient.stops[0]?.color ?? BRAND_PRIMARY}
              onChange={(color) => {
                const stops = [...background.gradient!.stops]
                stops[0] = { offset: 0, color }
                patch({ gradient: { ...background.gradient!, stops } })
              }}
            />
            <ColorPickerField
              label="End"
              value={
                background.gradient.stops[background.gradient.stops.length - 1]?.color ??
                '#0f172a'
              }
              onChange={(color) => {
                const stops = [...background.gradient!.stops]
                stops[stops.length - 1] = { offset: 1, color }
                patch({ gradient: { ...background.gradient!, stops } })
              }}
            />
          </div>
        </ControlGroup>
      )}

      {background.type === 'mesh' && (
        <ControlGroup title="Mesh colors">
          <div className="space-y-2">
            {(background.meshColors ?? []).map((color, index) => (
              <ColorPickerField
                key={index}
                label={`Blob ${index + 1}`}
                value={color}
                onChange={(next) => {
                  const meshColors = [...(background.meshColors ?? [])]
                  meshColors[index] = next
                  patch({ meshColors })
                }}
              />
            ))}
          </div>
        </ControlGroup>
      )}

      {background.type === 'pattern' && (
        <ControlGroup title="Pattern">
          <div className="space-y-2">
            <p className="text-[11px] text-muted-foreground">Texture</p>
            <div className="flex flex-wrap gap-1">
              {PATTERN_KINDS.map((kind) => (
                <button
                  key={kind}
                  type="button"
                  onClick={() => patch({ patternKind: kind })}
                  className={cn(
                    'rounded-md border px-2 py-1 text-[10px] font-medium capitalize transition',
                    background.patternKind === kind
                      ? 'border-primary bg-primary/10 text-foreground shadow-sm ring-1 ring-primary/30'
                      : 'border-border/60 text-muted-foreground hover:border-primary/40 hover:text-foreground',
                  )}
                >
                  {kind}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <ColorPickerField
              label="Base"
              value={background.color ?? '#0f172a'}
              onChange={(color) => patch({ color })}
            />
            <ColorPickerField
              label="Pattern"
              value={background.patternColor ?? BRAND_PRIMARY}
              onChange={(patternColor) => patch({ patternColor })}
            />
          </div>
          <SliderField
            label="Scale"
            min={8}
            max={120}
            value={background.patternScale ?? 32}
            onChange={(patternScale) => patch({ patternScale })}
          />
        </ControlGroup>
      )}

      {background.type === 'image' && (
        <ControlGroup title="Image">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) void handleUpload(file)
              event.target.value = ''
            }}
          />
          {imageUrl ? (
            <div
              className="h-28 w-full overflow-hidden rounded-lg border border-border/60 bg-cover bg-center"
              style={{ backgroundImage: `url(${imageUrl})` }}
            />
          ) : (
            <div className="flex h-28 w-full items-center justify-center rounded-lg border border-dashed border-border/80 bg-muted/20 text-xs text-muted-foreground">
              No image selected
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            <Button size="sm" variant="secondary" onClick={() => fileInputRef.current?.click()}>
              <ImageIcon size={14} /> Upload
            </Button>
            {background.imageAssetId && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => patch({ imageAssetId: undefined })}
              >
                <Trash2 size={14} /> Remove
              </Button>
            )}
          </div>
          <div className="space-y-2">
            <p className="text-[11px] text-muted-foreground">Fit</p>
            <SegmentedControl
              ariaLabel="Image fit"
              value={background.imageFit ?? 'cover'}
              options={IMAGE_FITS.map((fit) => ({
                value: fit,
                label: fit.charAt(0).toUpperCase() + fit.slice(1),
              }))}
              onChange={(imageFit) => patch({ imageFit })}
            />
          </div>

          <div className="space-y-2 border-t border-border/60 pt-3">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={overlayEnabled}
                onChange={(event) =>
                  patch({
                    overlayColor: event.target.checked
                      ? composeOverlay(overlay.hex, overlay.alpha)
                      : undefined,
                  })
                }
              />
              Color overlay
            </label>
            {overlayEnabled && (
              <>
                <ColorPickerField
                  label="Overlay color"
                  value={overlay.hex}
                  onChange={(hex) => patch({ overlayColor: composeOverlay(hex, overlay.alpha) })}
                />
                <SliderField
                  label="Overlay opacity"
                  min={0}
                  max={100}
                  value={Math.round(overlay.alpha * 100)}
                  onChange={(value) =>
                    patch({ overlayColor: composeOverlay(overlay.hex, value / 100) })
                  }
                />
              </>
            )}
          </div>
        </ControlGroup>
      )}

      {visiblePresetGroups.length > 0 && (
        <ControlGroup title="Presets">
          <div className="space-y-3">
            {visiblePresetGroups.map((group) => (
              <PresetGroup
                key={group.title}
                title={group.title}
                presets={group.presets}
                onSelect={setBackground}
              />
            ))}
          </div>
        </ControlGroup>
      )}
    </div>
  )
}
