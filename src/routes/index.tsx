import { useEffect, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
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
import { LandingPage } from '@/components/landing/LandingPage'
import type { Project, TemplateDefinition } from '@/lib/types'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [assetUrls, setAssetUrls] = useState<Record<string, Record<string, string>>>({})

  const refresh = async () => {
    const items = await getAllProjects()
    setProjects(items)

    const urls: Record<string, Record<string, string>> = {}
    for (const project of items) {
      const assets = await getProjectAssets(project.id)
      urls[project.id] = {}
      for (const asset of assets) {
        urls[project.id][asset.id] = createAssetObjectUrl(asset)
      }
    }
    setAssetUrls(urls)
    setLoading(false)
  }

  useEffect(() => {
    void refresh()
  }, [])

  const goToEditor = (projectId: string) => {
    void navigate({ to: '/editor/$projectId', params: { projectId } })
  }

  const createBlankProject = async () => {
    const project = createAndLoadProject('New Project')
    await saveProject(project)
    await refresh()
    goToEditor(project.id)
  }

  const createFromTemplate = async (template: TemplateDefinition) => {
    const baseName = template.name.split('—')[0]?.trim() || 'New Project'
    const project = createAndLoadProject(baseName)
    const withTemplate = applyTemplateToProject(project, template)
    useProjectStore.getState().loadProject(withTemplate)
    await saveProject(withTemplate)
    await refresh()
    goToEditor(withTemplate.id)
  }

  const openProject = (projectId: string) => {
    goToEditor(projectId)
  }

  const duplicate = async (project: Project) => {
    const copy = cloneProject(project)
    await saveProject(copy)
    await refresh()
    const open = await confirm({
      title: 'Open duplicated project?',
      description: `"${copy.name}" was created. Open it now?`,
      confirmLabel: 'Open copy',
      cancelLabel: 'Stay here',
    })
    if (open) openProject(copy.id)
  }

  const remove = async (project: Project) => {
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
  }

  const renameProject = async (project: Project, name: string) => {
    const updated = { ...project, name, updatedAt: new Date().toISOString() }
    await saveProject(updated)
    await refresh()
  }

  const importProject = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
  }

  const exportProject = async (project: Project) => {
    const blob = await exportProjectFile(project)
    downloadBlob(blob, `${project.name}.ssgproj`)
    toast('Project exported', 'success')
  }

  return (
    <LandingPage
      projects={projects}
      loading={loading}
      assetUrls={assetUrls}
      onCreateBlankProject={() => void createBlankProject()}
      onCreateFromTemplate={(template) => void createFromTemplate(template)}
      onImport={(event) => void importProject(event)}
      onOpenProject={openProject}
      onDuplicate={(project) => void duplicate(project)}
      onRemove={(project) => void remove(project)}
      onRenameProject={(project, name) => void renameProject(project, name)}
      onExportProject={(project) => void exportProject(project)}
    />
  )
}
