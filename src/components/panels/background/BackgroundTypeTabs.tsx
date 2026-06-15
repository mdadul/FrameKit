import { TYPE_TABS } from '@/components/panels/background/shared'
import type { BackgroundConfig, BackgroundType } from '@/lib/types'
import { cn } from '@/lib/utils'

interface BackgroundTypeTabsProps {
  background: BackgroundConfig
  isGradient: boolean
  onSelectType: (type: BackgroundType) => void
}

export function BackgroundTypeTabs({
  background,
  isGradient,
  onSelectType,
}: BackgroundTypeTabsProps) {
  return (
    <div className="grid grid-cols-5 gap-0.5 rounded-md border border-border/60 bg-muted/30 p-0.5">
      {TYPE_TABS.map((tab) => {
        const Icon = tab.icon
        const active =
          tab.id === background.type || (tab.id === 'linear-gradient' && isGradient)
        return (
          <button
            key={tab.id}
            type="button"
            aria-label={tab.label}
            title={tab.label}
            onClick={() => onSelectType(tab.id)}
            className={cn(
              'flex flex-col items-center justify-center gap-0.5 rounded-[5px] py-1.5 transition',
              active
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-card/60 hover:text-foreground',
            )}
          >
            <Icon size={14} strokeWidth={active ? 2.25 : 2} />
            <span className="text-[9px] font-medium leading-none">{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}
