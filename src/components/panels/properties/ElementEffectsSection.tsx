import { Sparkles } from 'lucide-react'
import { PanelSection } from '@/components/ui/PanelSection'
import { SliderField } from '@/components/ui/SliderField'
import { ColorPickerField } from '@/components/ui/ColorPickerField'
import type { Element } from '@/lib/types'

interface ElementEffectsSectionProps {
  element: Element
  onUpdate: (patch: Partial<Element>) => void
}

export function ElementEffectsSection({ element, onUpdate }: ElementEffectsSectionProps) {
  return (
    <PanelSection title="Effects" icon={Sparkles} defaultOpen={false}>
      <label className="flex items-center gap-2 text-[11px] text-foreground">
        <input
          type="checkbox"
          className="rounded border-border"
          checked={element.shadow?.enabled ?? false}
          onChange={(event) =>
            onUpdate({
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
            onChange={(blur) => onUpdate({ shadow: { ...element.shadow!, blur } })}
          />
          <ColorPickerField
            label="Shadow color"
            value={element.shadow.color}
            onChange={(color) => onUpdate({ shadow: { ...element.shadow!, color } })}
          />
        </>
      )}
    </PanelSection>
  )
}
