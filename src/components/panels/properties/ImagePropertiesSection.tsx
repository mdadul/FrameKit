import { Box, FlipHorizontal, FlipVertical, Image as ImageIcon, Sun } from 'lucide-react'
import { PanelSection } from '@/components/ui/PanelSection'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { SliderField } from '@/components/ui/SliderField'
import { ColorPickerField } from '@/components/ui/ColorPickerField'
import { Button } from '@/components/ui/Button'
import { Hint, OBJECT_FIT_OPTIONS } from '@/components/panels/properties/shared'
import type { ImageElement } from '@/lib/types'

interface ImagePropertiesSectionProps {
  element: ImageElement
  onUpdate: (patch: Partial<ImageElement>) => void
}

export function ImagePropertiesSection({ element, onUpdate }: ImagePropertiesSectionProps) {
  return (
    <>
      <PanelSection title="Image" icon={ImageIcon}>
        <SegmentedControl
          label="Object fit"
          value={element.objectFit ?? 'cover'}
          options={OBJECT_FIT_OPTIONS}
          onChange={(objectFit) => onUpdate({ objectFit })}
        />
        <div className="space-y-1.5">
          <span className="text-xs text-muted-foreground">Flip</span>
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm"
              variant={element.flipX ? 'default' : 'secondary'}
              onClick={() => onUpdate({ flipX: !element.flipX })}
            >
              <FlipHorizontal size={14} /> Horizontal
            </Button>
            <Button
              size="sm"
              variant={element.flipY ? 'default' : 'secondary'}
              onClick={() => onUpdate({ flipY: !element.flipY })}
            >
              <FlipVertical size={14} /> Vertical
            </Button>
          </div>
        </div>
        <SliderField
          label="Corner radius"
          value={element.cornerRadius}
          min={0}
          max={100}
          onChange={(cornerRadius) => onUpdate({ cornerRadius })}
        />
        <SliderField
          label="Border width"
          value={element.borderWidth}
          min={0}
          max={20}
          onChange={(borderWidth) => onUpdate({ borderWidth })}
        />
        <ColorPickerField
          label="Border color"
          value={element.borderColor}
          onChange={(borderColor) => onUpdate({ borderColor })}
        />
      </PanelSection>

      <PanelSection title="Adjustments" icon={Sun}>
        <SliderField
          label="Brightness"
          value={element.brightness ?? 0}
          min={-100}
          max={100}
          onChange={(brightness) => onUpdate({ brightness })}
        />
        <SliderField
          label="Contrast"
          value={element.contrast ?? 0}
          min={-100}
          max={100}
          onChange={(contrast) => onUpdate({ contrast })}
        />
        <SliderField
          label="Saturation"
          value={element.saturation ?? 0}
          min={-100}
          max={100}
          onChange={(saturation) => onUpdate({ saturation })}
        />
        <SliderField
          label="Blur"
          value={element.blur ?? 0}
          min={0}
          max={40}
          onChange={(blur) => onUpdate({ blur })}
        />
        {(element.brightness || element.contrast || element.saturation || element.blur) && (
          <Button
            size="sm"
            variant="ghost"
            className="w-full"
            onClick={() =>
              onUpdate({
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
            onUpdate({
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
          value={Math.round((element.cropX ?? 0) * 100)}
          min={0}
          max={100}
          onChange={(value) => onUpdate({ cropX: value / 100 })}
        />
        <SliderField
          label="Crop Y"
          value={Math.round((element.cropY ?? 0) * 100)}
          min={0}
          max={100}
          onChange={(value) => onUpdate({ cropY: value / 100 })}
        />
        <SliderField
          label="Crop width"
          value={Math.round((element.cropWidth ?? 1) * 100)}
          min={1}
          max={100}
          onChange={(value) => onUpdate({ cropWidth: value / 100 })}
        />
        <SliderField
          label="Crop height"
          value={Math.round((element.cropHeight ?? 1) * 100)}
          min={1}
          max={100}
          onChange={(value) => onUpdate({ cropHeight: value / 100 })}
        />
      </PanelSection>
    </>
  )
}
