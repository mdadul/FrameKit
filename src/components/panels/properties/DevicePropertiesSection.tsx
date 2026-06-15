import { Box, ImagePlus, Smartphone, Sun } from 'lucide-react'
import { DEVICES, getDevice } from '@/lib/assets/devices'
import { TILT_PRESETS } from '@/lib/assets/device-presets'
import { PanelSection } from '@/components/ui/PanelSection'
import { SliderField } from '@/components/ui/SliderField'
import { Button } from '@/components/ui/Button'
import { Hint } from '@/components/panels/properties/shared'
import type { DeviceElement } from '@/lib/types'

interface DevicePropertiesSectionProps {
  element: DeviceElement
  onUpdate: (patch: Partial<DeviceElement>) => void
  onUploadScreenshot: (file: File) => void
}

export function DevicePropertiesSection({
  element,
  onUpdate,
  onUploadScreenshot,
}: DevicePropertiesSectionProps) {
  return (
    <>
      <PanelSection title="Screenshot" icon={ImagePlus}>
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90">
          <ImagePlus size={15} />
          {element.screenshotAssetId ? 'Replace screenshot' : 'Fill screenshot'}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) onUploadScreenshot(file)
              event.target.value = ''
            }}
          />
        </label>
        {element.screenshotAssetId && (
          <Button
            size="sm"
            variant="ghost"
            className="w-full"
            onClick={() => onUpdate({ screenshotAssetId: undefined })}
          >
            Remove screenshot
          </Button>
        )}
        <Hint>
          Upload an app screenshot to fill the device screen, or use the Assets panel and click
          &ldquo;Use&rdquo; on a saved asset.
        </Hint>
      </PanelSection>

      <PanelSection title="Device frame" icon={Smartphone}>
        <div className="space-y-1.5">
          <span className="text-xs text-muted-foreground">Model</span>
          <select
            className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm"
            value={element.deviceId}
            onChange={(event) => {
              const deviceId = event.target.value
              const device = getDevice(deviceId)
              onUpdate({
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
            value={element.colorVariant ?? ''}
            onChange={(event) => onUpdate({ colorVariant: event.target.value })}
          >
            {(getDevice(element.deviceId)?.colorVariants ?? []).map((variant) => (
              <option key={variant.id} value={variant.id}>
                {variant.name}
              </option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={element.showFrame !== false}
            onChange={(event) => onUpdate({ showFrame: event.target.checked })}
          />
          Show frame
        </label>
        <div className="space-y-1.5">
          <span className="text-xs text-muted-foreground">Screenshot fit</span>
          <select
            className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm"
            value={element.screenshotFit ?? 'cover'}
            onChange={(event) =>
              onUpdate({
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
                  onUpdate({
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
          value={element.tiltX ?? 0}
          min={-45}
          max={45}
          onChange={(tiltX) => onUpdate({ tiltX })}
        />
        <SliderField
          label="Tilt Y (yaw)"
          value={element.tiltY ?? 0}
          min={-45}
          max={45}
          onChange={(tiltY) => onUpdate({ tiltY })}
        />
        <SliderField
          label="Perspective"
          value={element.perspective ?? 50}
          min={10}
          max={100}
          onChange={(perspective) => onUpdate({ perspective })}
        />
        <SliderField
          label="Rotation (roll)"
          value={element.rotation}
          min={-180}
          max={180}
          onChange={(rotation) => onUpdate({ rotation })}
        />
      </PanelSection>

      <PanelSection title="Shadow" icon={Sun}>
        <SliderField
          label="Shadow intensity"
          value={Math.round(element.shadowIntensity * 100)}
          min={0}
          max={100}
          onChange={(value) => onUpdate({ shadowIntensity: value / 100 })}
        />
        <SliderField
          label="Shadow spread"
          value={element.shadowSpread}
          min={0}
          max={120}
          onChange={(shadowSpread) => onUpdate({ shadowSpread })}
        />
      </PanelSection>
    </>
  )
}
