interface BackgroundPreviewProps {
  previewUrl: string
  activeTypeLabel: string
}

export function BackgroundPreview({ previewUrl, activeTypeLabel }: BackgroundPreviewProps) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-border/70 bg-card">
      <div
        className="h-[72px] w-full bg-cover bg-center"
        style={{ backgroundImage: `url(${previewUrl})` }}
        role="img"
        aria-label={`${activeTypeLabel} background preview`}
      />
      <span className="absolute top-2 left-2 rounded bg-black/50 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
        {activeTypeLabel}
      </span>
    </div>
  )
}
