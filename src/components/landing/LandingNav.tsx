import { Plus } from 'lucide-react'
import { BrandMark } from '@/components/ui/BrandMark'
import { GitHubIcon } from '@/components/ui/GitHubIcon'
import { Button } from '@/components/ui/Button'
import { GITHUB_REPO_URL, APP_NAME } from '@/lib/constants'

interface LandingNavProps {
  onNewProject: () => void
}

export function LandingNav({ onNewProject }: LandingNavProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <a
          href="/"
          className="group flex min-w-0 shrink-0 items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <BrandMark size={36} className="transition-transform group-hover:scale-105" />
          <span className="min-w-0 leading-tight">
            <span className="block truncate brand-gradient-text text-base font-bold tracking-tight sm:text-lg">
              {APP_NAME}
            </span>
            <span className="hidden text-[11px] font-medium text-muted-foreground sm:block">
              Open source
            </span>
          </span>
        </a>

        <nav className="hidden flex-1 items-center justify-center gap-1 md:flex">
          <a
            href="#projects"
            className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted/60 hover:text-foreground"
          >
            Projects
          </a>
        </nav>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-card/50 text-muted-foreground backdrop-blur transition hover:border-foreground/20 hover:bg-card hover:text-foreground"
            aria-label="View on GitHub"
            title="GitHub"
          >
            <GitHubIcon size={18} />
          </a>

          <Button
            onClick={onNewProject}
            className="h-10 gap-1.5 rounded-xl px-3 shadow-sm shadow-primary/20 sm:px-4"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">New project</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
