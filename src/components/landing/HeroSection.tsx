import { ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { FeatureGrid, HIGHLIGHT_FEATURES } from '@/components/landing/FeaturesSection'

interface HeroSectionProps {
  compact?: boolean
  projectCount?: number
  onNewProject?: () => void
}

export function HeroSection({ compact, projectCount = 0, onNewProject }: HeroSectionProps) {
  if (compact) {
    return (
      <section className="landing-gradient-bg relative overflow-hidden border-b border-border/40">
        <div className="pointer-events-none absolute inset-0 landing-gradient-orbs" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-6 py-5 sm:py-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground">
                {projectCount} project{projectCount === 1 ? '' : 's'} saved locally
              </p>
              <h2 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">
                <span className="brand-gradient-text">Store-ready screenshots</span>
                <span className="text-foreground">, built for speed.</span>
              </h2>
            </div>

            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <ul className="flex flex-wrap gap-2 lg:max-w-[28rem] lg:justify-end">
                {HIGHLIGHT_FEATURES.map((feature) => {
                  const Icon = feature.icon
                  return (
                    <li
                      key={feature.title}
                      className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/60 px-3 py-1.5 text-xs font-medium backdrop-blur"
                    >
                      <Icon size={13} className="shrink-0 text-primary" />
                      <span>{feature.title}</span>
                    </li>
                  )
                })}
              </ul>
              <a
                href="#projects"
                className="inline-flex items-center gap-1 text-sm font-medium text-primary transition hover:opacity-80"
              >
                Continue
                <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="landing-gradient-bg relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 landing-dot-grid opacity-60" aria-hidden />
      <div className="pointer-events-none absolute inset-0 landing-gradient-orbs" aria-hidden />

      <div className="relative mx-auto max-w-6xl px-6 py-10 lg:py-14">
        <div className="hero-fade-in max-w-2xl">
          <p className="brand-badge">
            <Sparkles size={12} />
            Free · Local · No account
          </p>

          <h1 className="mt-5 text-5xl font-bold leading-[1.02] tracking-tighter sm:text-6xl lg:text-[3.75rem]">
            <span className="brand-gradient-text">Store-ready screenshots</span>
            <span className="text-muted-foreground"> in minutes.</span>
          </h1>

          <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
            Design App Store and Play Store screenshots with device mockups, templates, and
            one-click export — everything stays on your machine.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button
              onClick={onNewProject}
              className="h-11 gap-2 rounded-xl px-5 shadow-sm shadow-primary/20"
            >
              Start a project
              <ArrowRight size={16} />
            </Button>
            <a
              href="#projects"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-border/60 bg-card/50 px-5 text-sm font-medium backdrop-blur transition hover:border-primary/30 hover:bg-card/80"
            >
              Browse templates
            </a>
          </div>
        </div>

        <div className="hero-fade-in hero-fade-in-delay mt-10 border-t border-border/30 pt-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Everything you need
          </p>
          <FeatureGrid className="mt-5" />
        </div>
      </div>
    </section>
  )
}
