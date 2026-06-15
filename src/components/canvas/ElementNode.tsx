import { memo, useEffect, useMemo, useRef } from 'react'
import Konva from 'konva'
import { Group, Image as KonvaImage, Line, Rect, RegularPolygon, Text, Circle } from 'react-konva'
import useImage from 'use-image'
import { clearKonvaImageCache } from '@/lib/canvas/konva-lifecycle'
import { getElementShadowProps, getGradientProps } from '@/lib/canvas/helpers'
import { getCachedDeviceComposite } from '@/lib/canvas/perf/device-composite-cache'
import type { DeviceElement, Element, ImageElement, ShapeElement, TextElement } from '@/lib/types'

interface NodeCallbacks {
  onSelect: (id: string, additive: boolean) => void
  onChange: (id: string, patch: Partial<Element>) => void
  onDragMove?: (id: string, node: Konva.Node) => void
  onStartTextEdit?: (id: string) => void
}

interface ElementNodeProps extends NodeCallbacks {
  element: Element
  selected: boolean
  assetResolver: (assetId?: string) => string | undefined
  editingTextId?: string | null
  draggable?: boolean
}

function ImageNode({
  element,
  assetResolver,
  draggable = !element.locked,
  ...props
}: {
  element: ImageElement
  assetResolver: (assetId?: string) => string | undefined
  draggable?: boolean
} & NodeCallbacks) {
  const src = element.src ?? assetResolver(element.assetId)
  const [image] = useImage(src ?? '', 'anonymous')
  const imageRef = useRef<Konva.Image>(null)

  const brightness = element.brightness ?? 0
  const contrast = element.contrast ?? 0
  const saturation = element.saturation ?? 0
  const blur = element.blur ?? 0
  const hasFilters = Boolean(brightness || contrast || saturation || blur)

  useEffect(() => {
    const node = imageRef.current
    if (!node) return
    if (!image || !hasFilters) {
      node.clearCache()
      node.filters([])
      node.getLayer()?.batchDraw()
      return
    }
    const filters: Array<typeof Konva.Filters.Brighten> = []
    if (brightness) filters.push(Konva.Filters.Brighten)
    if (contrast) filters.push(Konva.Filters.Contrast)
    if (saturation) filters.push(Konva.Filters.HSL)
    if (blur) filters.push(Konva.Filters.Blur)
    node.cache()
    node.filters(filters)
    node.brightness(brightness)
    node.contrast(contrast)
    node.saturation(saturation)
    node.blurRadius(blur)
    node.getLayer()?.batchDraw()

    return () => {
      clearKonvaImageCache(imageRef.current)
    }
  }, [image, hasFilters, brightness, contrast, saturation, blur, element.width, element.height])

  return (
    <Group
      id={element.id}
      x={element.x}
      y={element.y}
      width={element.width}
      height={element.height}
      rotation={element.rotation}
      opacity={element.opacity}
      visible={element.visible}
      draggable={draggable}
      onClick={(event) => props.onSelect(element.id, event.evt.shiftKey)}
      onTap={(event) => props.onSelect(element.id, event.evt.shiftKey)}
      onDragMove={(event) => props.onDragMove?.(element.id, event.target)}
      onDragEnd={(event) => {
        props.onChange(element.id, {
          x: event.target.x(),
          y: event.target.y(),
        })
      }}
      onTransformEnd={(event) => {
        const node = event.target
        props.onChange(element.id, {
          x: node.x(),
          y: node.y(),
          width: Math.max(20, node.width() * node.scaleX()),
          height: Math.max(20, node.height() * node.scaleY()),
          rotation: node.rotation(),
        })
        node.scaleX(1)
        node.scaleY(1)
      }}
      {...getElementShadowProps(element)}
    >
      <KonvaImage
        ref={imageRef}
        image={image}
        width={element.width}
        height={element.height}
        cornerRadius={element.cornerRadius}
        scaleX={element.flipX ? -1 : 1}
        scaleY={element.flipY ? -1 : 1}
        x={element.flipX ? element.width : 0}
        y={element.flipY ? element.height : 0}
        perfectDrawEnabled={false}
      />
      {element.borderWidth > 0 && (
        <Rect
          width={element.width}
          height={element.height}
          stroke={element.borderColor}
          strokeWidth={element.borderWidth}
          cornerRadius={element.cornerRadius}
          listening={false}
          perfectDrawEnabled={false}
        />
      )}
    </Group>
  )
}

