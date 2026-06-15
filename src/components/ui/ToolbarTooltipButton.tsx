import { useCallback, useEffect, useRef, useState } from 'react'
import type { ComponentType, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

type IconType = ComponentType<{ size?: number | string }>

export interface ToolbarTooltipButtonProps {
  label: string
  ariaLabel?: string
  onClick: () => void
  disabled?: boolean
  icon?: IconType
  className?: string
  children?: ReactNode
}

export function ToolbarTooltipButton({
  icon: Icon,
  label,
  ariaLabel,
  onClick,
  disabled,
  className,
  children,
}: ToolbarTooltipButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [visible, setVisible] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })

  const updatePosition = useCallback(() => {
    const button = buttonRef.current
    if (!button) return
    const rect = button.getBoundingClientRect()
    setPosition({
      top: rect.bottom + 6,
      left: rect.left + rect.width / 2,
    })
  }, [])

  const showTooltip = useCallback(() => {
    updatePosition()
    setVisible(true)
  }, [updatePosition])

  const hideTooltip = useCallback(() => {
    setVisible(false)
  }, [])

  useEffect(() => {
    if (!visible) return

    const handleReposition = () => updatePosition()
    window.addEventListener('scroll', hideTooltip, true)
    window.addEventListener('resize', handleReposition)

    return () => {
      window.removeEventListener('scroll', hideTooltip, true)
      window.removeEventListener('resize', handleReposition)
    }
  }, [visible, hideTooltip, updatePosition])

  return (
    <>
      <div className="relative shrink-0">
        <button
          ref={buttonRef}
          type="button"
          onClick={onClick}
          disabled={disabled}
          aria-label={ariaLabel ?? label}
          onMouseEnter={showTooltip}
          onMouseLeave={hideTooltip}
          onFocus={showTooltip}
          onBlur={hideTooltip}
          className={cn(
            'inline-flex h-9 items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40',
            Icon ? 'w-9' : 'min-w-9 px-2',
            className,
          )}
        >
          {Icon ? <Icon size={17} /> : children}
        </button>
      </div>
      {visible &&
        createPortal(
          <span
            role="tooltip"
            style={{
              position: 'fixed',
              top: position.top,
              left: position.left,
              transform: 'translateX(-50%)',
              zIndex: 50,
            }}
            className="pointer-events-none max-w-none whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[11px] font-medium text-background shadow-md"
          >
            {label}
          </span>,
          document.body,
        )}
    </>
  )
}
