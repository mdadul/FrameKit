import type Konva from 'konva'

/** Drop cached bitmap data from image nodes (safe to call before reuse). */
export function clearKonvaImageCache(node: Konva.Image | null | undefined): void {
  if (!node) return
  node.clearCache()
  node.filters([])
}

/**
 * Permanently delete a node from the Konva engine.
 * Use destroy() when the node will not be reused; use remove() only when re-attaching later.
 */
export function destroyKonvaNode(node: Konva.Node | null | undefined): void {
  if (!node) return
  if ('clearCache' in node && typeof node.clearCache === 'function') {
    node.clearCache()
  }
  node.destroy()
}

/** Konva.Tween instances must be destroyed after usage to avoid memory leaks. */
export function destroyKonvaTween(tween: Konva.Tween | null | undefined): void {
  tween?.destroy()
}
