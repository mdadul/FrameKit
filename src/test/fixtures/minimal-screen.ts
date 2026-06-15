import { createTextElement, createScreen } from '@/lib/factories'
import type { BackgroundConfig, Screen } from '@/lib/types'

export function minimalScreen(overrides?: Partial<Screen>): Screen {
  const screen = createScreen('Test Screen')
  screen.elements = [
    createTextElement({ id: 'existing-text', name: 'Headline', text: 'Hello', zIndex: 0 }),
  ]
  return { ...screen, ...overrides }
}

export function minimalBackground(): BackgroundConfig {
  return { type: 'solid', color: '#0D9488' }
}
