import { useMemo } from 'react'
import { useProjectStore } from '@/stores/project-store'
import { GRADIENT_PRESETS, MESH_PRESETS } from '@/lib/canvas/backgrounds'
import { BRAND_PRIMARY } from '@/lib/constants'
import type { BackgroundConfig, BackgroundType } from '@/lib/types'
import { BackgroundPreview } from '@/components/panels/background/BackgroundPreview'
import { BackgroundPresetsSection } from '@/components/panels/background/BackgroundPresetsSection'
import { BackgroundTypeTabs } from '@/components/panels/background/BackgroundTypeTabs'
import { GradientBackgroundSection } from '@/components/panels/background/GradientBackgroundSection'
import { ImageBackgroundSection } from '@/components/panels/background/ImageBackgroundSection'
import { MeshBackgroundSection } from '@/components/panels/background/MeshBackgroundSection'
import { PatternBackgroundSection } from '@/components/panels/background/PatternBackgroundSection'
import { SolidBackgroundSection } from '@/components/panels/background/SolidBackgroundSection'
import { TYPE_TABS, presetThumb } from '@/components/panels/background/shared'

interface BackgroundControlsProps {
  background: BackgroundConfig
}

export function BackgroundControls({ background }: BackgroundControlsProps) {
  const setBackground = useProjectStore((state) => state.setActiveScreenBackground)

  const patch = (next: Partial<BackgroundConfig>) =>
    setBackground({ ...background, ...next })

  const selectType = (type: BackgroundType) => {
    if (type === background.type) return
    if (type === 'solid') {
      setBackground({ type: 'solid', color: background.color ?? '#ffffff' })
    } else if (type === 'linear-gradient') {
      setBackground({ ...GRADIENT_PRESETS[0].background })
    } else if (type === 'mesh') {
      setBackground({ ...MESH_PRESETS[0].background })
    } else if (type === 'pattern') {
      setBackground({
        type: 'pattern',
        color: background.color ?? '#0f172a',
        patternKind: 'dots',
        patternColor: BRAND_PRIMARY,
        patternScale: 32,
      })
    } else if (type === 'image') {
      setBackground({
        type: 'image',
        color: background.color ?? '#0f172a',
        imageAssetId: background.imageAssetId,
        imageFit: background.imageFit ?? 'cover',
        overlayColor: background.overlayColor,
      })
    }
  }

  const isGradient =
    background.type === 'linear-gradient' || background.type === 'radial-gradient'

  const activeTypeLabel =
    TYPE_TABS.find(
      (tab) => tab.id === background.type || (tab.id === 'linear-gradient' && isGradient),
    )?.label ?? 'Background'

  const previewUrl = useMemo(() => presetThumb(background), [background])
  const sectionProps = { background, patch, setBackground }

  return (
    <div className="space-y-4">
      <BackgroundPreview previewUrl={previewUrl} activeTypeLabel={activeTypeLabel} />

      <BackgroundTypeTabs
        background={background}
        isGradient={isGradient}
        onSelectType={selectType}
      />

      <SolidBackgroundSection {...sectionProps} />
      <GradientBackgroundSection {...sectionProps} isGradient={isGradient} />
      <MeshBackgroundSection {...sectionProps} />
      <PatternBackgroundSection {...sectionProps} />
      <ImageBackgroundSection {...sectionProps} />

      <BackgroundPresetsSection
        background={background}
        isGradient={isGradient}
        onSelect={setBackground}
      />
    </div>
  )
}
