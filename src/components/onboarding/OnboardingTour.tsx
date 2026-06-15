import { useEffect, useMemo, useState } from 'react'
import { Check, Download, Images, LayoutGrid, X } from 'lucide-react'
import { EXPORT_COMPLETE_KEY } from '@/components/toolbar/ExportDialog'
import { useEditorStore } from '@/stores/editor-store'
import { useProjectStore } from '@/stores/project-store'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

const ONBOARDING_KEY = 'ssg-onboarding-complete'

type PanelTab = 'assets' | 'screens' | null

interface ChecklistStep {
  id: string
  icon: typeof Images
  title: string
  description: string
  panelTab: PanelTab
  target?: string
}

const STEPS: ChecklistStep[] = [
  {
    id: 'upload',
    icon: Images,
    title: 'Upload screenshots',
    description: 'Add your app screens in Assets, then drag them onto the device frame.',
    panelTab: 'assets',
    target: '[data-tour="assets-tab"]',
  },
  {
    id: 'device',
    icon: LayoutGrid,
    title: 'Set up screens',
    description: 'Add more screens or copy iOS layouts to Android when you are ready.',
    panelTab: 'screens',
    target: '[data-tour="screens-tab"]',
  },
  {
    id: 'export',
    icon: Download,
    title: 'Export for the store',
    description: 'Download a platform-matched ZIP with Apple and Android sizes.',
    panelTab: null,
    target: '[data-tour="export-btn"]',
  },
]

export function resetOnboardingTour() {
  localStorage.removeItem(ONBOARDING_KEY)
  localStorage.removeItem(EXPORT_COMPLETE_KEY)
}

export function OnboardingTour() {
  const [visible, setVisible] = useState(false)
  const [expandedStep, setExpandedStep] = useState(0)
  const [exportDone, setExportDone] = useState(
    () => localStorage.getItem(EXPORT_COMPLETE_KEY) === '1',
  )
  const setLeftPanelTab = useEditorStore((state) => state.setLeftPanelTab)
  const project = useProjectStore((state) => state.project)
  const assetUrls = useProjectStore((state) => state.assetUrls)

  useEffect(() => {
    const syncExport = () => setExportDone(localStorage.getItem(EXPORT_COMPLETE_KEY) === '1')
    window.addEventListener('ssg-export-complete', syncExport)
    return () => window.removeEventListener('ssg-export-complete', syncExport)
  }, [])

  const hasAssets = Object.keys(assetUrls).length > 0
  const hasDeviceWithScreenshot = useMemo(() => {
    if (!project) return false
    return project.screens.some((screen) =>
      screen.elements.some(
        (element) => element.type === 'device' && element.screenshotAssetId != null,
      ),
    )
  }, [project])
  const hasExported = exportDone

  const completed = useMemo(
    () => ({
      upload: hasAssets,
      device: hasDeviceWithScreenshot || (project?.screens.length ?? 0) > 1,
      export: hasExported,
    }),
    [hasAssets, hasDeviceWithScreenshot, project?.screens.length, hasExported],
  )

  const completedCount = STEPS.filter((step) => completed[step.id as keyof typeof completed]).length

  useEffect(() => {
    if (!localStorage.getItem(ONBOARDING_KEY)) {
      setVisible(true)
    }
  }, [])

  useEffect(() => {
    if (!visible) return
    const current = STEPS[expandedStep]
    if (current.panelTab) {
      setLeftPanelTab(current.panelTab)
    }

    document.querySelectorAll('[data-tour]').forEach((el) => {
      el.classList.remove('tour-spotlight')
    })
    const target = current.target ? document.querySelector(current.target) : null
    target?.classList.add('tour-spotlight')

    return () => {
      target?.classList.remove('tour-spotlight')
    }
  }, [visible, expandedStep, setLeftPanelTab])

  const complete = () => {
    document.querySelectorAll('[data-tour]').forEach((el) => {
      el.classList.remove('tour-spotlight')
    })
    localStorage.setItem(ONBOARDING_KEY, '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-4 left-4 z-[80] w-[min(380px,calc(100vw-2rem))] rounded-xl border border-border bg-card/95 p-4 shadow-xl backdrop-blur">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold">Getting started</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {completedCount} of {STEPS.length} complete
          </p>
        </div>
        <button
          type="button"
          aria-label="Dismiss checklist"
          onClick={complete}
          className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X size={16} />
        </button>
      </div>

      <div className="mt-3 space-y-2">
        {STEPS.map((step, index) => {
          const Icon = step.icon
          const done = completed[step.id as keyof typeof completed]
          const active = expandedStep === index

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => setExpandedStep(index)}
              className={cn(
                'flex w-full items-start gap-3 rounded-lg border p-3 text-left transition',
                active ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30',
              )}
            >
              <span
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                  done ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                )}
              >
                {done ? <Check size={16} /> : <Icon size={16} />}
              </span>
              <span className="min-w-0">
                <span className="text-sm font-medium text-foreground">{step.title}</span>
                {active && (
                  <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                    {step.description}
                  </span>
                )}
              </span>
            </button>
          )
        })}
      </div>

      <div className="mt-3 flex justify-end">
        {completedCount === STEPS.length ? (
          <Button size="sm" onClick={complete}>
            Done
          </Button>
        ) : (
          <Button size="sm" variant="ghost" onClick={complete}>
            Dismiss
          </Button>
        )}
      </div>
    </div>
  )
}
