import { useMemo, useState } from 'react'
import {
  ArrowRight,
  Copy,
  Trash2,
  Download,
  Search,
  MoreHorizontal,
  Layers,
  Clock,
  Sparkles,
  FolderOpen,
  Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { InlineEdit } from '@/components/ui/InlineEdit'
import { ProjectThumbnail } from '@/components/dashboard/ProjectThumbnail'
import { StarterTemplatesRow } from '@/components/landing/StarterTemplatesRow'
import { formatDate, formatRelativeDate } from '@/lib/utils'
import type { Project, TemplateDefinition } from '@/lib/types'

type SortKey = 'updated' | 'name' | 'screens'

export interface ProjectsSectionProps {
  projects: Project[]
  loading: boolean
  assetUrls: Record<string, Record<string, string>>
  onCreateFromTemplate: (template: TemplateDefinition) => void
  onOpenProject: (projectId: string) => void
  onDuplicate: (project: Project) => void
  onRemove: (project: Project) => void
  onRenameProject: (project: Project, name: string) => void
  onExportProject: (project: Project) => void
}

export function ProjectsSection({
  projects,
  loading,
  assetUrls,
  onCreateFromTemplate,
  onOpenProject,
  onDuplicate,
  onRemove,
  onRenameProject,
  onExportProject,
}: ProjectsSectionProps) {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('updated')

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    let list = projects
    if (normalized) {
      list = list.filter((p) => p.name.toLowerCase().includes(normalized))
    }
    return [...list].sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name)
      if (sort === 'screens') return b.screens.length - a.screens.length
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })
  }, [projects, query, sort])

  const assetResolver = (projectId: string) => (assetId?: string) =>
    assetId ? assetUrls[projectId]?.[assetId] : undefined

  return (
    <section
      id="projects"
      className="scroll-mt-16 border-t border-border/40 bg-muted/20 py-8 lg:py-12"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Projects</h2>
            <p className="text-sm text-muted-foreground">
              {loading
                ? 'Loading your workspace…'
                : projects.length === 0
                  ? 'Create your first store screenshot set'
                  : 'Open a project below or start a new one from the header.'}
            </p>
            {!loading && projects.length > 0 && (
              <p className="brand-badge w-fit">
                <Layers size={12} aria-hidden />
                {projects.length} saved locally
              </p>
            )}
          </div>
        </header>

        {loading ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(17rem,19rem))] justify-start gap-5">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-border/60 bg-card/80"
              >
                <div className="aspect-[4/3] animate-pulse bg-muted/60" />
                <div className="space-y-3 p-4">
                  <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                  <div className="h-8 w-full animate-pulse rounded-lg bg-muted/70" />
                </div>
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <EmptyProjects onCreateFromTemplate={onCreateFromTemplate} />
        ) : (
          <>
            {projects.length > 1 && (
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:max-w-xs">
                  <Search
                    className="absolute top-1/2 left-3.5 -translate-y-1/2 text-muted-foreground"
                    size={16}
                    aria-hidden
                  />
                  <input
                    type="search"
                    placeholder="Search projects…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    aria-label="Search projects"
                    className="h-10 w-full rounded-xl border border-border/60 bg-card pl-10 pr-4 text-sm shadow-sm transition focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15"
                  />
                </div>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  aria-label="Sort projects"
                  className="h-10 w-full rounded-xl border border-border/60 bg-card px-3 text-sm shadow-sm focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15 sm:w-auto"
                >
                  <option value="updated">Recently updated</option>
                  <option value="name">Name</option>
                  <option value="screens">Screen count</option>
                </select>
              </div>
            )}

            {filtered.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-border bg-card/60 py-12 text-center text-sm text-muted-foreground">
                No projects match &ldquo;{query}&rdquo;
              </p>
            ) : filtered.length === 1 ? (
              <div className="grid gap-6 lg:grid-cols-[minmax(0,19rem)_1fr] lg:items-start">
                <ProjectCard
                  project={filtered[0]}
                  assetResolver={assetResolver(filtered[0].id)}
                  onOpen={() => onOpenProject(filtered[0].id)}
                  onRename={(name) => onRenameProject(filtered[0], name)}
                  onDuplicate={() => onDuplicate(filtered[0])}
                  onExport={() => onExportProject(filtered[0])}
                  onRemove={() => onRemove(filtered[0])}
                />
                <CreateAnotherPanel onCreateFromTemplate={onCreateFromTemplate} />
              </div>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(17rem,19rem))] justify-start gap-5">
                {filtered.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    assetResolver={assetResolver(project.id)}
                    onOpen={() => onOpenProject(project.id)}
                    onRename={(name) => onRenameProject(project, name)}
                    onDuplicate={() => onDuplicate(project)}
                    onExport={() => onExportProject(project)}
                    onRemove={() => onRemove(project)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}

function EmptyProjects({
  onCreateFromTemplate,
}: {
  onCreateFromTemplate: (template: TemplateDefinition) => void
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/[0.04] via-card/50 to-card/80 shadow-sm">
      <div className="pointer-events-none absolute inset-0 landing-gradient-orbs opacity-50" aria-hidden />

      <div className="relative p-8 sm:p-10 lg:p-12">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,16rem)_1fr] lg:items-start lg:gap-12">
          <div>
            <p className="brand-badge">
              <Sparkles size={12} />
              Quick start
            </p>

            <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
              <span className="text-foreground">Pick a </span>
              <span className="brand-gradient-text">template</span>
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Start from a showcase layout, or use{' '}
              <span className="font-medium text-foreground">New project</span> in the header for a blank
              canvas.
            </p>
          </div>

          <StarterTemplatesRow onSelect={onCreateFromTemplate} title="Popular templates" />
        </div>
      </div>
    </div>
  )
}

