import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface InlineEditProps {
  value: string
  onChange: (value: string) => void
  className?: string
  inputClassName?: string
  placeholder?: string
}

export function InlineEdit({
  value,
  onChange,
  className,
  inputClassName,
  placeholder = 'Untitled',
}: InlineEditProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!editing) setDraft(value)
  }, [value, editing])

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editing])

  const commit = () => {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== value) onChange(trimmed)
    else setDraft(value)
    setEditing(false)
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === 'Enter') commit()
          if (event.key === 'Escape') {
            setDraft(value)
            setEditing(false)
          }
        }}
        className={cn(
          'rounded-md border border-input bg-background px-2 py-0.5 text-sm outline-none focus:ring-2 focus:ring-ring',
          inputClassName,
        )}
        aria-label="Edit name"
      />
    )
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      title="Click to rename"
      className={cn(
        'truncate rounded-md px-1 py-0.5 text-left transition hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
    >
      {value || placeholder}
    </button>
  )
}
