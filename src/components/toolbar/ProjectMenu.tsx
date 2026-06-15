import { useRef } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ChevronDown, Download, Upload } from 'lucide-react'
import * as Popover from '@radix-ui/react-popover'
import { useProjectStore } from '@/stores/project-store'
import { exportProjectFile, importProjectFile } from '@/lib/project-io'
import { saveProject } from '@/lib/db'
import { downloadBlob } from '@/lib/utils'
import { toast } from '@/stores/toast-store'

export function ProjectMenu() {
  const navigate = useNavigate()
  const project = useProjectStore((state) => state.project)
  const loadProject = useProjectStore((state) => state.loadProject)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const exportProject = async () => {
    if (!project) return
    const blob = await exportProjectFile(project)
    downloadBlob(blob, `${project.name}.ssgproj`)
    toast('Project exported', 'success')
  }

  const importProject = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const imported = await importProjectFile(file)
      await saveProject(imported)
      loadProject(imported)
      toast('Project imported', 'success')
      void navigate({ to: '/editor/$projectId', params: { projectId: imported.id } })
    } catch {
      toast('Failed to import project', 'error')
    }
    event.target.value = ''
  }

  return (
    <>
      <Popover.Root>
        <Popover.Trigger asChild>
          <button
            type="button"
            aria-label="Project menu"
            className="inline-flex h-8 items-center gap-1 rounded-md px-1.5 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ChevronDown size={14} />
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            align="start"
            sideOffset={6}
            className="z-50 w-44 rounded-lg border border-border bg-card p-1 shadow-lg"
          >
            <Popover.Close asChild>
              <button
                type="button"
                onClick={() => void exportProject()}
                className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm hover:bg-muted"
              >
                <Download size={14} />
                Export project
              </button>
            </Popover.Close>
            <Popover.Close asChild>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm hover:bg-muted"
              >
                <Upload size={14} />
                Import project
              </button>
            </Popover.Close>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      <input
        ref={fileInputRef}
        type="file"
        accept=".ssgproj,application/json"
        className="hidden"
        onChange={(event) => void importProject(event)}
      />
    </>
  )
}
