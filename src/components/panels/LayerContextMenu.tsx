import {
  ArrowDown,
  ArrowUp,
  Copy,
  Eye,
  EyeOff,
  Lock,
  Trash2,
  Unlock,
} from 'lucide-react'
import {
  ContextMenuItem,
  ContextMenuSeparator,
  FloatingMenu,
} from '@/components/ui/FloatingMenu'

export interface LayerContextMenuTarget {
  elementIds: string[]
  allVisible: boolean
  allLocked: boolean
  canDelete: boolean
}

interface LayerContextMenuProps {
  x: number
  y: number
  target: LayerContextMenuTarget
  onDuplicate: () => void
  onDelete: () => void
  onBringForward: () => void
  onSendBackward: () => void
  onToggleVisible: () => void
  onToggleLocked: () => void
  onClose: () => void
}

export function LayerContextMenu({
  x,
  y,
  target,
  onDuplicate,
  onDelete,
  onBringForward,
  onSendBackward,
  onToggleVisible,
  onToggleLocked,
  onClose,
}: LayerContextMenuProps) {
  const count = target.elementIds.length
  const label = count === 1 ? 'layer' : `${count} layers`

  return (
    <FloatingMenu
      x={x}
      y={y}
      onClose={onClose}
      aria-label={`Layer actions for ${label}`}
      marker="layer-context-menu"
    >
      <ContextMenuItem
        icon={<Copy size={14} />}
        onClick={() => {
          onDuplicate()
          onClose()
        }}
      >
        Duplicate {label}
      </ContextMenuItem>
      <ContextMenuItem
        icon={<ArrowUp size={14} />}
        onClick={() => {
          onBringForward()
          onClose()
        }}
      >
        Bring forward
      </ContextMenuItem>
      <ContextMenuItem
        icon={<ArrowDown size={14} />}
        onClick={() => {
          onSendBackward()
          onClose()
        }}
      >
        Send backward
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem
        icon={target.allVisible ? <EyeOff size={14} /> : <Eye size={14} />}
        onClick={() => {
          onToggleVisible()
          onClose()
        }}
      >
        {target.allVisible ? 'Hide' : 'Show'} {label}
      </ContextMenuItem>
      <ContextMenuItem
        icon={target.allLocked ? <Unlock size={14} /> : <Lock size={14} />}
        onClick={() => {
          onToggleLocked()
          onClose()
        }}
      >
        {target.allLocked ? 'Unlock' : 'Lock'} {label}
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem
        icon={<Trash2 size={14} />}
        destructive
        disabled={!target.canDelete}
        onClick={() => {
          if (!target.canDelete) return
          onDelete()
          onClose()
        }}
      >
        Delete {label}
      </ContextMenuItem>
    </FloatingMenu>
  )
}
