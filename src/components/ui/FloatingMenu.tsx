import type { ReactNode } from 'react'
import { useFloatingMenu } from '@/hooks/useFloatingMenu'
import { cn } from '@/lib/utils'

export type FloatingMenuMarker = 'screen-context-menu' | 'layer-context-menu'

interface FloatingMenuProps {
  x: number
  y: number
  onClose: () => void
  'aria-label': string
  marker?: FloatingMenuMarker
  children: ReactNode
}

export function FloatingMenu({
  x,
  y,
  onClose,
  'aria-label': ariaLabel,
  marker,
  children,
}: FloatingMenuProps) {
  const menuRef = useFloatingMenu(x, y, onClose)
  const markerProps =
    marker === 'screen-context-menu'
      ? { 'data-screen-context-menu': true }
      : marker === 'layer-context-menu'
        ? { 'data-layer-context-menu': true }
        : {}

  return (
    <div
      ref={menuRef}
      {...markerProps}
      className="fixed z-50 min-w-[11rem] overflow-hidden rounded-lg border border-border bg-card py-1 shadow-lg"
      style={{ left: x, top: y }}
      role="menu"
      aria-label={ariaLabel}
      onMouseDown={(event) => event.stopPropagation()}
    >
      {children}
    </div>
  )
}

interface ContextMenuItemProps {
  icon?: ReactNode
  children: ReactNode
  disabled?: boolean
  destructive?: boolean
  onClick: () => void
}

export function ContextMenuItem({
  icon,
  children,
  disabled,
  destructive,
  onClick,
}: ContextMenuItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      className={cn(
        'flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-muted',
        destructive && 'text-destructive',
        disabled && 'cursor-not-allowed opacity-40',
      )}
      onClick={onClick}
    >
      {icon}
      {children}
    </button>
  )
}

export function ContextMenuSeparator() {
  return <div className="my-1 h-px bg-border" role="separator" />
}
