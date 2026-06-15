import type { LucideIcon } from 'lucide-react'
import {
  Images,
  Layers,
  LayoutGrid,
  LayoutTemplate,
  Palette,
  X,
} from 'lucide-react'
import { LayersPanel } from '@/components/panels/LayersPanel'
import { AssetsPanel } from '@/components/panels/AssetsPanel'
import { ScreensPanel } from '@/components/panels/ScreensPanel'
import { TemplatesPanel } from '@/components/panels/TemplatesPanel'
import { BrandKitPanel } from '@/components/panels/BrandKitPanel'
import { useEditorStore } from '@/stores/editor-store'
import { cn } from '@/lib/utils'

const tabs: Array<{
  id: 'layers' | 'assets' | 'screens' | 'templates' | 'brand'
  label: string
  icon: LucideIcon
}> = [
  { id: 'layers', label: 'Layers', icon: Layers },
  { id: 'assets', label: 'Assets', icon: Images },
  { id: 'screens', label: 'Screens', icon: LayoutGrid },
  { id: 'templates', label: 'Templates', icon: LayoutTemplate },
  { id: 'brand', label: 'Brand', icon: Palette },
]

function SidebarTab({
  label,
  icon: Icon,
  active,
  onClick,
  dataTour,
}: {
  label: string
  icon: LucideIcon
  active: boolean
  onClick: () => void
  dataTour?: string
}) {
  return (
    <div className="group/tip relative flex-1">
      <button
        type="button"
        role="tab"
        aria-selected={active}
        aria-label={label}
        data-tour={dataTour}
        onClick={onClick}
        className={cn(
          'flex h-8 w-full flex-col items-center justify-center gap-0.5 rounded-md transition lg:h-auto lg:flex-row lg:gap-1.5 lg:px-2 lg:py-1.5',
          active
            ? 'bg-card text-primary shadow-sm ring-1 ring-border/60'
            : 'text-muted-foreground hover:bg-card/60 hover:text-foreground',
        )}
      >
        <Icon size={16} strokeWidth={active ? 2.25 : 2} />
        <span className="hidden text-[10px] font-medium lg:inline">{label}</span>
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute top-[calc(100%+6px)] left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[11px] font-medium text-background opacity-0 shadow-md transition-opacity duration-150 group-hover/tip:opacity-100 group-focus-within/tip:opacity-100 lg:hidden"
      >
        {label}
      </span>
    </div>
  )
}

interface LeftSidebarProps {
  open: boolean
  onClose: () => void
}

export function LeftSidebar({ open, onClose }: LeftSidebarProps) {
  const leftPanelTab = useEditorStore((state) => state.leftPanelTab)
  const setLeftPanelTab = useEditorStore((state) => state.setLeftPanelTab)

  return (
    <aside
      className={cn(
        'z-40 flex flex-col bg-panel transition-transform duration-200',
        'fixed inset-y-0 left-0 w-80 max-w-[85vw] border-r border-border shadow-xl',
        open ? 'translate-x-0' : '-translate-x-full',
        'lg:static lg:z-auto lg:max-w-none lg:translate-x-0 lg:shadow-none lg:transition-[width,opacity] lg:duration-200',
        open ? 'lg:w-80' : 'lg:w-0 lg:overflow-hidden lg:border-r-0 lg:opacity-0',
      )}
    >
      <div className="flex shrink-0 items-center gap-1.5 overflow-visible border-b border-border px-2 py-2">
        <div
          className="flex flex-1 items-stretch gap-0.5 overflow-visible rounded-lg bg-muted/80 p-0.5"
          role="tablist"
          aria-label="Sidebar panels"
        >
          {tabs.map((tab) => (
            <SidebarTab
              key={tab.id}
              label={tab.label}
              icon={tab.icon}
              active={leftPanelTab === tab.id}
              onClick={() => setLeftPanelTab(tab.id)}
              dataTour={
                tab.id === 'templates'
                  ? 'templates-tab'
                  : tab.id === 'assets'
                    ? 'assets-tab'
                    : tab.id === 'screens'
                      ? 'screens-tab'
                      : undefined
              }
            />
          ))}
        </div>
        <button
          type="button"
          aria-label="Collapse panel"
          title="Collapse panel"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={onClose}
        >
          <X size={16} />
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
        {leftPanelTab === 'layers' && <LayersPanel />}
        {leftPanelTab === 'assets' && <AssetsPanel />}
        {leftPanelTab === 'screens' && <ScreensPanel />}
        {leftPanelTab === 'templates' && <TemplatesPanel />}
        {leftPanelTab === 'brand' && <BrandKitPanel />}
      </div>
    </aside>
  )
}