function CreateAnotherPanel({
  onCreateFromTemplate,
}: {
  onCreateFromTemplate: (template: TemplateDefinition) => void
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
      <div className="border-b border-border/40 bg-muted/30 px-5 py-4">
        <p className="inline-flex items-center gap-2 text-sm font-semibold">
          <Plus size={16} className="text-primary" aria-hidden />
          Create another project
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Start from a template or use <span className="font-medium text-foreground">New project</span>{' '}
          in the header for a blank canvas.
        </p>
      </div>
      <div className="p-5">
        <StarterTemplatesRow onSelect={onCreateFromTemplate} title="Popular templates" />
      </div>
    </div>
  )
}

function ProjectCard({
  project,
  assetResolver,
  onOpen,
  onRename,
  onDuplicate,
  onExport,
  onRemove,
}: {
  project: Project
  assetResolver: (assetId?: string) => string | undefined
  onOpen: () => void
  onRename: (name: string) => void
  onDuplicate: () => void
  onExport: () => void
  onRemove: () => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const screenCount = project.screens.length

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition duration-200 hover:border-primary/30 hover:shadow-md">
      <button
        type="button"
        className="relative block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
        onClick={onOpen}
        aria-label={`Open ${project.name}`}
      >
        <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-gradient-to-b from-muted/50 to-muted/20 p-5">
          {project.screens[0] ? (
            <div className="h-full max-h-full w-auto shadow-md ring-1 ring-black/8 transition duration-200 group-hover:scale-[1.02] dark:ring-white/10">
              <ProjectThumbnail
                screen={project.screens[0]}
                assetResolver={assetResolver}
                className="h-full w-auto"
              />
            </div>
          ) : (
            <div className="flex h-full w-full max-w-[10rem] items-center justify-center rounded-xl border border-dashed border-border/70 bg-background/60 text-sm text-muted-foreground">
              Empty project
            </div>
          )}
          <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full border border-border/60 bg-card/90 px-2 py-0.5 text-[11px] font-medium text-foreground shadow-sm backdrop-blur">
            <Layers size={11} aria-hidden />
            {screenCount} screen{screenCount === 1 ? '' : 's'}
          </span>
        </div>
      </button>

      <div className="flex flex-1 flex-col gap-3 border-t border-border/40 p-4">
        <div className="min-w-0 space-y-1">
          <InlineEdit
            value={project.name}
            onChange={onRename}
            className="text-base font-semibold leading-tight"
            inputClassName="text-base font-semibold"
          />
          <p
            className="inline-flex items-center gap-1 text-xs text-muted-foreground"
            title={formatDate(project.updatedAt)}
          >
            <Clock size={12} aria-hidden />
            Updated {formatRelativeDate(project.updatedAt)}
          </p>
        </div>

        <div className="mt-auto flex items-center gap-2">
          <Button
            size="sm"
            className="h-9 flex-1 rounded-lg"
            onClick={onOpen}
          >
            <FolderOpen size={15} aria-hidden />
            Open
            <ArrowRight size={14} className="opacity-70" aria-hidden />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-9 w-9 shrink-0 rounded-lg"
            onClick={onDuplicate}
            title="Duplicate project"
            aria-label="Duplicate project"
          >
            <Copy size={15} />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-9 w-9 shrink-0 rounded-lg"
            onClick={onExport}
            title="Export project"
            aria-label="Export project"
          >
            <Download size={15} />
          </Button>
          <div className="relative shrink-0">
            <Button
              size="icon"
              variant="secondary"
              className="h-9 w-9 rounded-lg"
              onClick={() => setMenuOpen((open) => !open)}
              title="More actions"
              aria-label="More actions"
              aria-expanded={menuOpen}
            >
              <MoreHorizontal size={15} />
            </Button>
            {menuOpen && (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-10"
                  aria-label="Close menu"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 bottom-full z-20 mb-1 min-w-[9rem] overflow-hidden rounded-lg border border-border bg-card py-1 shadow-lg">
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-destructive hover:bg-muted"
                    onClick={() => {
                      setMenuOpen(false)
                      onRemove()
                    }}
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
