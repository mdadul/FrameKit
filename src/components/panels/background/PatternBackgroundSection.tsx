import { PropertyBlock, type BackgroundSectionProps } from '@/components/panels/background/shared'
import { BRAND_PRIMARY } from '@/lib/constants'
import { PATTERN_KINDS } from '@/lib/canvas/backgrounds'
import { ColorPickerField } from '@/components/ui/ColorPickerField'
import { SliderField } from '@/components/ui/SliderField'
import { cn } from '@/lib/utils'

export function PatternBackgroundSection({ background, patch }: BackgroundSectionProps) {
  if (background.type !== 'pattern') return null

  return (
    <PropertyBlock title="Pattern">
      <div className="flex flex-wrap gap-1">
        {PATTERN_KINDS.map((kind) => (
          <button
            key={kind}
            type="button"
            onClick={() => patch({ patternKind: kind })}
            className={cn(
              'rounded-md border px-2 py-1 text-[10px] font-medium capitalize transition',
              background.patternKind === kind
                ? 'border-foreground/20 bg-foreground/5 text-foreground'
                : 'border-transparent bg-muted/50 text-muted-foreground hover:text-foreground',
            )}
          >
            {kind}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <ColorPickerField
          label="Base"
          variant="property"
          compact
          value={background.color ?? '#0f172a'}
          onChange={(color) => patch({ color })}
        />
        <ColorPickerField
          label="Pattern"
          variant="property"
          compact
          value={background.patternColor ?? BRAND_PRIMARY}
          onChange={(patternColor) => patch({ patternColor })}
        />
      </div>
      <SliderField
        label="Scale"
        min={8}
        max={120}
        value={background.patternScale ?? 32}
        onChange={(patternScale) => patch({ patternScale })}
      />
    </PropertyBlock>
  )
}