function DeviceNode({
  element,
  assetResolver,
  draggable = !element.locked,
  ...props
}: {
  element: DeviceElement
  assetResolver: (assetId?: string) => string | undefined
  draggable?: boolean
} & NodeCallbacks) {
  const screenshotSrc = assetResolver(element.screenshotAssetId)
  const [screenshot] = useImage(screenshotSrc ?? '', 'anonymous')
  const screenshotKey = element.screenshotAssetId ?? screenshotSrc ?? ''
  const deviceImageRef = useRef<Konva.Image>(null)

  const composite = useMemo(
    () => getCachedDeviceComposite(element, screenshot, screenshotKey, 2),
    [element, screenshot, screenshotKey],
  )

  useEffect(() => {
    deviceImageRef.current?.getLayer()?.batchDraw()
  }, [composite, screenshot])

  if (!composite) return null

  return (
    <Group
      id={element.id}
      x={element.x}
      y={element.y}
      width={element.width}
      height={element.height}
      rotation={element.rotation}
      opacity={element.opacity}
      visible={element.visible}
      draggable={draggable}
      onClick={(event) => props.onSelect(element.id, event.evt.shiftKey)}
      onTap={(event) => props.onSelect(element.id, event.evt.shiftKey)}
      onDragMove={(event) => props.onDragMove?.(element.id, event.target)}
      onDragEnd={(event) => {
        props.onChange(element.id, {
          x: event.target.x(),
          y: event.target.y(),
        })
      }}
      onTransformEnd={(event) => {
        const node = event.target
        props.onChange(element.id, {
          x: node.x(),
          y: node.y(),
          width: Math.max(80, node.width() * node.scaleX()),
          height: Math.max(120, node.height() * node.scaleY()),
          rotation: node.rotation(),
        })
        node.scaleX(1)
        node.scaleY(1)
      }}
      shadowColor="rgba(0,0,0,0.45)"
      shadowBlur={element.shadowSpread}
      shadowOpacity={element.shadowIntensity}
    >
      <KonvaImage
        ref={deviceImageRef}
        image={composite.canvas}
        x={composite.offsetX}
        y={composite.offsetY}
        width={composite.width}
        height={composite.height}
        perfectDrawEnabled={false}
      />
    </Group>
  )
}

