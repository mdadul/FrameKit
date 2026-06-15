import { X } from 'lucide-react'
import { ELEMENT_TYPE_META } from '@/lib/elements/element-meta'
import { useSelectedElements } from '@/hooks/useSelectedElements'
import { usePersistAssetUpload } from '@/hooks/usePersistAssetUpload'
import {
  isDeviceElement,
  isImageElement,
  isShapeElement,
  isTextElement,
} from '@/lib/elements/element-meta'
import { useProjectStore } from '@/stores/project-store'
import { useEditorStore } from '@/stores/editor-store'
import { ElementTransformSection } from '@/components/panels/properties/ElementTransformSection'
import { MultiSelectionProperties } from '@/components/panels/properties/MultiSelectionProperties'
import { ScreenOnlyProperties } from '@/components/panels/properties/ScreenOnlyProperties'
import { TextPropertiesSection } from '@/components/panels/properties/TextPropertiesSection'
import { ShapePropertiesSection } from '@/components/panels/properties/ShapePropertiesSection'
import { ImagePropertiesSection } from '@/components/panels/properties/ImagePropertiesSection'
import { DevicePropertiesSection } from '@/components/panels/properties/DevicePropertiesSection'
import { ElementEffectsSection } from '@/components/panels/properties/ElementEffectsSection'
import type { Element } from '@/lib/types'

function usePropertiesContext() {
  const screen = useProjectStore((state) => state.getActiveScreen())
  const selectedElements = useSelectedElements()

  if (!screen) {
    return { subtitle: '', contextLabel: null as string | null }
  }

  if (selectedElements.length === 0) {
    return { subtitle: screen.name, contextLabel: 'Screen' }
  }

  if (selectedElements.length > 1) {
    return {
      subtitle: `${selectedElements.length} layers`,
      contextLabel: 'Selection',
    }
  }

  const meta = ELEMENT_TYPE_META[selectedElements[0].type]
  return {
    subtitle: selectedElements[0].name || meta.label,
    contextLabel: meta.label,
  }
}

export function PropertiesPanelHeader({ onClose }: { onClose: () => void }) {
  const { subtitle, contextLabel } = usePropertiesContext()

  return (
    <div className="flex shrink-0 items-center justify-between border-b border-border/60 px-3 py-2">
      <div className="min-w-0">
        <p className="text-[13px] font-semibold leading-tight text-foreground">Design</p>
        {subtitle ? (
          <div className="mt-0.5 flex min-w-0 items-center gap-1.5">
            {contextLabel ? (
              <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                {contextLabel}
              </span>
            ) : null}
            <p className="truncate text-[11px] text-muted-foreground">{subtitle}</p>
          </div>
        ) : null}
      </div>
      <button
        type="button"
        aria-label="Collapse properties"
        title="Collapse properties"
        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={onClose}
      >
        <X size={14} />
      </button>
    </div>
  )
}

export function PropertiesPanel() {
  const screen = useProjectStore((state) => state.getActiveScreen())
  const updateElement = useProjectStore((state) => state.updateElement)
  const uploadAsset = usePersistAssetUpload()
  const selectedElements = useSelectedElements()
  const selectedElementIds = useEditorStore((state) => state.selectedElementIds)

  const assignDeviceScreenshot = async (elementId: string, file: File) => {
    const asset = await uploadAsset(file, 'screenshot')
    updateElement(elementId, { screenshotAssetId: asset.id })
  }

  if (!screen) return null

  const element = selectedElements.length === 1 ? selectedElements[0] : null

  const updateSelected = (patch: Partial<Element>) => {
    for (const id of selectedElementIds) {
      updateElement(id, patch)
    }
  }

  if (!element && selectedElements.length > 1) {
    return (
      <MultiSelectionProperties
        selectedElements={selectedElements}
        screenBackground={screen.background}
        onUpdateSelected={updateSelected}
      />
    )
  }

  if (!element) {
    return <ScreenOnlyProperties background={screen.background} />
  }

  const updateElementPatch = (patch: Partial<Element>) => updateElement(element.id, patch)

  return (
    <div className="space-y-0 overflow-auto">
      <ElementTransformSection element={element} onUpdate={updateElementPatch} />

      {isTextElement(element) && (
        <TextPropertiesSection element={element} onChange={updateElementPatch} />
      )}

      {isShapeElement(element) && (
        <ShapePropertiesSection element={element} onUpdate={updateElementPatch} />
      )}

      {isImageElement(element) && (
        <ImagePropertiesSection element={element} onUpdate={updateElementPatch} />
      )}

      {isDeviceElement(element) && (
        <DevicePropertiesSection
          element={element}
          onUpdate={updateElementPatch}
          onUploadScreenshot={(file) => void assignDeviceScreenshot(element.id, file)}
        />
      )}

      <ElementEffectsSection element={element} onUpdate={updateElementPatch} />
    </div>
  )
}
