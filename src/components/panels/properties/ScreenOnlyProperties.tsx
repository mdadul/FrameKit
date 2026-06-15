import { Palette } from 'lucide-react'
import { PanelSection } from '@/components/ui/PanelSection'
import { BackgroundControls } from '@/components/panels/BackgroundControls'
import type { BackgroundConfig } from '@/lib/types'

interface ScreenOnlyPropertiesProps {
  background: BackgroundConfig
}

export function ScreenOnlyProperties({ background }: ScreenOnlyPropertiesProps) {
  return (
    <div className="flex min-h-full flex-col">
      <PanelSection title="Background" icon={Palette}>
        <BackgroundControls background={background} />
      </PanelSection>
      <div className="mt-auto border-t border-border/50 px-3 py-3">
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Select a layer on the canvas to edit position, typography, and effects.
        </p>
      </div>
    </div>
  )
}
