import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { createAssetObjectUrl } from '@/lib/assets/image-pipeline'
import { getImageFilesFromDataTransfer, hasImageFiles, isImageFile } from '@/lib/assets/drag-files'
import { persistProjectAsset } from '@/lib/assets/persist-project-asset'
import { deleteAsset, getProjectAssets } from '@/lib/db'
import { confirm } from '@/stores/confirm-store'
import { toast } from '@/stores/toast-store'
import { useEditorStore } from '@/stores/editor-store'
import { useProjectStore } from '@/stores/project-store'
import type { AssetRecord } from '@/lib/types'

const ASSET_ROW_HEIGHT = 72

export function useAssetLibrary() {
  const project = useProjectStore((state) => state.project)
  const assetUrls = useProjectStore((state) => state.assetUrls)
  const activeScreen = useProjectStore((state) => state.getActiveScreen())
  const selectedElementIds = useEditorStore((state) => state.selectedElementIds)
  const addImageFromAsset = useProjectStore((state) => state.addImageFromAsset)
  const registerAssetUrl = useProjectStore((state) => state.registerAssetUrl)
  const updateElement = useProjectStore((state) => state.updateElement)

  const [assets, setAssets] = useState<AssetRecord[]>([])
  const [query, setQuery] = useState('')
  const [uploadMode, setUploadMode] = useState<'library' | 'canvas'>('library')
  const [isDragging, setIsDragging] = useState(false)

  const parentRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragCounterRef = useRef(0)

  const loadAssets = useCallback(async () => {
    if (!project) return
    try {
      const records = await getProjectAssets(project.id)
      setAssets(records)
      records.forEach((asset) => registerAssetUrl(asset.id, createAssetObjectUrl(asset)))
    } catch (error) {
      console.error('Failed to load project assets', error)
      toast('Could not load assets', 'error')
    }
  }, [project, registerAssetUrl])

  useEffect(() => {
    void loadAssets()
  }, [loadAssets])

  const filtered = useMemo(
    () => assets.filter((asset) => asset.name.toLowerCase().includes(query.toLowerCase())),
    [assets, query],
  )

  const virtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ASSET_ROW_HEIGHT,
    overscan: 6,
  })

  const uploadFiles = useCallback(
    async (files: File[]) => {
      if (!project) return
      const imageFiles = files.filter(isImageFile)
      if (imageFiles.length === 0) return

      try {
        for (const file of imageFiles) {
          const asset = await persistProjectAsset(file, project.id, registerAssetUrl)
          const url = createAssetObjectUrl(asset)
          if (uploadMode === 'canvas') {
            addImageFromAsset(asset.id, url)
          }
        }
        await loadAssets()
      } catch (error) {
        console.error('Failed to upload assets', error)
        toast('Upload failed', 'error')
      }
    },
    [project, registerAssetUrl, addImageFromAsset, loadAssets, uploadMode],
  )

  const onUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files ?? [])
      await uploadFiles(files)
      event.target.value = ''
    },
    [uploadFiles],
  )

  const onDelete = useCallback(
    async (assetId: string) => {
      const confirmed = await confirm({
        title: 'Delete asset?',
        description:
          'This removes the asset from your library. Elements using it may appear broken.',
        confirmLabel: 'Delete',
        destructive: true,
      })
      if (!confirmed) return

      try {
        await deleteAsset(assetId)
        await loadAssets()
      } catch (error) {
        console.error('Failed to delete asset', error)
        toast('Could not delete asset', 'error')
      }
    },
    [loadAssets],
  )

  const onAddToCanvas = useCallback(
    (assetId: string) => {
      const url = assetUrls[assetId]
      if (!url) {
        toast('Asset preview is not ready yet', 'error')
        return
      }
      addImageFromAsset(assetId, url)
    },
    [assetUrls, addImageFromAsset],
  )

  const onAssignToDevice = useCallback(
    (assetId: string) => {
      const device = activeScreen?.elements.find(
        (item) => selectedElementIds.includes(item.id) && item.type === 'device',
      )
      if (!device) {
        toast('Select a device frame first', 'error')
        return
      }
      updateElement(device.id, { screenshotAssetId: assetId })
    },
    [activeScreen, selectedElementIds, updateElement],
  )

  const onDragEnter = useCallback((event: React.DragEvent) => {
    if (!hasImageFiles(event)) return
    event.preventDefault()
    dragCounterRef.current += 1
    setIsDragging(true)
  }, [])

  const onDragLeave = useCallback((event: React.DragEvent) => {
    if (!hasImageFiles(event)) return
    dragCounterRef.current -= 1
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0
      setIsDragging(false)
    }
  }, [])

  const onDragOver = useCallback((event: React.DragEvent) => {
    if (!hasImageFiles(event)) return
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
  }, [])

  const onDrop = useCallback(
    async (event: React.DragEvent) => {
      if (!hasImageFiles(event)) return
      event.preventDefault()
      dragCounterRef.current = 0
      setIsDragging(false)
      const files = getImageFilesFromDataTransfer(event.dataTransfer)
      await uploadFiles(files)
    },
    [uploadFiles],
  )

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const assetCountLabel =
    assets.length === 0
      ? 'Empty'
      : filtered.length === assets.length
        ? `${assets.length} asset${assets.length === 1 ? '' : 's'}`
        : `${filtered.length} of ${assets.length}`

  const showEmptyLibrary = assets.length === 0
  const showNoResults = !showEmptyLibrary && filtered.length === 0

  return {
    filtered,
    assetUrls,
    query,
    setQuery,
    uploadMode,
    setUploadMode,
    isDragging,
    parentRef,
    fileInputRef,
    virtualizer,
    assetCountLabel,
    showEmptyLibrary,
    showNoResults,
    onUpload,
    onDelete,
    onAddToCanvas,
    onAssignToDevice,
    onDragEnter,
    onDragLeave,
    onDragOver,
    onDrop,
    openFilePicker,
  }
}
