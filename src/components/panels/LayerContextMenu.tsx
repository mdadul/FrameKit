import { useEffect, useRef } from 'react'
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
  const menuRef = useRef<HTMLDivElement>(null)
  const count = target.elementIds.length
  const label = count === 1 ? 'layer' : `${count} layers`

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (menuRef.current?.contains(event.target as Node)) return
      onClose()
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('mousedown', handlePointerDown)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('scroll', onClose, true)
    return () => {
      window.removeEventListener('mousedown', handlePointerDown)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('scroll', onClose, true)
    }
  }, [onClose])

  useEffect(() => {
    const menu = menuRef.current
    if (!menu) return
    const rect = menu.getBoundingClientRect()
    const padding = 8
    let left = x
    let top = y
    if (left + rect.width > window.innerWidth - padding) {
      left = window.innerWidth - rect.width - padding
    }
    if (top + rect.height > window.innerHeight - padding) {
      top = window.innerHeight - rect.height - padding
    }
    menu.style.left = `${Math.max(padding, left)}px`
    menu.style.top = `${Math.max(padding, top)}px`
  }, [x, y])

  return (
    <div
      ref={menuRef}
      data-layer-context-menu
      className="fixed z-50 min-w-[11rem] overflow-hidden rounded-lg border border-border bg-card py-1 shadow-lg"
      style={{ left: x, top: y }}
      role="menu"
      aria-label={`Layer actions for ${label}`}
      onMouseDown={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        role="menuitem"
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-muted"
        onClick={() => {
          onDuplicate()
          onClose()
        }}
      >
        <Copy size={14} />
        Duplicate {label}
      </button>
      <button
        type="button"
        role="menuitem"
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-muted"
        onClick={() => {
          onBringForward()
          onClose()
        }}
      >
        <ArrowUp size={14} />
        Bring forward
      </button>
      <button
        type="button"
        role="menuitem"
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-muted"
        onClick={() => {
          onSendBackward()
          onClose()
        }}
      >
        <ArrowDown size={14} />
        Send backward
      </button>
      <div className="my-1 h-px bg-border" role="separator" />
      <button
        type="button"
        role="menuitem"
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-muted"
        onClick={() => {
          onToggleVisible()
          onClose()
        }}
      >
        {target.allVisible ? <EyeOff size={14} /> : <Eye size={14} />}
        {target.allVisible ? 'Hide' : 'Show'} {label}
      </button>
      <button
        type="button"
        role="menuitem"
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-muted"
        onClick={() => {
          onToggleLocked()
          onClose()
        }}
      >
        {target.allLocked ? <Unlock size={14} /> : <Lock size={14} />}
        {target.allLocked ? 'Unlock' : 'Lock'} {label}
      </button>
      <div className="my-1 h-px bg-border" role="separator" />
      <button
        type="button"
        role="menuitem"
        disabled={!target.canDelete}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-destructive transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
        onClick={() => {
          if (!target.canDelete) return
          onDelete()
          onClose()
        }}
      >
        <Trash2 size={14} />
        Delete {label}
      </button>
    </div>
  )
}
