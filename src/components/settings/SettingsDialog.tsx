import * as Dialog from '@radix-ui/react-dialog'
import { useSettingsStore } from '@/stores/settings-store'
import { SliderField } from '@/components/ui/SliderField'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { ThemeMode } from '@/lib/types'

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onShowShortcuts?: () => void
}

export function SettingsDialog({ open, onOpenChange, onShowShortcuts }: SettingsDialogProps) {
  const preferences = useSettingsStore((state) => state.preferences)
  const setTheme = useSettingsStore((state) => state.setTheme)
  const updateWorkspace = useSettingsStore((state) => state.updateWorkspace)
  const updateExport = useSettingsStore((state) => state.updateExport)

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 max-h-[85vh] w-[min(92vw,560px)] -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-xl border border-border bg-card p-6 shadow-xl">
          <Dialog.Title className="text-lg font-semibold">Settings</Dialog.Title>
          <div className="mt-4 space-y-6">
            <section className="space-y-3">
              <h3 className="text-sm font-medium">Theme</h3>
              <select
                className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm"
                value={preferences.theme}
                onChange={(event) => setTheme(event.target.value as ThemeMode)}
              >
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-medium">Workspace</h3>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={preferences.workspace.showGrid}
                  onChange={(event) => updateWorkspace({ showGrid: event.target.checked })}
                />
                Show grid
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={preferences.workspace.showSmartGuides}
                  onChange={(event) => updateWorkspace({ showSmartGuides: event.target.checked })}
                />
                Smart guides
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={preferences.workspace.canvasCheckerboard}
                  onChange={(event) =>
                    updateWorkspace({ canvasCheckerboard: event.target.checked })
                  }
                />
                Checkerboard canvas
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={preferences.workspace.showRulers}
                  onChange={(event) => updateWorkspace({ showRulers: event.target.checked })}
                />
                Show rulers
              </label>
              <SliderField
                label="Default zoom"
                value={Math.round(preferences.workspace.defaultZoom * 100)}
                min={10}
                max={100}
                onChange={(value) => updateWorkspace({ defaultZoom: value / 100 })}
              />
              <SliderField
                label="Grid size"
                value={preferences.workspace.gridSize}
                min={10}
                max={80}
                onChange={(gridSize) => updateWorkspace({ gridSize })}
              />
              <SliderField
                label="Snap sensitivity"
                value={preferences.workspace.snapSensitivity}
                min={1}
                max={20}
                onChange={(snapSensitivity) => updateWorkspace({ snapSensitivity })}
              />
              <SliderField
                label="Nudge step"
                value={preferences.workspace.nudgeStep}
                min={1}
                max={20}
                onChange={(nudgeStep) => updateWorkspace({ nudgeStep })}
              />
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-medium">Export defaults</h3>
              <Input
                aria-label="Filename pattern"
                value={preferences.export.fileNamePattern}
                onChange={(event) => updateExport({ fileNamePattern: event.target.value })}
              />
              <SliderField
                label="JPEG quality"
                value={Math.round(preferences.export.jpegQuality * 100)}
                min={50}
                max={100}
                onChange={(value) => updateExport({ jpegQuality: value / 100 })}
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={preferences.export.transparentBackground}
                  onChange={(event) =>
                    updateExport({ transparentBackground: event.target.checked })
                  }
                />
                Transparent background
              </label>
            </section>

            <div className="flex justify-between">
              {onShowShortcuts && (
                <Button variant="ghost" onClick={onShowShortcuts}>
                  Keyboard shortcuts
                </Button>
              )}
              <Button onClick={() => onOpenChange(false)}>Done</Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
