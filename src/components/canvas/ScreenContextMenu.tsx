import { useEffect, useRef } from 'react'
import { Copy, Trash2 } from 'lucide-react'

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
  const menuRef = useRef<HTMLDivElement>(null)

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
      data-screen-context-menu
      className="fixed z-50 min-w-[11rem] overflow-hidden rounded-lg border border-border bg-card py-1 shadow-lg"
      style={{ left: x, top: y }}
      role="menu"
      aria-label={`Actions for ${screenName}`}
      onMouseDown={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        role="menuitem"
        disabled={!canDuplicate}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
        onClick={() => {
          if (!canDuplicate) return
          onDuplicate()
          onClose()
        }}
      >
        <Copy size={14} />
        Duplicate screen
      </button>
      <button
        type="button"
        role="menuitem"
        disabled={!canDelete}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-destructive transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
        onClick={() => {
          if (!canDelete) return
          void onDelete()
        }}
      >
        <Trash2 size={14} />
        Delete screen
      </button>
    </div>
  )
}
