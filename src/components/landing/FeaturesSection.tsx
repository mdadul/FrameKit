import type { LucideIcon } from 'lucide-react'
import {
  Copy,
  Download,
  HardDrive,
  Layers,
  LayoutTemplate,
  Palette,
  Smartphone,
} from 'lucide-react'
import { TEMPLATES } from '@/lib/templates'
import { MAX_SCREENS } from '@/lib/constants'
import { DEVICES } from '@/lib/assets/devices'
import { STORE_PRESETS } from '@/lib/presets/store-sizes'

interface Feature {
  icon: LucideIcon
  title: string
  description: string
  highlight?: boolean
}

export const LANDING_FEATURES: Feature[] = [
  {
    icon: LayoutTemplate,
    title: `${TEMPLATES.length} templates`,
    description: 'App Store showcase layouts',
    highlight: true,
  },
  {
    icon: Smartphone,
    title: `${DEVICES.length} device frames`,
    description: 'iPhone, iPad, Pixel, Galaxy',
    highlight: true,
  },
  {
    icon: Download,
    title: 'Store export',
    description: `${STORE_PRESETS.length} size presets`,
    highlight: true,
  },
  {
    icon: Layers,
    title: `${MAX_SCREENS} screens`,
    description: 'Multi-screen projects',
  },
  {
    icon: Palette,
    title: 'Brand kit',
    description: 'Colors and fonts per project',
  },
  {
    icon: Copy,
    title: 'Copy to Android',
    description: 'Clone iOS, swap devices',
  },
  {
    icon: HardDrive,
    title: 'Local-first',
    description: 'Autosave in your browser',
  },
]

export const HIGHLIGHT_FEATURES = LANDING_FEATURES.filter((feature) => feature.highlight)

export function FeatureGrid({ className }: { className?: string }) {
  return (
    <ul className={`grid gap-3 md:grid-cols-2 lg:grid-cols-4 ${className ?? ''}`}>
      {LANDING_FEATURES.map((feature, index) => {
        const Icon = feature.icon
        const isWide = index === 0

        return (
          <li
            key={feature.title}
            className={`group flex gap-3 rounded-xl border px-3.5 py-3.5 backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md ${
              feature.highlight
                ? 'border-primary/20 bg-gradient-to-br from-primary/5 via-card/50 to-card/80 hover:border-primary/35'
                : 'border-border/40 bg-card/50 hover:border-primary/20 hover:bg-card/80'
            } ${isWide ? 'md:col-span-2 lg:col-span-2' : ''}`}
          >
            <span
              className={`flex shrink-0 items-center justify-center rounded-lg transition group-hover:scale-105 ${
                isWide ? 'h-12 w-12' : 'h-10 w-10'
              } ${
                feature.highlight
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-muted text-primary'
              }`}
            >
              <Icon size={isWide ? 20 : 17} />
            </span>
            <div className="min-w-0">
              <p className={`font-semibold leading-tight ${isWide ? 'text-base' : 'text-sm'}`}>
                {feature.title}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export function FeaturesSection() {
  return (
    <section className="border-t border-border/30 bg-background/50 py-12 lg:py-14">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Everything you need
        </p>
        <FeatureGrid className="mt-6" />
      </div>
    </section>
  )
}
