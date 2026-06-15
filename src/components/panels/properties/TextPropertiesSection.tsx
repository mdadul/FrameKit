import { Type } from 'lucide-react'
import { PanelSection } from '@/components/ui/PanelSection'
import { TextControls } from '@/components/panels/TextControls'
import type { TextElement } from '@/lib/types'

interface TextPropertiesSectionProps {
  element: TextElement
  onChange: (patch: Partial<TextElement>) => void
}

export function TextPropertiesSection({ element, onChange }: TextPropertiesSectionProps) {
  return (
    <PanelSection title="Typography" icon={Type}>
      <TextControls element={element} onChange={onChange} />
    </PanelSection>
  )
}
