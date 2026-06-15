import { useCallback, useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Layers, SlidersHorizontal } from 'lucide-react'
import { getProject, getProjectAssets, saveProject } from '@/lib/db'
import { createAssetObjectUrl } from '@/lib/assets/image-pipeline'
import { cn } from '@/lib/utils'
import { useProjectStore } from '@/stores/project-store'
import { useEditorStore } from '@/stores/editor-store'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useAutoSave } from '@/hooks/useAutoSave'
import { EditorToolbar } from '@/components/toolbar/EditorToolbar'
import { LeftSidebar } from '@/components/panels/LeftSidebar'
import { PropertiesPanel, PropertiesPanelHeader } from '@/components/panels/PropertiesPanel'
import { useSettingsStore } from '@/stores/settings-store'
import { ScreensOverview } from '@/components/canvas/ScreensOverview'
import { CanvasWorkspace } from '@/components/canvas/CanvasWorkspace'
import { OnboardingTour } from '@/components/onboarding/OnboardingTour'

export const Route = createFileRoute('/editor/$projectId')({
  component: EditorPage,
})

function EditorPage() {
  const { projectId } = Route.useParams()
  const project = useProjectStore((state) => state.project)
  const loadProject = useProjectStore((state) => state.loadProject)
  const registerAssetUrl = useProjectStore((state) => state.registerAssetUrl)
  const assetUrls = useProjectStore((state) => state.assetUrls)
  const setActiveScreenId = useEditorStore((state) => state.setActiveScreenId)
  const viewMode = useEditorStore((state) => state.viewMode)
  const focusScreen = useEditorStore((state) => state.focusScreen)
  const reorderScreens = useProjectStore((state) => state.reorderScreens)
  const activeScreenId = useEditorStore((state) => state.activeScreenId)
  const setWorkspaceZoom = useEditorStore((state) => state.setWorkspaceZoom)
  const defaultZoom = useSettingsStore((state) => state.preferences.workspace.defaultZoom)
  const isDesktop =
    typeof window === 'undefined'
      ? true
      : window.matchMedia('(min-width: 1024px)').matches
  const [propertiesOpen, setPropertiesOpen] = useState(isDesktop)
  const [leftOpen, setLeftOpen] = useState(isDesktop)

  const assetResolver = useCallback(
    (assetId?: string) => (assetId ? assetUrls[assetId] : undefined),
    [assetUrls],
  )

  useKeyboardShortcuts()
  useAutoSave()

  useEffect(() => {
    const load = async () => {
      const existing = await getProject(projectId)
      if (existing) {
        loadProject(existing)
        setActiveScreenId(existing.screens[0]?.id ?? null)
        setWorkspaceZoom(defaultZoom)
        const assets = await getProjectAssets(projectId)
        assets.forEach((asset) =>
          registerAssetUrl(asset.id, createAssetObjectUrl(asset)),
        )
      } else {
        const fallback = useProjectStore.getState().project
        if (!fallback || fallback.id !== projectId) return
        await saveProject(fallback)
      }
    }
    void load()
  }, [loadProject, projectId, registerAssetUrl, setActiveScreenId, setWorkspaceZoom, defaultZoom])

  if (!project || project.screens.length === 0) {
    return <div className="p-6 text-muted-foreground">Loading editor...</div>
  }

  return (
    <div className="flex h-screen flex-col">
      <EditorToolbar />
      <div className="relative flex min-h-0 flex-1">
        {leftOpen && (
          <button
            type="button"
            aria-label="Close panel"
            className="fixed inset-0 z-30 bg-black/40 lg:hidden"
            onClick={() => setLeftOpen(false)}
          />
        )}
        <LeftSidebar open={leftOpen} onClose={() => setLeftOpen(false)} />

        {!leftOpen && (
          <button
            type="button"
            aria-label="Open panel"
            className="fixed top-1/2 left-3 z-30 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-lg hover:bg-muted lg:absolute"
            onClick={() => setLeftOpen(true)}
          >
            <Layers size={18} />
          </button>
        )}

        <main className="relative min-w-0 flex-1">
          {viewMode === 'overview' ? (
            <ScreensOverview
              screens={project.screens}
              activeScreenId={activeScreenId}
              assetResolver={assetResolver}
              onSelect={(screenId) => focusScreen(screenId, true)}
              onReorder={reorderScreens}
            />
          ) : (
            <CanvasWorkspace screens={project.screens} assetResolver={assetResolver} />
          )}
        </main>

        {propertiesOpen && (
          <button
            type="button"
            aria-label="Close properties"
            className="fixed inset-0 z-30 bg-black/40 lg:hidden"
            onClick={() => setPropertiesOpen(false)}
          />
        )}

        <aside
          className={cn(
            'z-40 flex flex-col bg-background transition-transform duration-200',
            'fixed inset-y-0 right-0 w-80 max-w-[85vw] border-l border-border/60 shadow-xl',
            propertiesOpen ? 'translate-x-0' : 'translate-x-full',
            'lg:static lg:z-auto lg:max-w-none lg:translate-x-0 lg:shadow-none lg:transition-[width,opacity] lg:duration-200',
            propertiesOpen
              ? 'lg:w-80'
              : 'lg:w-0 lg:overflow-hidden lg:border-l-0 lg:opacity-0',
          )}
        >
          <PropertiesPanelHeader onClose={() => setPropertiesOpen(false)} />
          <div className="min-h-0 flex-1 overflow-auto">
            <PropertiesPanel />
          </div>
        </aside>

        {!propertiesOpen && (
          <button
            type="button"
            aria-label="Open properties"
            className="fixed top-1/2 right-3 z-30 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-lg hover:bg-muted lg:absolute"
            onClick={() => setPropertiesOpen(true)}
          >
            <SlidersHorizontal size={18} />
          </button>
        )}
      </div>
      <OnboardingTour />
    </div>
  )
}
