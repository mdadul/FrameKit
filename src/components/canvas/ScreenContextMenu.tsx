import { Copy, Trash2 } from 'lucide-react'
import {
  ContextMenuItem,
  FloatingMenu,
} from '@/components/ui/FloatingMenu'

interface ScreenContextMenuProps {
  x: number
  y: number
  screenName: string
  canDelete: boolean
  canDuplicate: boolean
  onDuplicate: () => void
  onDelete: () => void
  onClose: () => void
}

export function ScreenContextMenu({
  x,
  y,
  screenName,
  canDelete,
  canDuplicate,
  onDuplicate,
  onDelete,
  onClose,
}: ScreenContextMenuProps) {
  return (
    <FloatingMenu
      x={x}
      y={y}
      onClose={onClose}
      aria-label={`Actions for ${screenName}`}
      marker="screen-context-menu"
    >
      <ContextMenuItem
        icon={<Copy size={14} />}
        disabled={!canDuplicate}
        onClick={() => {
          if (!canDuplicate) return
          onDuplicate()
          onClose()
        }}
      >
        Duplicate screen
      </ContextMenuItem>
      <ContextMenuItem
        icon={<Trash2 size={14} />}
        destructive
        disabled={!canDelete}
        onClick={() => {
          if (!canDelete) return
          void onDelete()
        }}
      >
        Delete screen
      </ContextMenuItem>
    </FloatingMenu>
  )
}
