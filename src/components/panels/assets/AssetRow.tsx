import { Check, Images, Plus, Trash2 } from 'lucide-react'
import { TooltipIconButton } from '@/components/ui/TooltipIconButton'
import { formatFileSize } from '@/lib/utils'
import type { AssetRecord } from '@/lib/types'

function formatAssetType(type: AssetRecord['type']): string {
  return type.charAt(0).toUpperCase() + type.slice(1)
}

export interface AssetRowProps {
  asset: AssetRecord
  url?: string
  onUse: () => void
  onAddToCanvas: () => void
  onDelete: () => void
}

export function AssetRow({ asset, url, onUse, onAddToCanvas, onDelete }: AssetRowProps) {
  return (
    <div className="group flex items-center gap-2 rounded-lg border border-border/60 bg-card p-1.5 transition hover:border-border hover:bg-muted/30">
      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-md border border-border/50 bg-muted">
        {url ? (
          <img src={url} alt={asset.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <Images size={15} strokeWidth={1.75} />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground" title={asset.name}>
          {asset.name}
        </p>
        <div className="mt-0.5 flex min-w-0 items-center gap-1.5 overflow-hidden text-[11px] text-muted-foreground">
          <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 font-medium capitalize">
            {formatAssetType(asset.type)}
          </span>
          <span className="shrink-0 whitespace-nowrap tabular-nums">
            {formatFileSize(asset.blob.size)}
          </span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 has-[:focus-visible]:opacity-100">
        <TooltipIconButton
          icon={Check}
          label="Use on device"
          onClick={onUse}
          className="bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:text-secondary-foreground"
        />
        <TooltipIconButton icon={Plus} label="Add to canvas" onClick={onAddToCanvas} />
        <TooltipIconButton
          icon={Trash2}
          label="Delete asset"
          onClick={onDelete}
          className="hover:text-destructive"
        />
      </div>
    </div>
  )
}
