import { useCallback, useEffect, useRef, useState } from 'react'
import type { Element, Screen, TextElement } from '@/lib/types'

interface UseCanvasTextEditOptions {
  screens: Screen[]
  activeScreen: Screen | undefined
  setActiveScreenId: (screenId: string) => void
  updateElement: (id: string, patch: Partial<Element>) => void
}

export function useCanvasTextEdit({
  screens,
  activeScreen,
  setActiveScreenId,
  updateElement,
}: UseCanvasTextEditOptions) {
  const [editingTextId, setEditingTextId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const editTextareaRef = useRef<HTMLTextAreaElement>(null)

  const beginTextEdit = useCallback(
    (screenId: string, id: string) => {
      setActiveScreenId(screenId)
      const screen = screens.find((item) => item.id === screenId)
      const element = screen?.elements.find((item) => item.id === id)
      if (!element || element.type !== 'text') return
      setEditValue(element.text)
      setEditingTextId(id)
    },
    [screens, setActiveScreenId],
  )

  const commitTextEdit = useCallback(() => {
    if (!editingTextId) return
    updateElement(editingTextId, { text: editValue })
    setEditingTextId(null)
  }, [editValue, editingTextId, updateElement])

  const cancelTextEdit = useCallback(() => {
    setEditingTextId(null)
  }, [])

  useEffect(() => {
    if (!editingTextId) return
    editTextareaRef.current?.focus()
    editTextareaRef.current?.select()
  }, [editingTextId])

  const editingElement =
    editingTextId && activeScreen
      ? (activeScreen.elements.find((item) => item.id === editingTextId) as TextElement | undefined)
      : undefined

  return {
    editingTextId,
    editingElement,
    editValue,
    setEditValue,
    editTextareaRef,
    beginTextEdit,
    commitTextEdit,
    cancelTextEdit,
  }
}
