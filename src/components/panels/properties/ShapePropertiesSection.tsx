import { Palette } from 'lucide-react'
import { BRAND_PRIMARY } from '@/lib/constants'
import { PanelSection } from '@/components/ui/PanelSection'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { SliderField } from '@/components/ui/SliderField'
import { ColorPickerField } from '@/components/ui/ColorPickerField'
import { DEFAULT_GRADIENT } from '@/components/panels/properties/shared'
import type { FillConfig, GradientFill, ShapeElement } from '@/lib/types'

interface ShapePropertiesSectionProps {
  element: ShapeElement
  onUpdate: (patch: Partial<ShapeElement>) => void
}

export function ShapePropertiesSection({ element, onUpdate }: ShapePropertiesSectionProps) {
  const isGradient = element.fill.type === 'gradient'
  const gradient = element.fill.gradient ?? DEFAULT_GRADIENT
  const setFill = (fill: FillConfig) => onUpdate({ fill })
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
                gradient: element.fill.gradient ?? { ...DEFAULT_GRADIENT },
              })
            : setFill({ type: 'solid', color: element.fill.color ?? BRAND_PRIMARY })
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
          value={element.fill.color ?? BRAND_PRIMARY}
          onChange={(color) => setFill({ type: 'solid', color })}
        />
      )}

      <ColorPickerField
        label="Stroke"
        value={element.stroke}
        onChange={(stroke) => onUpdate({ stroke })}
      />
      <SliderField
        label="Stroke width"
        value={element.strokeWidth}
        min={0}
        max={20}
        onChange={(strokeWidth) => onUpdate({ strokeWidth })}
      />
      <SliderField
        label="Corner radius"
        value={element.cornerRadius}
        min={0}
        max={100}
        onChange={(cornerRadius) => onUpdate({ cornerRadius })}
      />
    </PanelSection>
  )
}
