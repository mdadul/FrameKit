import { useRef } from 'react'
import { Image as ImageIcon, Trash2 } from 'lucide-react'
import { usePersistAssetUpload } from '@/hooks/usePersistAssetUpload'
import { useProjectStore } from '@/stores/project-store'
import {
  PropertyBlock,
  composeOverlay,
  parseOverlay,
  type BackgroundSectionProps,
} from '@/components/panels/background/shared'
import type { ImageFit } from '@/lib/types'
import { Button } from '@/components/ui/Button'
import { ColorPickerField } from '@/components/ui/ColorPickerField'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { SliderField } from '@/components/ui/SliderField'

const IMAGE_FITS: ImageFit[] = ['cover', 'contain', 'fill']

export function ImageBackgroundSection({ background, patch }: BackgroundSectionProps) {
  const assetUrls = useProjectStore((state) => state.assetUrls)
  const uploadAsset = usePersistAssetUpload()
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (background.type !== 'image') return null

  const imageUrl = background.imageAssetId ? assetUrls[background.imageAssetId] : undefined
  const overlay = parseOverlay(background.overlayColor)
  const overlayEnabled = Boolean(background.overlayColor)

  const handleUpload = async (file: File) => {
    const asset = await uploadAsset(file, 'background')
    patch({ type: 'image', imageAssetId: asset.id, imageFit: background.imageFit ?? 'cover' })
  }

  return (
    <PropertyBlock title="Image">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) void handleUpload(file)
          event.target.value = ''
        }}
      />
      {imageUrl ? (
        <div
          className="h-24 w-full overflow-hidden rounded-md border border-border/70 bg-cover bg-center"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
      ) : (
        <div className="flex h-24 w-full items-center justify-center rounded-md border border-dashed border-border bg-muted/30 text-[11px] text-muted-foreground">
          No image selected
        </div>
      )}
      <div className="grid grid-cols-2 gap-2">
        <Button size="sm" variant="secondary" onClick={() => fileInputRef.current?.click()}>
          <ImageIcon size={14} /> Upload
        </Button>
        {background.imageAssetId && (
          <Button size="sm" variant="ghost" onClick={() => patch({ imageAssetId: undefined })}>
            <Trash2 size={14} /> Remove
          </Button>
        )}
      </div>
      <SegmentedControl
        ariaLabel="Image fit"
        value={background.imageFit ?? 'cover'}
        options={IMAGE_FITS.map((fit) => ({
          value: fit,
          label: fit.charAt(0).toUpperCase() + fit.slice(1),
        }))}
        onChange={(imageFit) => patch({ imageFit })}
      />

      <div className="space-y-2 border-t border-border/50 pt-3">
        <label className="flex cursor-pointer items-center gap-2 text-[11px] text-foreground">
          <input
            type="checkbox"
            checked={overlayEnabled}
            onChange={(event) =>
              patch({
                overlayColor: event.target.checked
                  ? composeOverlay(overlay.hex, overlay.alpha)
                  : undefined,
              })
            }
          />
          Color overlay
        </label>
        {overlayEnabled && (
          <>
            <ColorPickerField
              label="Overlay color"
              variant="property"
              value={overlay.hex}
              onChange={(hex) => patch({ overlayColor: composeOverlay(hex, overlay.alpha) })}
            />
            <SliderField
              label="Overlay opacity"
              min={0}
              max={100}
              value={Math.round(overlay.alpha * 100)}
              onChange={(value) =>
                patch({ overlayColor: composeOverlay(overlay.hex, value / 100) })
              }
            />
          </>
        )}
      </div>
    </PropertyBlock>
  )
}
