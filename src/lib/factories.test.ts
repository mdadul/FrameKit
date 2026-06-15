import { describe, expect, it } from 'vitest'
import {
  cloneScreenDesign,
  createDefaultScreen,
  createScreen,
  createScreenFromPrevious,
  createTextElement,
} from '@/lib/factories'

describe('createScreenFromPrevious', () => {
  it('clones the previous screen design with fresh ids', () => {
    const previous = createScreen('Screen 1')
    previous.background = { type: 'solid', color: '#111827' }
    previous.elements = [createTextElement({ text: 'Hello' })]

    const next = createScreenFromPrevious(previous, 'Screen 2')

    expect(next.name).toBe('Screen 2')
    expect(next.id).not.toBe(previous.id)
    expect(next.background).toEqual(previous.background)
    expect(next.elements).toHaveLength(1)
    expect(next.elements[0]?.id).not.toBe(previous.elements[0]?.id)
    expect(next.elements[0]?.type).toBe('text')
    if (next.elements[0]?.type === 'text') {
      expect(next.elements[0].text).toBe('Hello')
    }
  })

  it('creates a default screen with a device frame when no previous screen exists', () => {
    const screen = createScreenFromPrevious(undefined, 'Screen 1')

    expect(screen.name).toBe('Screen 1')
    expect(screen.elements).toHaveLength(1)
    expect(screen.elements[0]?.type).toBe('device')
  })
})

describe('cloneScreenDesign', () => {
  it('clears android source linkage on cloned screens', () => {
    const source = createScreen('iOS')
    source.sourceScreenId = 'linked-screen'

    const copy = cloneScreenDesign(source, 'Screen 2')

    expect(copy.sourceScreenId).toBeUndefined()
  })
})

describe('createDefaultScreen', () => {
  it('includes a centered default device', () => {
    const screen = createDefaultScreen('Starter')

    expect(screen.elements[0]?.type).toBe('device')
  })
})
