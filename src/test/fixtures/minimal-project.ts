import { createProject } from '@/lib/factories'
import { minimalScreen } from '@/test/fixtures/minimal-screen'
import type { Project } from '@/lib/types'

export function minimalProject(overrides?: Partial<Project>): Project {
  const project = createProject('Test Project')
  project.screens = [minimalScreen()]
  return { ...project, ...overrides }
}
