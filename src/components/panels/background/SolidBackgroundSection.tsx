import { PropertyBlock, type BackgroundSectionProps } from '@/components/panels/background/shared'
import { ColorPickerField } from '@/components/ui/ColorPickerField'

export function SolidBackgroundSection({ background, setBackground }: BackgroundSectionProps) {
  if (background.type !== 'solid') return null

  return (
    <PropertyBlock>
      <ColorPickerField
        label="Fill color"
        variant="property"
        value={background.color ?? '#ffffff'}
        onChange={(color) => setBackground({ type: 'solid', color })}
      />
    </PropertyBlock>
  )
}
