import {
  PropertyBlock,
  PresetGroup,
  getVisiblePresetGroups,
} from '@/components/panels/background/shared'
import type { BackgroundConfig } from '@/lib/types'

interface BackgroundPresetsSectionProps {
  background: BackgroundConfig
  isGradient: boolean
  onSelect: (background: BackgroundConfig) => void
}

export function BackgroundPresetsSection({
  background,
  isGradient,
  onSelect,
}: BackgroundPresetsSectionProps) {
  const visiblePresetGroups = getVisiblePresetGroups(background, isGradient)
  if (visiblePresetGroups.length === 0) return null

  return (
    <PropertyBlock title="Presets">
      <div className="space-y-3">
        {visiblePresetGroups.map((group) => (
          <PresetGroup
            key={group.title}
            title={group.title}
            presets={group.presets}
            onSelect={onSelect}
          />
        ))}
      </div>
    </PropertyBlock>
  )
}
