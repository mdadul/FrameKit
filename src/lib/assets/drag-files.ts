export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/')
}

export function hasImageFiles(event: React.DragEvent): boolean {
  return Array.from(event.dataTransfer.types).includes('Files')
}

export function getImageFilesFromDataTransfer(dataTransfer: DataTransfer): File[] {
  return Array.from(dataTransfer.files).filter(isImageFile)
}