function ElementNodeInner({
  element,
  assetResolver,
  onSelect,
  onChange,
  onDragMove,
  onStartTextEdit,
  editingTextId,
  draggable,
}: ElementNodeProps) {
  const isDraggable = draggable ?? !element.locked

  if (element.type === 'image') {
    return (
      <ImageNode
        element={element}
        assetResolver={assetResolver}
        draggable={isDraggable}
        onSelect={onSelect}
        onChange={onChange}
        onDragMove={onDragMove}
      />
    )
  }

  if (element.type === 'device') {
    return (
      <DeviceNode
        element={element}
        assetResolver={assetResolver}
        draggable={isDraggable}
        onSelect={onSelect}
        onChange={onChange}
        onDragMove={onDragMove}
      />
    )
  }

  const hasStroke =
    element.type === 'text'
      ? Boolean((element as TextElement).strokeWidth)
      : element.type === 'shape'
        ? Boolean((element as ShapeElement).strokeWidth)
        : false

  const commonProps = {
    id: element.id,
    x: element.x,
    y: element.y,
    width: element.width,
    height: element.height,
    rotation: element.rotation,
    opacity: element.opacity,
    visible: element.visible,
    draggable: isDraggable,
    listening: !element.locked,
    perfectDrawEnabled: hasStroke ? false : undefined,
    onClick: (event: { evt: { shiftKey: boolean } }) => onSelect(element.id, event.evt.shiftKey),
    onTap: (event: { evt: { shiftKey: boolean } }) => onSelect(element.id, event.evt.shiftKey),
    onDragMove: (event: { target: Konva.Node }) => onDragMove?.(element.id, event.target),
    onDragEnd: (event: { target: Konva.Node }) => {
      onChange(element.id, {
        x: event.target.x(),
        y: event.target.y(),
      })
    },
    onTransformEnd: (event: { target: Konva.Node }) => {
      const node = event.target
      onChange(element.id, {
        x: node.x(),
        y: node.y(),
        width: Math.max(4, node.width() * node.scaleX()),
        height: Math.max(4, node.height() * node.scaleY()),
        rotation: node.rotation(),
      })
      node.scaleX(1)
      node.scaleY(1)
    },
    ...getElementShadowProps(element),
  }

  if (element.type === 'text') {
    const text = element as TextElement
    const konvaFontStyle = [text.fontStyle === 'italic' ? 'italic' : '', String(text.fontWeight)]
      .filter(Boolean)
      .join(' ')
    return (
      <Text
        {...commonProps}
        visible={text.visible && editingTextId !== element.id}
        onDblClick={() => onStartTextEdit?.(element.id)}
        onDblTap={() => onStartTextEdit?.(element.id)}
        text={text.text}
        fontFamily={text.fontFamily}
        fontSize={text.fontSize}
        fontStyle={konvaFontStyle}
        fontVariant="normal"
        fill={text.fill}
        align={text.textAlign}
        verticalAlign={text.verticalAlign ?? 'top'}
        lineHeight={text.lineHeight}
        letterSpacing={text.letterSpacing}
        textDecoration={text.textDecoration}
        padding={text.padding ?? 0}
        stroke={text.stroke}
        strokeWidth={text.strokeWidth ?? 0}
        wrap="word"
      />
    )
  }

  if (element.type === 'shape') {
    const shape = element as ShapeElement
    const fill = shape.fill.type === 'solid' ? shape.fill.color : undefined
    const gradientProps = getGradientProps(shape.fill, shape.width, shape.height) ?? {}

    if (shape.shapeKind === 'circle') {
      return (
        <Circle
          {...commonProps}
          radius={Math.min(shape.width, shape.height) / 2}
          offsetX={-shape.width / 2}
          offsetY={-shape.height / 2}
          fill={fill}
          {...gradientProps}
          stroke={shape.stroke}
          strokeWidth={shape.strokeWidth}
        />
      )
    }

    if (shape.shapeKind === 'line') {
      return (
        <Line
          {...commonProps}
          points={[0, shape.height / 2, shape.width, shape.height / 2]}
          stroke={shape.stroke}
          strokeWidth={shape.strokeWidth}
          dash={shape.dash}
        />
      )
    }

    if (shape.shapeKind === 'triangle') {
      return (
        <RegularPolygon
          {...commonProps}
          sides={3}
          radius={Math.min(shape.width, shape.height) / 2}
          fill={fill}
          {...gradientProps}
          stroke={shape.stroke}
          strokeWidth={shape.strokeWidth}
        />
      )
    }

    return (
      <Rect
        {...commonProps}
        fill={fill}
        {...gradientProps}
        stroke={shape.stroke}
        strokeWidth={shape.strokeWidth}
        cornerRadius={shape.cornerRadius}
        dash={shape.dash}
      />
    )
  }

  return null
}

function elementPropsEqual(prev: ElementNodeProps, next: ElementNodeProps): boolean {
  return (
    prev.element === next.element &&
    prev.selected === next.selected &&
    prev.editingTextId === next.editingTextId &&
    prev.draggable === next.draggable
  )
}

export const ElementNode = memo(ElementNodeInner, elementPropsEqual)
