import Dexie, { type Table } from 'dexie'
import type { AssetRecord, Project, UserPreferences } from '@/lib/types'
import { DEFAULT_USER_PREFERENCES } from '@/lib/constants'

export class ScreenshotStudioDB extends Dexie {
  projects!: Table<Project, string>
  assets!: Table<AssetRecord, string>
  userPreferences!: Table<UserPreferences, string>

  constructor() {
    super('ScreenshotStudioDB')
    this.version(1).stores({
      projects: 'id, name, updatedAt',
      assets: 'id, projectId, type, name',
      userPreferences: 'id',
    })
  }
}

export const db = new ScreenshotStudioDB()

export async function getAllProjects(): Promise<Project[]> {
  return db.projects.orderBy('updatedAt').reverse().toArray()
}

export async function getProject(id: string): Promise<Project | undefined> {
  return db.projects.get(id)
}

export async function saveProject(project: Project): Promise<void> {
  await db.projects.put({
    ...project,
    updatedAt: new Date().toISOString(),
  })
}

export async function deleteProject(id: string): Promise<void> {
  await db.transaction('rw', db.projects, db.assets, async () => {
    await db.assets.where('projectId').equals(id).delete()
    await db.projects.delete(id)
  })
}

export async function getUserPreferences(): Promise<UserPreferences> {
  const existing = await db.userPreferences.get('default')
  if (existing) return existing
  await db.userPreferences.put(DEFAULT_USER_PREFERENCES)
  return DEFAULT_USER_PREFERENCES
}

export async function saveUserPreferences(
  preferences: UserPreferences,
): Promise<void> {
  await db.userPreferences.put(preferences)
}

export async function getProjectAssets(projectId: string): Promise<AssetRecord[]> {
  return db.assets.where('projectId').equals(projectId).toArray()
}

export async function saveAsset(asset: AssetRecord): Promise<void> {
  await db.assets.put(asset)
}

export async function deleteAsset(id: string): Promise<void> {
  await db.assets.delete(id)
}

export async function getAsset(id: string): Promise<AssetRecord | undefined> {
  return db.assets.get(id)
}
