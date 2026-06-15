import { useState } from 'react'
import { LandingNav } from '@/components/landing/LandingNav'
import { HeroSection } from '@/components/landing/HeroSection'
import { TemplatePickerModal } from '@/components/landing/TemplatePickerModal'
import { ProjectsSection, type ProjectsSectionProps } from '@/components/landing/ProjectsSection'
import { LandingFooter } from '@/components/landing/LandingFooter'

interface LandingPageProps extends ProjectsSectionProps {
  onCreateBlankProject: () => void
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export function LandingPage({
  onCreateBlankProject,
  onCreateFromTemplate,
  onImport,
  projects,
  loading,
  assetUrls,
  onOpenProject,
  onDuplicate,
  onRemove,
  onRenameProject,
  onExportProject,
}: LandingPageProps) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const hasProjects = !loading && projects.length > 0

  const openPicker = () => setPickerOpen(true)

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPickerOpen(false)
    onImport(event)
  }

  return (
    <div className="flex min-h-full flex-col">
      <LandingNav onNewProject={openPicker} />
      <main className="flex-1">
        <HeroSection
          compact={hasProjects}
          projectCount={projects.length}
          onNewProject={openPicker}
        />
        <ProjectsSection
          projects={projects}
          loading={loading}
          assetUrls={assetUrls}
          onCreateFromTemplate={onCreateFromTemplate}
          onOpenProject={onOpenProject}
          onDuplicate={onDuplicate}
          onRemove={onRemove}
          onRenameProject={onRenameProject}
          onExportProject={onExportProject}
        />
      </main>
      <LandingFooter />

      <TemplatePickerModal
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={(template) => {
          setPickerOpen(false)
          onCreateFromTemplate(template)
        }}
        onBlank={() => {
          setPickerOpen(false)
          onCreateBlankProject()
        }}
        onImport={handleImport}
      />
    </div>
  )
}
