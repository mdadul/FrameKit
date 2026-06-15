import { MAX_SCREENS } from '@/lib/constants'
import {
  cloneScreenDesign,
  createScreenFromPrevious,
} from '@/lib/factories'
import {
  cloneScreenForAndroid,
  getScreenPlatform,
  isAppleScreen,
  sortScreensByPlatform,
} from '@/lib/platform-copy'
import { applyTemplateToScreenState, getAndroidDeviceId } from '@/stores/project/template-screen'
import type { BackgroundConfig, Element, Project, Screen, TemplateApplyMode } from '@/lib/types'

export function addScreenToProject(project: Project): void {
  if (project.screens.length >= MAX_SCREENS) return
  const previous = project.screens.at(-1)
  project.screens.push(
    createScreenFromPrevious(previous, `Screen ${project.screens.length + 1}`),
  )
}

export function duplicateScreenInProject(project: Project, screenId: string): void {
  if (project.screens.length >= MAX_SCREENS) return
  const source = project.screens.find((screen) => screen.id === screenId)
  if (!source) return
  project.screens.push(cloneScreenDesign(source, `${source.name} copy`))
}

export function resolveNextActiveScreenId(
  deletedScreenIndex: number,
  remaining: Screen[],
  activeScreenId: string | null,
): string | null {
  if (remaining.length === 0) return null
  if (activeScreenId && remaining.some((screen) => screen.id === activeScreenId)) {
    return null
  }
  return remaining[Math.min(deletedScreenIndex, remaining.length - 1)]?.id ?? remaining[0]?.id ?? null
}

export function deleteScreenFromProject(
  project: Project,
  screenId: string,
): { remaining: Screen[]; deletedIndex: number } | null {
  if (project.screens.length <= 1) return null
  const deletedIndex = project.screens.findIndex((screen) => screen.id === screenId)
  if (deletedIndex === -1) return null
  const remaining = project.screens.filter((screen) => screen.id !== screenId)
  project.screens = remaining
  return { remaining, deletedIndex }
}

export function reorderScreensInProject(project: Project, screenIds: string[]): void {
  const map = new Map(project.screens.map((screen) => [screen.id, screen]))
  project.screens = screenIds
    .map((id) => map.get(id))
    .filter((screen): screen is Screen => Boolean(screen))
}

export function renameScreenInProject(project: Project, screenId: string, name: string): void {
  const screen = project.screens.find((item) => item.id === screenId)
  if (screen) screen.name = name
}

export function setScreenBackground(screen: Screen, background: BackgroundConfig): void {
  screen.background = background
}

export function applyTemplateToAllScreensInProject(
  project: Project,
  elements: Element[],
  background: BackgroundConfig,
  mode: TemplateApplyMode = 'replace',
): void {
  for (const screen of project.screens) {
    applyTemplateToScreenState(screen, elements, background, mode)
  }
}

export function applyTemplateToScreenInProject(
  project: Project,
  screenId: string,
  elements: Element[],
  background: BackgroundConfig,
  mode: TemplateApplyMode = 'replace',
): void {
  const screen = project.screens.find((item) => item.id === screenId)
  if (!screen) return
  applyTemplateToScreenState(screen, elements, background, mode)
}

export function copyScreenToAndroidInProject(
  project: Project,
  screenId: string,
  targetDeviceId: string,
): string | null {
  const source = project.screens.find((screen) => screen.id === screenId)
  if (!source || !isAppleScreen(source)) return null

  project.screens = project.screens.filter(
    (screen) =>
      !(getScreenPlatform(screen) === 'android' && screen.sourceScreenId === screenId),
  )

  if (project.screens.length >= MAX_SCREENS) return null

  const copy = cloneScreenForAndroid(source, targetDeviceId)
  project.screens = sortScreensByPlatform([...project.screens, copy])
  return copy.id
}

export function syncLinkedAndroidScreenInProject(
  project: Project,
  appleScreenId: string,
): boolean {
  const source = project.screens.find((screen) => screen.id === appleScreenId)
  if (!source || !isAppleScreen(source)) return false

  const linked = project.screens.find(
    (screen) =>
      getScreenPlatform(screen) === 'android' && screen.sourceScreenId === appleScreenId,
  )
  if (!linked) return false

  const targetDeviceId = getAndroidDeviceId(linked) ?? getAndroidDeviceId(source)
  if (!targetDeviceId) return false

  const refreshed = cloneScreenForAndroid(source, targetDeviceId)
  linked.background = refreshed.background
  linked.elements = refreshed.elements
  linked.width = refreshed.width
  linked.height = refreshed.height
  return true
}

export function copyAllScreensToAndroidInProject(
  project: Project,
  targetDeviceId: string,
): string[] {
  const appleScreens = project.screens.filter(isAppleScreen)
  if (appleScreens.length === 0) return []

  const appleIds = new Set(appleScreens.map((screen) => screen.id))
  project.screens = project.screens.filter(
    (screen) =>
      getScreenPlatform(screen) !== 'android' ||
      !screen.sourceScreenId ||
      !appleIds.has(screen.sourceScreenId),
  )

  const slotsAvailable = MAX_SCREENS - project.screens.length
  const toCopy = appleScreens.slice(0, slotsAvailable)
  const copies = toCopy.map((screen) => cloneScreenForAndroid(screen, targetDeviceId))
  project.screens = sortScreensByPlatform([...project.screens, ...copies])
  return copies.map((screen) => screen.id)
}
