import { createRef } from 'react'
import { renderHook, act } from '@testing-library/react'
import { describe, expect, it, beforeEach } from 'vitest'
import { useCanvasViewport } from '@/hooks/useCanvasViewport'
import { useEditorStore } from '@/stores/editor-store'

describe('useCanvasViewport left-drag pan', () => {
  beforeEach(() => {
    useEditorStore.setState({
      activeScreenId: null,
      workspaceZoom: 1,
      panX: 10,
      panY: 20,
      screenLayout: {},
      fitRequest: null,
      focusScreenId: null,
      isPanning: false,
      isSpacePressed: false,
      selectedElementIds: [],
      leftPanelTab: 'layers',
      viewMode: 'canvas',
      clipboard: null,
      styleClipboard: null,
      marquee: null,
      konvaStageBridge: null,
    })
  })

  it('starts panning only after threshold when dragging from empty stage background', () => {
    const containerRef = createRef<HTMLDivElement>()
    const { result } = renderHook(() => useCanvasViewport({ containerRef, screens: [] }))

    const stage = { getStage: () => stage }
    const stageMouseDown = {
      evt: { button: 0, clientX: 100, clientY: 120 },
      target: stage,
    } as any

    act(() => {
      result.current.handleStagePanMouseDown(stageMouseDown)
      result.current.handlePanMouseMove({ clientX: 102, clientY: 122 } as React.MouseEvent)
    })

    expect(useEditorStore.getState().isPanning).toBe(false)
    expect(useEditorStore.getState().panX).toBe(10)
    expect(useEditorStore.getState().panY).toBe(20)

    act(() => {
      result.current.handlePanMouseMove({ clientX: 106, clientY: 126 } as React.MouseEvent)
    })

    expect(useEditorStore.getState().isPanning).toBe(true)
    expect(useEditorStore.getState().panX).toBe(16)
    expect(useEditorStore.getState().panY).toBe(26)

    act(() => {
      result.current.endPan()
    })
    expect(useEditorStore.getState().isPanning).toBe(false)
  })

  it('does not start left-drag pan when mousedown starts on a non-stage target', () => {
    const containerRef = createRef<HTMLDivElement>()
    const { result } = renderHook(() => useCanvasViewport({ containerRef, screens: [] }))

    const stage = { getStage: () => stage }
    const nonStageTarget = { getStage: () => stage }
    const nonStageMouseDown = {
      evt: { button: 0, clientX: 100, clientY: 120 },
      target: nonStageTarget,
    } as any

    act(() => {
      // target object intentionally differs from getStage() return value
      result.current.handleStagePanMouseDown({
        ...nonStageMouseDown,
        target: { ...nonStageTarget },
      } as any)
      result.current.handlePanMouseMove({ clientX: 110, clientY: 130 } as React.MouseEvent)
    })

    expect(useEditorStore.getState().isPanning).toBe(false)
    expect(useEditorStore.getState().panX).toBe(10)
    expect(useEditorStore.getState().panY).toBe(20)
  })
})
