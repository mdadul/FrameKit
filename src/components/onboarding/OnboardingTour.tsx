import { useEffect, useState } from 'react'
import { LayoutTemplate, Images, Download, X } from 'lucide-react'
import { useEditorStore } from '@/stores/editor-store'
import { Button } from '@/components/ui/Button'

const ONBOARDING_KEY = 'ssg-onboarding-complete'

const STEPS = [
  {
    icon: LayoutTemplate,
    target: '[data-tour="templates-tab"]',
    title: 'Templates are ready',
    description: 'Browse layouts in the Templates tab — yours may already be applied.',
    panelTab: 'templates' as const,
  },
  {
    icon: Images,
    target: '[data-tour="assets-tab"]',
    title: 'Add your screenshots',
    description: 'Upload app screens in Assets, then assign them to the device frame.',
    panelTab: 'assets' as const,
  },
  {
    icon: Download,
    target: '[data-tour="export-btn"]',
    title: 'Export for the store',
    description: 'Download PNGs or a ZIP with all Apple and Android sizes.',
    panelTab: null,
  },
]

export function OnboardingTour() {
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState(0)
  const setLeftPanelTab = useEditorStore((state) => state.setLeftPanelTab)

  useEffect(() => {
    if (!localStorage.getItem(ONBOARDING_KEY)) {
      setVisible(true)
    }
  }, [])

  useEffect(() => {
    if (!visible) return
    const current = STEPS[step]
    if (current.panelTab) {
      setLeftPanelTab(current.panelTab)
    }

    document.querySelectorAll('[data-tour]').forEach((el) => {
      el.classList.remove('tour-spotlight')
    })
    const target = document.querySelector(current.target)
    target?.classList.add('tour-spotlight')

    return () => {
      target?.classList.remove('tour-spotlight')
    }
  }, [visible, step, setLeftPanelTab])

  const complete = () => {
    document.querySelectorAll('[data-tour]').forEach((el) => {
      el.classList.remove('tour-spotlight')
    })
    localStorage.setItem(ONBOARDING_KEY, '1')
    setVisible(false)
  }

  if (!visible) return null

  const current = STEPS[step]
  const Icon = current.icon

  return (
    <div className="fixed bottom-4 left-4 z-[80] w-[min(360px,calc(100vw-2rem))] rounded-xl border border-border bg-card/95 p-4 shadow-xl backdrop-blur">
      <div className="flex items-start justify-between gap-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon size={18} />
        </div>
        <button
          type="button"
          aria-label="Dismiss tour"
          onClick={complete}
          className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X size={16} />
        </button>
      </div>
      <p className="mt-3 text-sm font-semibold">{current.title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{current.description}</p>
      <div className="mt-3 flex items-center justify-between">
        <div className="flex gap-1">
          {STEPS.map((_, index) => (
            <span
              key={index}
              className={`h-1.5 w-1.5 rounded-full ${index === step ? 'bg-primary' : 'bg-muted'}`}
            />
          ))}
        </div>
        <div className="flex gap-2">
          {step > 0 && (
            <Button size="sm" variant="ghost" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button size="sm" onClick={() => setStep(step + 1)}>
              Next
            </Button>
          ) : (
            <Button size="sm" onClick={complete}>
              Got it
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
