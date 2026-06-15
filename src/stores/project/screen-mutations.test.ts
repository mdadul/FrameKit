import { describe, expect, it } from 'vitest'
import { resolveNextActiveScreenId } from '@/stores/project/screen-mutations'
import { minimalScreen } from '@/test/fixtures/minimal-screen'

describe('resolveNextActiveScreenId', () => {
  const screens = [
    minimalScreen({ id: 's1', name: 'One' }),
    minimalScreen({ id: 's2', name: 'Two' }),
    minimalScreen({ id: 's3', name: 'Three' }),
  ]

  it('returns null when the active screen remains valid', () => {
    expect(resolveNextActiveScreenId(1, [screens[0], screens[2]], 's1')).toBeNull()
  })

  it('picks a neighbor when the active screen is deleted', () => {
    expect(resolveNextActiveScreenId(1, [screens[0], screens[2]], 's2')).toBe('s3')
  })
})
