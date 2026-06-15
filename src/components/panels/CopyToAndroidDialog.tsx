import * as Dialog from '@radix-ui/react-dialog'
import { useEffect, useState } from 'react'
import { DEVICES } from '@/lib/assets/devices'
import { DEFAULT_ANDROID_DEVICE_ID } from '@/lib/assets/device-mapping'
import { renderScreenToDataUrl } from '@/lib/export/renderer'
import { cloneScreenForAndroid } from '@/lib/platform-copy'
import { Button } from '@/components/ui/Button'
import type { Screen } from '@/lib/types'

interface CopyToAndroidDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  screenCount: number
  includesIpadFrame: boolean
  targetDeviceId: string
  sourceScreen?: Screen | null
  assetResolver: (assetId?: string) => string | undefined
  onTargetDeviceChange: (deviceId: string) => void
  onConfirm: () => void
}

const ANDROID_DEVICES = DEVICES.filter((device) => device.platform === 'android')

export function CopyToAndroidDialog({
  open,
  onOpenChange,
  screenCount,
  includesIpadFrame,
  targetDeviceId,
  sourceScreen,
  assetResolver,
  onTargetDeviceChange,
  onConfirm,
}: CopyToAndroidDialogProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const selectedDevice =
    ANDROID_DEVICES.find((device) => device.id === targetDeviceId) ??
    ANDROID_DEVICES.find((device) => device.id === DEFAULT_ANDROID_DEVICE_ID)

  useEffect(() => {
    if (!open || !sourceScreen) {
      setPreviewUrl(null)
      return
    }
    let cancelled = false
    const preview = cloneScreenForAndroid(sourceScreen, targetDeviceId)
    void renderScreenToDataUrl({
      screen: preview,
      assetResolver,
      scale: 1,
      format: 'png',
    })
      .then((url) => {
        if (!cancelled) setPreviewUrl(url)
      })
      .catch(() => {
        if (!cancelled) setPreviewUrl(null)
      })
    return () => {
      cancelled = true
    }
  }, [open, sourceScreen, targetDeviceId, assetResolver])

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(420px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-5 shadow-xl">
          <Dialog.Title className="text-lg font-semibold text-foreground">
            Copy to Android
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-muted-foreground">
            {screenCount === 1
              ? 'Create an Android copy with the same content and swap iOS device frames to your chosen Android phone.'
              : `Create ${screenCount} Android copies with the same content and swap iOS device frames to your chosen Android phone.`}
          </Dialog.Description>

          <div className="mt-4 space-y-2">
            <label htmlFor="android-device" className="text-sm font-medium text-foreground">
              Android phone frame
            </label>
            <select
              id="android-device"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              value={targetDeviceId}
              onChange={(event) => onTargetDeviceChange(event.target.value)}
            >
              {ANDROID_DEVICES.map((device) => (
                <option key={device.id} value={device.id}>
                  {device.name}
                </option>
              ))}
            </select>
            {selectedDevice && (
              <p className="text-xs text-muted-foreground">
                Selected frame: {selectedDevice.name}
              </p>
            )}
          </div>

          {previewUrl && (
            <div className="mt-4 flex aspect-[9/16] max-h-40 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/40">
              <img
                src={previewUrl}
                alt="Android copy preview"
                className="max-h-full max-w-full object-contain"
              />
            </div>
          )}

          {includesIpadFrame && (
            <p className="mt-3 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-900 dark:text-amber-100">
              iPad frames will use the selected Android phone frame for this version.
            </p>
          )}

          <p className="mt-3 text-xs text-muted-foreground">
            Existing Android copies from the same iOS screens will be replaced.
          </p>

          <div className="mt-5 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                onConfirm()
                onOpenChange(false)
              }}
            >
              Copy {screenCount === 1 ? 'screen' : 'all screens'}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
