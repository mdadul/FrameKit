import type { ReactNode } from 'react'
import {
  Box,
  FlipHorizontal,
  FlipVertical,
  Image as ImageIcon,
  ImagePlus,
  Layers,
  Move,
  Palette,
  Smartphone,
  Sparkles,
  Sun,
  Type,
  X,
} from 'lucide-react'
import { DEVICES, getDevice } from '@/lib/assets/devices'
import { createAssetFromFile, createAssetObjectUrl } from '@/lib/assets/image-pipeline'
import { saveAsset } from '@/lib/db'
import { BRAND_PRIMARY } from '@/lib/constants'
import { useProjectStore } from '@/stores/project-store'
import { useEditorStore } from '@/stores/editor-store'
import { PanelSection } from '@/components/ui/PanelSection'
import { BackgroundControls } from '@/components/panels/BackgroundControls'
import { TextControls } from '@/components/panels/TextControls'
import { Input } from '@/components/ui/Input'
import { FieldGroup } from '@/components/ui/FieldGroup'
import { MixedNumberField, NumberField } from '@/components/ui/NumberField'
import { SliderField } from '@/components/ui/SliderField'
import { ColorPickerField } from '@/components/ui/ColorPickerField'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import type {
  DeviceElement,
  Element,
  FillConfig,
  GradientFill,
  ImageElement,
  ImageFit,
  ShapeElement,
  TextElement,
} from '@/lib/types'

const TILT_PRESETS: Array<{ label: string; tiltX: number; tiltY: number }> = [
  { label: 'Flat', tiltX: 0, tiltY: 0 },
  { label: 'Left', tiltX: 0, tiltY: 22 },
  { label: 'Right', tiltX: 0, tiltY: -22 },
  { label: 'Back', tiltX: 16, tiltY: 0 },
  { label: 'Hero L', tiltX: 10, tiltY: 18 },
  { label: 'Hero R', tiltX: 10, tiltY: -18 },
]

const ELEMENT_LABELS: Record<Element['type'], { label: string; icon: typeof Type }> = {
  text: { label: 'Text', icon: Type },
  shape: { label: 'Shape', icon: Palette },
  image: { label: 'Image', icon: ImageIcon },
  device: { label: 'Device', icon: Smartphone },
  group: { label: 'Group', icon: Layers },
}

function usePropertiesContext() {
  const screen = useProjectStore((state) => state.getActiveScreen())
  const selectedElementIds = useEditorStore((state) => state.selectedElementIds)

  if (!screen) {
    return { subtitle: '', contextLabel: null as string | null }
  }

  const selectedElements = screen.elements.filter((element) =>
    selectedElementIds.includes(element.id),
  )

  if (selectedElements.length === 0) {
    return { subtitle: screen.name, contextLabel: 'Screen' }
  }

  if (selectedElements.length > 1) {
    return {
      subtitle: `${selectedElements.length} layers`,
      contextLabel: 'Selection',
    }
  }

  const meta = ELEMENT_LABELS[selectedElements[0].type]
  return {
    subtitle: selectedElements[0].name || meta.label,
    contextLabel: meta.label,
  }
}

export function PropertiesPanelHeader({ onClose }: { onClose: () => void }) {
  const { subtitle, contextLabel } = usePropertiesContext()

  return (
    <div className="flex shrink-0 items-center justify-between border-b border-border/60 px-3 py-2">
      <div className="min-w-0">
        <p className="text-[13px] font-semibold leading-tight text-foreground">Design</p>
        {subtitle ? (
          <div className="mt-0.5 flex min-w-0 items-center gap-1.5">
            {contextLabel ? (
              <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                {contextLabel}
              </span>
            ) : null}
            <p className="truncate text-[11px] leading-tight text-muted-foreground">{subtitle}</p>
          </div>
        ) : null}
      </div>
      <button
        type="button"
        aria-label="Collapse properties"
        title="Collapse properties"
        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={onClose}
      >
        <X size={14} />
      </button>
    </div>
  )
}

function sharedNumber(values: number[]): number | null {
  if (values.length === 0) return null
  const [first] = values
  return values.every((value) => value === first) ? first : null
}

function Hint({ children }: { children: ReactNode }) {
  return <p className="text-xs leading-relaxed text-muted-foreground">{children}</p>
}

