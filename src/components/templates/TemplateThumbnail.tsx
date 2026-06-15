import { useEffect, useRef, useState } from 'react'
import { renderTemplatePreview } from '@/lib/templates/preview'
import type { TemplateDefinition } from '@/lib/types'

interface TemplateThumbnailProps {
  template: TemplateDefinition
  className?: string
}

export function TemplateThumbnail({ template, className }: TemplateThumbnailProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const node = containerRef.current
    if (!node || previewUrl) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        observer.disconnect()
        void renderTemplatePreview(template)
          .then((url) => setPreviewUrl(url))
          .catch(() => setFailed(true))
      },
      { rootMargin: '120px' },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [template, previewUrl])

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden bg-muted ${className ?? ''}`}
    >
      {previewUrl ? (
        <img
          src={previewUrl}
          alt={template.name}
          loading="lazy"
          className="h-full w-full object-cover object-top transition duration-300 group-hover:scale-[1.02]"
        />
      ) : (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-b from-muted to-muted-foreground/10" />
      )}
      {failed && !previewUrl && (
        <div className="absolute inset-0 flex items-center justify-center text-[10px] text-muted-foreground">
          Preview unavailable
        </div>
      )}
    </div>
  )
}
