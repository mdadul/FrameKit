import { Move, Palette } from 'lucide-react'
import { sharedNumber } from '@/lib/elements/selection-fields'
import { PanelSection } from '@/components/ui/PanelSection'
import { BackgroundControls } from '@/components/panels/BackgroundControls'
import { MixedNumberField } from '@/components/ui/NumberField'
import { SliderField } from '@/components/ui/SliderField'
import { Hint } from '@/components/panels/properties/shared'
import type { BackgroundConfig, Element } from '@/lib/types'

interface MultiSelectionPropertiesProps {
  selectedElements: Element[]
  screenBackground: BackgroundConfig
  onUpdateSelected: (patch: Partial<Element>) => void
}

export function MultiSelectionProperties({
  selectedElements,
  screenBackground,
  onUpdateSelected,
}: MultiSelectionPropertiesProps) {
  const sharedOpacity = sharedNumber(selectedElements.map((item) => item.opacity))
  const sharedX = sharedNumber(selectedElements.map((item) => Math.round(item.x)))
  const sharedY = sharedNumber(selectedElements.map((item) => Math.round(item.y)))
  const sharedWidth = sharedNumber(selectedElements.map((item) => Math.round(item.width)))
  const sharedHeight = sharedNumber(selectedElements.map((item) => Math.round(item.height)))

  return (
    <div className="space-y-0 overflow-auto">
      <PanelSection title="Transform" icon={Move}>
        <div className="grid grid-cols-2 gap-1.5">
          <MixedNumberField label="X" value={sharedX} onChange={(x) => onUpdateSelected({ x })} />
          <MixedNumberField label="Y" value={sharedY} onChange={(y) => onUpdateSelected({ y })} />
          <MixedNumberField
            label="W"
            value={sharedWidth}
            onChange={(width) => onUpdateSelected({ width })}
          />
          <MixedNumberField
            label="H"
            value={sharedHeight}
            onChange={(height) => onUpdateSelected({ height })}
          />
        </div>
        <SliderField
          label="Opacity"
          value={Math.round((sharedOpacity ?? 1) * 100)}
          min={0}
          max={100}
          suffix="%"
          onChange={(value) => onUpdateSelected({ opacity: value / 100 })}
        />
        <Hint>
          Changes apply to all {selectedElements.length} selected elements. Alignment and
          distribution live in the toolbar.
        </Hint>
      </PanelSection>

      <PanelSection title="Background" icon={Palette} defaultOpen={false}>
        <BackgroundControls background={screenBackground} />
      </PanelSection>
    </div>
  )
}
