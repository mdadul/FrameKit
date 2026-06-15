import { useEffect } from 'react'
import { Outlet, createRootRoute } from '@tanstack/react-router'
import { useSettingsStore } from '@/stores/settings-store'
import { ToastContainer } from '@/components/ui/ToastContainer'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  const loadPreferences = useSettingsStore((state) => state.loadPreferences)

  useEffect(() => {
    void loadPreferences()
  }, [loadPreferences])

  return (
    <div className="min-h-full bg-background text-foreground">
      <Outlet />
      <ToastContainer />
      <ConfirmDialog />
    </div>
  )
}
