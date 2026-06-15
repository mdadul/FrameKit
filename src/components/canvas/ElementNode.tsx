import { useEffect, useMemo, useRef } from 'react'
import Konva from 'konva'
import { Group, Image as KonvaImage, Line, Rect, RegularPolygon, Text, Circle } from 'react-konva'
import useImage from 'use-image'
import { getElementShadowProps, getGradientProps } from '@/lib/canvas/helpers'
import { renderDeviceComposite } from '@/lib/canvas/device-render'
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
}

function ImageNode({
  element,
  assetResolver,
  ...props
}: {
  element: ImageElement
  assetResolver: (assetId?: string) => string | undefined
} & NodeCallbacks) {
  const src = element.src ?? assetResolver(element.assetId)
  const [image] = useImage(src ?? '', 'anonymous')
  const imageRef = useRef<Konva.Image>(null)

  const brightness = element.brightness ?? 0
  const contrast = element.contrast ?? 0
  const saturation = element.saturation ?? 0
  const blur = element.blur ?? 0
  const hasFilters = Boolean(brightness || contrast || saturation || blur)

  // Konva filters require the node to be cached. Re-cache whenever the source
  // image, the filter values, or the node dimensions change.
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
      draggable={!element.locked}
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
      />
      {element.borderWidth > 0 && (
        <Rect
          width={element.width}
          height={element.height}
          stroke={element.borderColor}
          strokeWidth={element.borderWidth}
          cornerRadius={element.cornerRadius}
        />
      )}
    </Group>
  )
}

function DeviceNode({
  element,
  assetResolver,
  ...props
}: {
  element: DeviceElement
  assetResolver: (assetId?: string) => string | undefined
} & NodeCallbacks) {
  const screenshotSrc = assetResolver(element.screenshotAssetId)
  const [screenshot] = useImage(screenshotSrc ?? '', 'anonymous')

  const composite = useMemo(
    () => renderDeviceComposite(element, screenshot, 2),
    [element, screenshot],
  )

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
      draggable={!element.locked}
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
        image={composite.canvas}
        x={composite.offsetX}
        y={composite.offsetY}
        width={composite.width}
        height={composite.height}
      />
    </Group>
  )
}

export function ElementNode({
  element,
  assetResolver,
  onSelect,
  onChange,
  onDragMove,
  onStartTextEdit,
  editingTextId,
}: ElementNodeProps) {
  if (element.type === 'image') {
    return (
      <ImageNode
        element={element}
        assetResolver={assetResolver}
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
        onSelect={onSelect}
        onChange={onChange}
        onDragMove={onDragMove}
      />
    )
  }

  const commonProps = {
    id: element.id,
    x: element.x,
    y: element.y,
    width: element.width,
    height: element.height,
    rotation: element.rotation,
    opacity: element.opacity,
    visible: element.visible,
    draggable: !element.locked,
    onClick: (event: { evt: { shiftKey: boolean } }) => onSelect(element.id, event.evt.shiftKey),
    onTap: (event: { evt: { shiftKey: boolean } }) => onSelect(element.id, event.evt.shiftKey),
    onDragMove: (event: { target: Konva.Node }) => onDragMove?.(element.id, event.target),
    onDragEnd: (event: { target: { x: () => number; y: () => number } }) => {
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
