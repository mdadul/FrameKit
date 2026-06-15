import { createFileRoute } from '@tanstack/react-router'
import { useProjectsCatalog } from '@/hooks/useProjectsCatalog'
import { LandingPage } from '@/components/landing/LandingPage'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const catalog = useProjectsCatalog()

  return (
    <LandingPage
      projects={catalog.projects}
      loading={catalog.loading}
      assetUrls={catalog.assetUrls}
      onCreateBlankProject={() => void catalog.createBlankProject()}
      onCreateFromTemplate={(template) => void catalog.createFromTemplate(template)}
      onImport={(event) => void catalog.importProject(event)}
      onOpenProject={catalog.openProject}
      onDuplicate={(project) => void catalog.duplicate(project)}
      onRemove={(project) => void catalog.remove(project)}
      onRenameProject={(project, name) => void catalog.renameProject(project, name)}
      onExportProject={(project) => void catalog.exportProject(project)}
    />
  )
}