function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: Array<{ value: T; label: string }>
  onChange: (value: T) => void
}) {
  return (
    <div className="space-y-1.5">
      <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
      <div
        className="inline-flex w-full gap-0.5 rounded-md border border-border/60 bg-muted/40 p-0.5"
        style={{ display: 'grid', gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
      >
        {options.map((option) => {
          const active = option.value === value
          return (
            <button
              key={option.value}
              type="button"
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
    </div>
  )
}

const OBJECT_FIT_OPTIONS: Array<{ value: ImageFit; label: string }> = [
  { value: 'cover', label: 'Cover' },
  { value: 'contain', label: 'Contain' },
  { value: 'fill', label: 'Fill' },
]

const DEFAULT_GRADIENT: GradientFill = {
  type: 'linear',
  angle: 90,
  stops: [
    { offset: 0, color: BRAND_PRIMARY },
    { offset: 1, color: '#0f172a' },
  ],
}

export function PropertiesPanel() {
  const screen = useProjectStore((state) => state.getActiveScreen())
  const project = useProjectStore((state) => state.project)
  const updateElement = useProjectStore((state) => state.updateElement)
  const registerAssetUrl = useProjectStore((state) => state.registerAssetUrl)
  const selectedElementIds = useEditorStore((state) => state.selectedElementIds)

  const assignDeviceScreenshot = async (elementId: string, file: File) => {
    if (!project) return
    const asset = await createAssetFromFile(file, project.id, 'screenshot')
    await saveAsset(asset)
    registerAssetUrl(asset.id, createAssetObjectUrl(asset))
    updateElement(elementId, { screenshotAssetId: asset.id })
  }

  if (!screen) return null

  const selectedElements = screen.elements.filter((element) =>
    selectedElementIds.includes(element.id),
  )
  const element = selectedElements.length === 1 ? selectedElements[0] : null

  const updateSelected = (patch: Partial<Element>) => {
    for (const id of selectedElementIds) {
      updateElement(id, patch)
    }
  }

  if (!element && selectedElements.length > 1) {
    const sharedOpacity = sharedNumber(selectedElements.map((item) => item.opacity))
    const sharedX = sharedNumber(selectedElements.map((item) => Math.round(item.x)))
    const sharedY = sharedNumber(selectedElements.map((item) => Math.round(item.y)))
    const sharedWidth = sharedNumber(selectedElements.map((item) => Math.round(item.width)))
    const sharedHeight = sharedNumber(selectedElements.map((item) => Math.round(item.height)))
    return (
      <div className="space-y-0 overflow-auto">
        <PanelSection title="Transform" icon={Move}>
          <div className="grid grid-cols-2 gap-1.5">
            <MixedNumberField label="X" value={sharedX} onChange={(x) => updateSelected({ x })} />
            <MixedNumberField label="Y" value={sharedY} onChange={(y) => updateSelected({ y })} />
            <MixedNumberField
              label="W"
              value={sharedWidth}
              onChange={(width) => updateSelected({ width })}
            />
            <MixedNumberField
              label="H"
              value={sharedHeight}
              onChange={(height) => updateSelected({ height })}
            />
          </div>
          <SliderField
            label="Opacity"
            value={Math.round((sharedOpacity ?? 1) * 100)}
            min={0}
            max={100}
            suffix="%"
            onChange={(value) => updateSelected({ opacity: value / 100 })}
          />
          <Hint>
            Changes apply to all {selectedElements.length} selected elements. Alignment and
            distribution live in the toolbar.
          </Hint>
        </PanelSection>

        <PanelSection title="Background" icon={Palette} defaultOpen={false}>
          <BackgroundControls background={screen.background} />
        </PanelSection>
      </div>
    )
  }

  if (!element) {
    return (
      <div className="flex min-h-full flex-col">
        <PanelSection title="Background" icon={Palette}>
          <BackgroundControls background={screen.background} />
        </PanelSection>
        <div className="mt-auto border-t border-border/50 px-3 py-3">
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Select a layer on the canvas to edit position, typography, and effects.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-0 overflow-auto">
      <PanelSection title="Transform" icon={Move}>
        <FieldGroup label="Name">
          <Input
            variant="muted"
            aria-label="Element name"
            value={element.name}
            onChange={(event) => updateElement(element.id, { name: event.target.value })}
          />
        </FieldGroup>
        <div className="grid grid-cols-2 gap-1.5">
          <NumberField
            label="X"
            value={Math.round(element.x)}
            onChange={(x) => updateElement(element.id, { x })}
          />
          <NumberField
            label="Y"
            value={Math.round(element.y)}
            onChange={(y) => updateElement(element.id, { y })}
          />
          <NumberField
            label="W"
            value={Math.round(element.width)}
            onChange={(width) => updateElement(element.id, { width })}
          />
          <NumberField
            label="H"
            value={Math.round(element.height)}
            onChange={(height) => updateElement(element.id, { height })}
          />
        </div>
        <SliderField
          label="Rotation"
          value={element.rotation}
          min={-180}
          max={180}
          suffix="°"
          onChange={(rotation) => updateElement(element.id, { rotation })}
        />
        <SliderField
          label="Opacity"
          value={Math.round(element.opacity * 100)}
          min={0}
          max={100}
          suffix="%"
          onChange={(value) => updateElement(element.id, { opacity: value / 100 })}
        />
      </PanelSection>

      {element.type === 'text' && (
        <PanelSection title="Typography" icon={Type}>
          <TextControls
            element={element as TextElement}
            onChange={(patch) => updateElement(element.id, patch)}
          />
        </PanelSection>
      )}

      {element.type === 'shape' &&
        (() => {
          const shape = element as ShapeElement
          const isGradient = shape.fill.type === 'gradient'
          const gradient = shape.fill.gradient ?? DEFAULT_GRADIENT
          const setFill = (fill: FillConfig) => updateElement(shape.id, { fill })
          const patchGradient = (next: Partial<GradientFill>) =>
            setFill({ type: 'gradient', gradient: { ...gradient, ...next } })
          const setStop = (index: number, color: string) => {
            const stops = gradient.stops.map((stop) => ({ ...stop }))
            stops[index] = { offset: index === 0 ? 0 : 1, color }
            patchGradient({ stops })
          }
          const lastStop = gradient.stops[gradient.stops.length - 1]
          return (
            <PanelSection title="Appearance" icon={Palette}>
              <SegmentedControl
                label="Fill type"
                value={isGradient ? 'gradient' : 'solid'}
                options={[
                  { value: 'solid', label: 'Solid' },
                  { value: 'gradient', label: 'Gradient' },
                ]}
                onChange={(type) =>
                  type === 'gradient'
                    ? setFill({
                        type: 'gradient',
                        gradient: shape.fill.gradient ?? { ...DEFAULT_GRADIENT },
                      })
                    : setFill({ type: 'solid', color: shape.fill.color ?? BRAND_PRIMARY })
                }
              />

              {isGradient ? (
                <>
                  <SegmentedControl
                    label="Gradient style"
                    value={gradient.type}
                    options={[
                      { value: 'linear', label: 'Linear' },
                      { value: 'radial', label: 'Radial' },
                    ]}
                    onChange={(type) => patchGradient({ type })}
                  />
                  {gradient.type === 'linear' && (
                    <SliderField
                      label="Angle"
                      value={gradient.angle ?? 90}
                      min={0}
                      max={360}
                      onChange={(angle) => patchGradient({ angle })}
                    />
                  )}
                  <ColorPickerField
                    label="Start color"
                    value={gradient.stops[0]?.color ?? BRAND_PRIMARY}
                    onChange={(color) => setStop(0, color)}
                  />
                  <ColorPickerField
                    label="End color"
                    value={lastStop?.color ?? '#0f172a'}
                    onChange={(color) => setStop(gradient.stops.length - 1, color)}
                  />
                </>
              ) : (
                <ColorPickerField
                  label="Fill"
                  value={shape.fill.color ?? BRAND_PRIMARY}
                  onChange={(color) => setFill({ type: 'solid', color })}
                />
              )}

              <ColorPickerField
                label="Stroke"
                value={shape.stroke}
                onChange={(stroke) => updateElement(shape.id, { stroke })}
              />
              <SliderField
                label="Stroke width"
                value={shape.strokeWidth}
                min={0}
                max={20}
                onChange={(strokeWidth) => updateElement(shape.id, { strokeWidth })}
              />
              <SliderField
                label="Corner radius"
                value={shape.cornerRadius}
                min={0}
                max={100}
                onChange={(cornerRadius) => updateElement(shape.id, { cornerRadius })}
              />
            </PanelSection>
          )
        })()}

      {element.type === 'image' &&
        (() => {
          const image = element as ImageElement
          return (
            <>
              <PanelSection title="Image" icon={ImageIcon}>
                <SegmentedControl
                  label="Object fit"
                  value={image.objectFit ?? 'cover'}
                  options={OBJECT_FIT_OPTIONS}
                  onChange={(objectFit) => updateElement(image.id, { objectFit })}
                />
                <div className="space-y-1.5">
                  <span className="text-xs text-muted-foreground">Flip</span>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      variant={image.flipX ? 'default' : 'secondary'}
                      onClick={() => updateElement(image.id, { flipX: !image.flipX })}
                    >
                      <FlipHorizontal size={14} /> Horizontal
                    </Button>
                    <Button
                      size="sm"
                      variant={image.flipY ? 'default' : 'secondary'}
                      onClick={() => updateElement(image.id, { flipY: !image.flipY })}
                    >
                      <FlipVertical size={14} /> Vertical
                    </Button>
                  </div>
                </div>
                <SliderField
                  label="Corner radius"
                  value={image.cornerRadius}
                  min={0}
                  max={100}
                  onChange={(cornerRadius) => updateElement(image.id, { cornerRadius })}
                />
                <SliderField
                  label="Border width"
                  value={image.borderWidth}
                  min={0}
                  max={20}
                  onChange={(borderWidth) => updateElement(image.id, { borderWidth })}
                />
                <ColorPickerField
                  label="Border color"
                  value={image.borderColor}
                  onChange={(borderColor) => updateElement(image.id, { borderColor })}
                />
              </PanelSection>

              <PanelSection title="Adjustments" icon={Sun}>
                <SliderField
                  label="Brightness"
                  value={image.brightness ?? 0}
                  min={-100}
                  max={100}
                  onChange={(brightness) => updateElement(image.id, { brightness })}
                />
                <SliderField
                  label="Contrast"
                  value={image.contrast ?? 0}
                  min={-100}
                  max={100}
                  onChange={(contrast) => updateElement(image.id, { contrast })}
                />
                <SliderField
                  label="Saturation"
                  value={image.saturation ?? 0}
                  min={-100}
                  max={100}
                  onChange={(saturation) => updateElement(image.id, { saturation })}
                />
                <SliderField
                  label="Blur"
                  value={image.blur ?? 0}
                  min={0}
                  max={40}
                  onChange={(blur) => updateElement(image.id, { blur })}
                />
                {(image.brightness || image.contrast || image.saturation || image.blur) && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full"
                    onClick={() =>
                      updateElement(image.id, {
                        brightness: 0,
                        contrast: 0,
                        saturation: 0,
                        blur: 0,
                      })
                    }
                  >
                    Reset adjustments
                  </Button>
                )}
              </PanelSection>

              <PanelSection title="Crop" icon={Box}>
                <Hint>Fit the image to its frame, or fine-tune the visible region (0–100%).</Hint>
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-full"
                  onClick={() =>
                    updateElement(image.id, {
                      cropX: 0,
                      cropY: 0,
                      cropWidth: 1,
                      cropHeight: 1,
                    })
                  }
                >
                  Fit frame
                </Button>
                <SliderField
                  label="Crop X"
                  value={Math.round((image.cropX ?? 0) * 100)}
                  min={0}
                  max={100}
                  onChange={(value) => updateElement(image.id, { cropX: value / 100 })}
                />
                <SliderField
                  label="Crop Y"
                  value={Math.round((image.cropY ?? 0) * 100)}
                  min={0}
                  max={100}
                  onChange={(value) => updateElement(image.id, { cropY: value / 100 })}
                />
                <SliderField
                  label="Crop width"
                  value={Math.round((image.cropWidth ?? 1) * 100)}
                  min={1}
                  max={100}
                  onChange={(value) => updateElement(image.id, { cropWidth: value / 100 })}
                />
                <SliderField
                  label="Crop height"
                  value={Math.round((image.cropHeight ?? 1) * 100)}
                  min={1}
                  max={100}
                  onChange={(value) => updateElement(image.id, { cropHeight: value / 100 })}
                />
              </PanelSection>
            </>
          )
        })()}

      {element.type === 'device' && (
        <>
          <PanelSection title="Screenshot" icon={ImagePlus}>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90">
              <ImagePlus size={15} />
              {(element as DeviceElement).screenshotAssetId
                ? 'Replace screenshot'
                : 'Fill screenshot'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file) void assignDeviceScreenshot(element.id, file)
                  event.target.value = ''
                }}
              />
            </label>
            {(element as DeviceElement).screenshotAssetId && (
              <Button
                size="sm"
                variant="ghost"
                className="w-full"
                onClick={() => updateElement(element.id, { screenshotAssetId: undefined })}
              >
                Remove screenshot
              </Button>
            )}
            <Hint>
              Upload an app screenshot to fill the device screen, or use the Assets panel and
              click &ldquo;Use&rdquo; on a saved asset.
            </Hint>
          </PanelSection>

          <PanelSection title="Device frame" icon={Smartphone}>
            <div className="space-y-1.5">
              <span className="text-xs text-muted-foreground">Model</span>
              <select
                className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm"
                value={(element as DeviceElement).deviceId}
                onChange={(event) => {
                  const deviceId = event.target.value
                  const device = getDevice(deviceId)
                  updateElement(element.id, {
                    deviceId,
                    colorVariant: device?.colorVariants[0]?.id,
                  })
                }}
              >
                {DEVICES.map((device) => (
                  <option key={device.id} value={device.id}>
                    {device.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <span className="text-xs text-muted-foreground">Color variant</span>
              <select
                className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm"
                value={(element as DeviceElement).colorVariant ?? ''}
                onChange={(event) =>
                  updateElement(element.id, { colorVariant: event.target.value })
                }
              >
                {(getDevice((element as DeviceElement).deviceId)?.colorVariants ?? []).map(
                  (variant) => (
                    <option key={variant.id} value={variant.id}>
                      {variant.name}
                    </option>
                  ),
                )}
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={(element as DeviceElement).showFrame !== false}
                onChange={(event) =>
                  updateElement(element.id, { showFrame: event.target.checked })
                }
              />
              Show frame
            </label>
            <div className="space-y-1.5">
              <span className="text-xs text-muted-foreground">Screenshot fit</span>
              <select
                className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm"
                value={(element as DeviceElement).screenshotFit ?? 'cover'}
                onChange={(event) =>
                  updateElement(element.id, {
                    screenshotFit: event.target.value as DeviceElement['screenshotFit'],
                  })
                }
              >
                <option value="cover">Cover</option>
                <option value="contain">Contain</option>
              </select>
            </div>
          </PanelSection>

          <PanelSection title="3D tilt" icon={Box}>
            <div className="space-y-1.5">
              <span className="text-xs text-muted-foreground">Presets</span>
              <div className="grid grid-cols-3 gap-2">
                {TILT_PRESETS.map((preset) => (
                  <Button
                    key={preset.label}
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      updateElement(element.id, {
                        tiltX: preset.tiltX,
                        tiltY: preset.tiltY,
                      })
                    }
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>
            <SliderField
              label="Tilt X (pitch)"
              value={(element as DeviceElement).tiltX ?? 0}
              min={-45}
              max={45}
              onChange={(tiltX) => updateElement(element.id, { tiltX })}
            />
            <SliderField
              label="Tilt Y (yaw)"
              value={(element as DeviceElement).tiltY ?? 0}
              min={-45}
              max={45}
              onChange={(tiltY) => updateElement(element.id, { tiltY })}
            />
            <SliderField
              label="Perspective"
              value={(element as DeviceElement).perspective ?? 50}
              min={10}
              max={100}
              onChange={(perspective) => updateElement(element.id, { perspective })}
            />
            <SliderField
              label="Rotation (roll)"
              value={element.rotation}
              min={-180}
              max={180}
              onChange={(rotation) => updateElement(element.id, { rotation })}
            />
          </PanelSection>

          <PanelSection title="Shadow" icon={Sun}>
            <SliderField
              label="Shadow intensity"
              value={Math.round((element as DeviceElement).shadowIntensity * 100)}
              min={0}
              max={100}
              onChange={(value) => updateElement(element.id, { shadowIntensity: value / 100 })}
            />
            <SliderField
              label="Shadow spread"
              value={(element as DeviceElement).shadowSpread}
              min={0}
              max={120}
              onChange={(shadowSpread) => updateElement(element.id, { shadowSpread })}
            />
          </PanelSection>
        </>
      )}

      <PanelSection title="Effects" icon={Sparkles} defaultOpen={false}>
        <label className="flex items-center gap-2 text-[11px] text-foreground">
          <input
            type="checkbox"
            className="rounded border-border"
            checked={element.shadow?.enabled ?? false}
            onChange={(event) =>
              updateElement(element.id, {
                shadow: {
                  ...(element.shadow ?? {
                    offsetX: 0,
                    offsetY: 4,
                    blur: 12,
                    color: 'rgba(0,0,0,0.25)',
                    enabled: false,
                  }),
                  enabled: event.target.checked,
                },
              })
            }
          />
          Enable shadow
        </label>
        {element.shadow?.enabled && (
          <>
            <SliderField
              label="Shadow blur"
              value={element.shadow.blur}
              min={0}
              max={60}
              onChange={(blur) =>
                updateElement(element.id, { shadow: { ...element.shadow!, blur } })
              }
            />
            <ColorPickerField
              label="Shadow color"
              value={element.shadow.color}
              onChange={(color) =>
                updateElement(element.id, { shadow: { ...element.shadow!, color } })
              }
            />
          </>
        )}
      </PanelSection>
    </div>
  )
}
