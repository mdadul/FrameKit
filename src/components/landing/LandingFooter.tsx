import { APP_NAME } from '@/lib/constants'

const CURRENT_YEAR = new Date().getFullYear()

export function LandingFooter() {
  return (
    <footer className="border-t border-border/40 bg-muted/20">
      <div className="mx-auto max-w-6xl px-6 py-6 text-center text-xs text-muted-foreground sm:text-left">
        <p>© {CURRENT_YEAR} {APP_NAME}. All rights reserved.</p>
      </div>
    </footer>
  )
}
