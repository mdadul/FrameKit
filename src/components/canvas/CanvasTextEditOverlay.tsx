import { forwardRef, type KeyboardEvent } from 'react'
import type { TextElement } from '@/lib/types'

export interface CanvasTextEditOverlayProps {
  element: TextElement
  screenOffset: { x: number; y: number }
  containerRect: DOMRect
  panX: number
  panY: number
  workspaceZoom: number
  value: string
  onChange: (value: string) => void
  onCommit: () => void
  onCancel: () => void
}

export const CanvasTextEditOverlay = forwardRef<HTMLTextAreaElement, CanvasTextEditOverlayProps>(
  function CanvasTextEditOverlay(
    {
      element,
      screenOffset,
      containerRect,
      panX,
      panY,
      workspaceZoom,
      value,
      onChange,
      onCommit,
      onCancel,
    },
    ref,
  ) {
    const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        onCommit()
      } else if (event.key === 'Escape') {
        event.preventDefault()
        onCancel()
      }
    }

    return (
      <textarea
        ref={ref}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onCommit}
        onKeyDown={handleKeyDown}
        className="absolute z-20 resize-none overflow-hidden border-0 bg-transparent p-0 outline-none"
        style={{
          left: containerRect.left + panX + (screenOffset.x + element.x) * workspaceZoom,
          top: containerRect.top + panY + (screenOffset.y + element.y) * workspaceZoom,
          width: element.width * workspaceZoom,
          height: element.height * workspaceZoom,
          transformOrigin: 'top left',
          transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
          fontFamily: element.fontFamily,
          fontSize: element.fontSize * workspaceZoom,
          fontWeight: element.fontWeight,
          fontStyle: element.fontStyle,
          lineHeight: element.lineHeight,
          letterSpacing: element.letterSpacing * workspaceZoom,
          color: element.fill,
          textAlign: element.textAlign === 'justify' ? 'justify' : element.textAlign,
          padding: (element.padding ?? 0) * workspaceZoom,
        }}
      />
    )
  },
)
