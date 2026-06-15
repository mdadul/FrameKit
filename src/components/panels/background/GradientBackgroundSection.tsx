import { PropertyBlock, type BackgroundSectionProps } from '@/components/panels/background/shared'
import { BRAND_PRIMARY } from '@/lib/constants'
import { ColorPickerField } from '@/components/ui/ColorPickerField'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { SliderField } from '@/components/ui/SliderField'

interface GradientBackgroundSectionProps extends BackgroundSectionProps {
  isGradient: boolean
}

export function GradientBackgroundSection({
  background,
  patch,
  isGradient,
}: GradientBackgroundSectionProps) {
  if (!isGradient || !background.gradient) return null

  return (
    <PropertyBlock title="Gradient">
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
          onChange={(angle) => patch({ gradient: { ...background.gradient!, angle } })}
        />
      )}
      <div className="grid grid-cols-2 gap-2">
        <ColorPickerField
          label="Start"
          variant="property"
          compact
          value={background.gradient.stops[0]?.color ?? BRAND_PRIMARY}
          onChange={(color) => {
            const stops = [...background.gradient!.stops]
            stops[0] = { offset: 0, color }
            patch({ gradient: { ...background.gradient!, stops } })
          }}
        />
        <ColorPickerField
          label="End"
          variant="property"
          compact
          value={
            background.gradient.stops[background.gradient.stops.length - 1]?.color ?? '#0f172a'
          }
          onChange={(color) => {
            const stops = [...background.gradient!.stops]
            stops[stops.length - 1] = { offset: 1, color }
            patch({ gradient: { ...background.gradient!, stops } })
          }}
        />
      </div>
    </PropertyBlock>
  )
}
