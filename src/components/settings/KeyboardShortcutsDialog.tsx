import * as Dialog from '@radix-ui/react-dialog'
import { Button } from '@/components/ui/Button'

const SHORTCUTS = [
  { keys: '⌘Z', action: 'Undo' },
  { keys: '⌘⇧Z / ⌘Y', action: 'Redo' },
  { keys: '⌘A', action: 'Select all' },
  { keys: '⌘C / ⌘X / ⌘V', action: 'Copy / Cut / Paste' },
  { keys: '⌥⌘C / ⌥⌘V', action: 'Copy / Paste style' },
  { keys: '⌘D', action: 'Duplicate' },
  { keys: '⌘G / ⌘⇧G', action: 'Group / Ungroup' },
  { keys: '⌘] / ⌘[', action: 'Bring forward / Send backward' },
  { keys: 'Delete / Backspace', action: 'Delete selection' },
  { keys: 'Arrow keys', action: 'Nudge (Shift = 10×)' },
  { keys: '⌘+ / ⌘-', action: 'Zoom in / out' },
  { keys: '⌘0', action: 'Fit active screen' },
  { keys: 'Alt ← / Alt →', action: 'Previous / next screen' },
  { keys: 'Space + drag', action: 'Pan canvas' },
  { keys: 'Scroll', action: 'Zoom at cursor' },
]

interface KeyboardShortcutsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function KeyboardShortcutsDialog({ open, onOpenChange }: KeyboardShortcutsDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 max-h-[85vh] w-[min(92vw,480px)] -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-xl border border-border bg-card p-6 shadow-xl">
          <Dialog.Title className="text-lg font-semibold">Keyboard shortcuts</Dialog.Title>
          <div className="mt-4 space-y-1">
            {SHORTCUTS.map((shortcut) => (
              <div
                key={shortcut.keys}
                className="flex items-center justify-between gap-4 rounded-md px-2 py-1.5 text-sm hover:bg-muted/50"
              >
                <span className="text-muted-foreground">{shortcut.action}</span>
                <kbd className="shrink-0 rounded border border-border bg-muted px-2 py-0.5 font-mono text-xs">
                  {shortcut.keys}
                </kbd>
              </div>
            ))}
          </div>
          <div className="mt-5 flex justify-end">
            <Button onClick={() => onOpenChange(false)}>Done</Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
