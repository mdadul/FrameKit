export function isAdditiveSelection(event: {
  shiftKey: boolean
  metaKey: boolean
  ctrlKey: boolean
}): boolean {
  return event.shiftKey || event.metaKey || event.ctrlKey
}

export function isAdditiveKonvaPointerEvent(event: {
  evt: { shiftKey: boolean; metaKey: boolean; ctrlKey: boolean }
}): boolean {
  return isAdditiveSelection(event.evt)
}
