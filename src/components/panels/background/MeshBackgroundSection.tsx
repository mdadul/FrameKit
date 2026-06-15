import { PropertyBlock, type BackgroundSectionProps } from '@/components/panels/background/shared'
import { ColorPickerField } from '@/components/ui/ColorPickerField'

export function MeshBackgroundSection({ background, patch }: BackgroundSectionProps) {
  if (background.type !== 'mesh') return null

  return (
    <PropertyBlock title="Mesh colors">
      <div className="space-y-2">
        {(background.meshColors ?? []).map((color, index) => (
          <ColorPickerField
            key={index}
            label={`Color ${index + 1}`}
            variant="property"
            value={color}
            onChange={(next) => {
              const meshColors = [...(background.meshColors ?? [])]
              meshColors[index] = next
              patch({ meshColors })
            }}
          />
        ))}
      </div>
    </PropertyBlock>
  )
}
