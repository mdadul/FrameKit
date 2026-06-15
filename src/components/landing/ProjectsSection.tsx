import { useMemo, useState } from 'react'
import {
  Copy,
  Trash2,
  Download,
  Search,
  MoreHorizontal,
  Layers,
  Clock,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { InlineEdit } from '@/components/ui/InlineEdit'
import { ProjectThumbnail } from '@/components/dashboard/ProjectThumbnail'
import { StarterTemplatesRow } from '@/components/landing/StarterTemplatesRow'
import { formatDate } from '@/lib/utils'
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
      className="scroll-mt-16 border-t border-border/40 py-8 lg:py-10"
    >
      <div className="mx-auto max-w-6xl px-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {loading
              ? 'Loading your workspace…'
              : projects.length === 0
                ? 'Create your first store screenshot set'
                : `${projects.length} project${projects.length === 1 ? '' : 's'} · saved locally`}
          </p>
        </header>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-border/60 bg-card/50"
              >
                <div className="h-44 animate-pulse bg-muted/60" />
                <div className="space-y-2 p-4">
                  <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-muted/70" />
                </div>
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <EmptyProjects onCreateFromTemplate={onCreateFromTemplate} />
        ) : (
          <>
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative min-w-0 flex-1">
                <Search
                  className="absolute top-1/2 left-3.5 -translate-y-1/2 text-muted-foreground"
                  size={16}
                />
                <input
                  type="search"
                  placeholder="Search projects…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="h-11 w-full rounded-xl border border-border/60 bg-card/80 pl-10 pr-4 text-sm shadow-sm backdrop-blur transition focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15"
                />
              </div>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="h-11 rounded-xl border border-border/60 bg-card/80 px-3 text-sm shadow-sm backdrop-blur focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15 sm:w-auto"
              >
                <option value="updated">Recently updated</option>
                <option value="name">Name</option>
                <option value="screens">Screen count</option>
              </select>
            </div>

            {filtered.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border bg-muted/20 py-12 text-center text-sm text-muted-foreground">
                No projects match &ldquo;{query}&rdquo;
              </p>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition duration-200 hover:-translate-y-1 hover:border-primary/25 hover:shadow-lg">
      <button
        type="button"
        className="relative block w-full text-left"
        onClick={onOpen}
      >
        <div className="relative flex h-52 items-center justify-center overflow-hidden bg-gradient-to-br from-muted/70 via-muted/40 to-background p-6">
          {project.screens[0] ? (
            <div className="h-full max-h-full w-auto shadow-lg ring-1 ring-black/10 transition duration-200 group-hover:scale-[1.02] dark:ring-white/10">
              <ProjectThumbnail
                screen={project.screens[0]}
                assetResolver={assetResolver}
                className="h-full w-auto"
              />
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-xl border border-dashed border-border/60 text-sm text-muted-foreground">
              Empty project
            </div>
          )}
          <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-sm font-semibold text-white opacity-0 transition group-hover:bg-black/35 group-hover:opacity-100">
            Open project
          </span>
        </div>
      </button>

      <div className="absolute top-3 right-3 z-10 flex gap-1 opacity-0 transition group-hover:opacity-100">
        <Button
          size="icon"
          variant="secondary"
          className="h-8 w-8 rounded-lg bg-card/90 shadow-sm backdrop-blur"
          onClick={(e) => {
            e.stopPropagation()
            onDuplicate()
          }}
          title="Duplicate"
        >
          <Copy size={14} />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          className="h-8 w-8 rounded-lg bg-card/90 shadow-sm backdrop-blur"
          onClick={(e) => {
            e.stopPropagation()
            onExport()
          }}
          title="Export"
        >
          <Download size={14} />
        </Button>
        <div className="relative">
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 rounded-lg bg-card/90 shadow-sm backdrop-blur"
            onClick={(e) => {
              e.stopPropagation()
              setMenuOpen((open) => !open)
            }}
            title="More"
          >
            <MoreHorizontal size={14} />
          </Button>
          {menuOpen && (
            <>
              <button
                type="button"
                className="fixed inset-0 z-10"
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute top-full right-0 z-20 mt-1 min-w-[8rem] overflow-hidden rounded-lg border border-border bg-card py-1 shadow-lg">
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
                  onClick={(e) => {
                    e.stopPropagation()
                    setMenuOpen(false)
                    onRemove()
                  }}
                >
                  <Trash2 size={14} className="text-destructive" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="border-t border-border/40 p-4">
        <InlineEdit
          value={project.name}
          onChange={onRename}
          className="text-base font-semibold leading-tight"
          inputClassName="text-base font-semibold"
        />
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Layers size={12} />
            {project.screens.length} screen{project.screens.length === 1 ? '' : 's'}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock size={12} />
            {formatDate(project.updatedAt)}
          </span>
        </div>
      </div>
    </article>
  )
}
