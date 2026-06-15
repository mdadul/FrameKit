import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { createAndLoadProject, useProjectStore } from '@/stores/project-store'
import {
  deleteProject,
  getAllProjects,
  getProjectAssets,
  saveProject,
} from '@/lib/db'
import { createAssetObjectUrl } from '@/lib/assets/image-pipeline'
import { cloneProject } from '@/lib/factories'
import { exportProjectFile, importProjectFile } from '@/lib/project-io'
import { applyTemplateToProject } from '@/lib/templates/preview'
import { downloadBlob } from '@/lib/utils'
import { confirm } from '@/stores/confirm-store'
import { toast } from '@/stores/toast-store'
import type { Project, TemplateDefinition } from '@/lib/types'

export type ProjectAssetUrlMap = Record<string, Record<string, string>>

export async function loadProjectAssetUrls(projects: Project[]): Promise<ProjectAssetUrlMap> {
  const urls: ProjectAssetUrlMap = {}
  for (const project of projects) {
    const assets = await getProjectAssets(project.id)
    urls[project.id] = {}
    for (const asset of assets) {
      urls[project.id][asset.id] = createAssetObjectUrl(asset)
    }
  }
  return urls
}

export function useProjectsCatalog() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [assetUrls, setAssetUrls] = useState<ProjectAssetUrlMap>({})

  const refresh = useCallback(async () => {
    const items = await getAllProjects()
    setProjects(items)
    setAssetUrls(await loadProjectAssetUrls(items))
    setLoading(false)
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const goToEditor = useCallback(
    (projectId: string) => {
      void navigate({ to: '/editor/$projectId', params: { projectId } })
    },
    [navigate],
  )

  const createBlankProject = useCallback(async () => {
    const project = createAndLoadProject('New Project')
    await saveProject(project)
    await refresh()
    goToEditor(project.id)
  }, [refresh, goToEditor])

  const createFromTemplate = useCallback(
    async (template: TemplateDefinition) => {
      const baseName = template.name.split('—')[0]?.trim() || 'New Project'
      const project = createAndLoadProject(baseName)
      const withTemplate = applyTemplateToProject(project, template)
      useProjectStore.getState().loadProject(withTemplate)
      await saveProject(withTemplate)
      await refresh()
      goToEditor(withTemplate.id)
    },
    [refresh, goToEditor],
  )

  const duplicate = useCallback(
    async (project: Project) => {
      const copy = cloneProject(project)
      await saveProject(copy)
      await refresh()
      const open = await confirm({
        title: 'Open duplicated project?',
        description: `"${copy.name}" was created. Open it now?`,
        confirmLabel: 'Open copy',
        cancelLabel: 'Stay here',
      })
      if (open) goToEditor(copy.id)
    },
    [refresh, goToEditor],
  )

  const remove = useCallback(
    async (project: Project) => {
      const confirmed = await confirm({
        title: 'Delete project?',
        description: `"${project.name}" will be permanently deleted. Export it first if you need a backup.`,
        confirmLabel: 'Delete',
        destructive: true,
      })
      if (!confirmed) return
      await deleteProject(project.id)
      await refresh()
      toast('Project deleted', 'success')
    },
    [refresh],
  )

  const renameProject = useCallback(
    async (project: Project, name: string) => {
      const updated = { ...project, name, updatedAt: new Date().toISOString() }
      await saveProject(updated)
      await refresh()
    },
    [refresh],
  )

  const importProject = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return
      try {
        const project = await importProjectFile(file)
        await saveProject(project)
        await refresh()
        toast('Project imported', 'success')
      } catch {
        toast('Failed to import project', 'error')
      }
      event.target.value = ''
    },
    [refresh],
  )

  const exportProject = useCallback(async (project: Project) => {
    const blob = await exportProjectFile(project)
    downloadBlob(blob, `${project.name}.ssgproj`)
    toast('Project exported', 'success')
  }, [])

  return {
    projects,
    loading,
    assetUrls,
    refresh,
    openProject: goToEditor,
    createBlankProject,
    createFromTemplate,
    duplicate,
    remove,
    renameProject,
    importProject,
    exportProject,
  }
}
