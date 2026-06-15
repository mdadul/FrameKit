import { Move } from 'lucide-react'
import { PanelSection } from '@/components/ui/PanelSection'
import { Input } from '@/components/ui/Input'
import { FieldGroup } from '@/components/ui/FieldGroup'
import { NumberField } from '@/components/ui/NumberField'
import { SliderField } from '@/components/ui/SliderField'
import type { Element } from '@/lib/types'

interface ElementTransformSectionProps {
  element: Element
  onUpdate: (patch: Partial<Element>) => void
}

export function ElementTransformSection({ element, onUpdate }: ElementTransformSectionProps) {
  return (
    <PanelSection title="Transform" icon={Move}>
      <FieldGroup label="Name">
        <Input
          variant="muted"
          aria-label="Element name"
          value={element.name}
          onChange={(event) => onUpdate({ name: event.target.value })}
        />
      </FieldGroup>
      <div className="grid grid-cols-2 gap-1.5">
        <NumberField
          label="X"
          value={Math.round(element.x)}
          onChange={(x) => onUpdate({ x })}
        />
        <NumberField
          label="Y"
          value={Math.round(element.y)}
          onChange={(y) => onUpdate({ y })}
        />
        <NumberField
          label="W"
          value={Math.round(element.width)}
          onChange={(width) => onUpdate({ width })}
        />
        <NumberField
          label="H"
          value={Math.round(element.height)}
          onChange={(height) => onUpdate({ height })}
        />
      </div>
      <SliderField
        label="Rotation"
        value={element.rotation}
        min={-180}
        max={180}
        suffix="°"
        onChange={(rotation) => onUpdate({ rotation })}
      />
      <SliderField
        label="Opacity"
        value={Math.round(element.opacity * 100)}
        min={0}
        max={100}
        suffix="%"
        onChange={(value) => onUpdate({ opacity: value / 100 })}
      />
    </PanelSection>
  )
}
