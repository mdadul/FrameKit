import { ChevronDown } from 'lucide-react'
import * as Popover from '@radix-ui/react-popover'
import { useProjectStore } from '@/stores/project-store'
import { useEditorStore } from '@/stores/editor-store'
import { getScreenPlatform } from '@/lib/platform-copy'
import { cn } from '@/lib/utils'

export function ScreenSwitcher() {
  const project = useProjectStore((state) => state.project)
  const activeScreenId = useEditorStore((state) => state.activeScreenId)
  const focusScreen = useEditorStore((state) => state.focusScreen)

  if (!project || project.screens.length <= 1) return null

  const activeScreen = project.screens.find((s) => s.id === activeScreenId) ?? project.screens[0]

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="hidden h-8 max-w-[180px] items-center gap-1.5 truncate rounded-md border border-input bg-card px-2.5 text-sm text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:inline-flex"
          title="Switch screen"
        >
          <span className="truncate">{activeScreen?.name ?? 'Screen'}</span>
          <ChevronDown size={14} className="shrink-0 opacity-60" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={6}
          className="z-50 max-h-64 w-56 overflow-y-auto rounded-lg border border-border bg-card p-1 shadow-lg"
        >
          {project.screens.map((screen, index) => {
            const platform = getScreenPlatform(screen)
            return (
              <Popover.Close asChild key={screen.id}>
                <button
                  type="button"
                  onClick={() => focusScreen(screen.id, true)}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm hover:bg-muted',
                    screen.id === activeScreenId && 'bg-accent font-medium',
                  )}
                >
                  <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{screen.name}</span>
                  <span className="shrink-0 text-[10px] uppercase text-muted-foreground">
                    {platform === 'apple' ? 'iOS' : 'And'}
                  </span>
                </button>
              </Popover.Close>
            )
          })}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
