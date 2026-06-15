import { useEffect, useRef } from 'react'

const VIEWPORT_PADDING = 8

export function useFloatingMenu(x: number, y: number, onClose: () => void) {
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
    let left = x
    let top = y
    if (left + rect.width > window.innerWidth - VIEWPORT_PADDING) {
      left = window.innerWidth - rect.width - VIEWPORT_PADDING
    }
    if (top + rect.height > window.innerHeight - VIEWPORT_PADDING) {
      top = window.innerHeight - rect.height - VIEWPORT_PADDING
    }
    menu.style.left = `${Math.max(VIEWPORT_PADDING, left)}px`
    menu.style.top = `${Math.max(VIEWPORT_PADDING, top)}px`
  }, [x, y])

  return menuRef
}
