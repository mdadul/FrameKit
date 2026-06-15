import * as Dialog from '@radix-ui/react-dialog'
import { useConfirmStore } from '@/stores/confirm-store'
import { Button } from '@/components/ui/Button'

export function ConfirmDialog() {
  const open = useConfirmStore((state) => state.open)
  const title = useConfirmStore((state) => state.title)
  const description = useConfirmStore((state) => state.description)
  const confirmLabel = useConfirmStore((state) => state.confirmLabel)
  const cancelLabel = useConfirmStore((state) => state.cancelLabel)
  const destructive = useConfirmStore((state) => state.destructive)
  const handleConfirm = useConfirmStore((state) => state.handleConfirm)
  const handleCancel = useConfirmStore((state) => state.handleCancel)

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) handleCancel()
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[90] bg-black/40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-[90] w-[min(420px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-5 shadow-xl">
          <Dialog.Title className="text-lg font-semibold text-foreground">{title}</Dialog.Title>
          {description && (
            <Dialog.Description className="mt-2 text-sm text-muted-foreground">
              {description}
            </Dialog.Description>
          )}
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="secondary" onClick={handleCancel}>
              {cancelLabel}
            </Button>
            <Button
              variant={destructive ? 'destructive' : 'default'}
              onClick={handleConfirm}
            >
              {confirmLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
