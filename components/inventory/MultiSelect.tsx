'use client'
import { useEffect, useRef, useState } from 'react'
import { ChevronDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MultiSelectProps {
  label: string
  options: { value: string; label: string }[]
  selected: string[]
  onChange: (selected: string[]) => void
}

export function MultiSelect({ label, options, selected, onChange }: MultiSelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function toggle(value: string) {
    if (selected.includes(value)) onChange(selected.filter(v => v !== value))
    else onChange([...selected, value])
  }

  const triggerLabel = selected.length === 0
    ? `All ${label.toLowerCase()}`
    : selected.length === 1
      ? (options.find(o => o.value === selected[0])?.label ?? selected[0])
      : `${selected.length} ${label.toLowerCase()} selected`

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <span className={cn('truncate', selected.length === 0 && 'text-muted-foreground')}>{triggerLabel}</span>
        <div className="flex items-center gap-1 shrink-0">
          {selected.length > 0 && (
            <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" onClick={e => { e.stopPropagation(); onChange([]) }} />
          )}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </div>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full min-w-[12rem] rounded-md border bg-white shadow-md max-h-64 overflow-y-auto p-1">
          <button
            type="button"
            onClick={() => onChange([])}
            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent text-left font-medium"
          >
            All {label.toLowerCase()}
          </button>
          <div className="my-1 h-px bg-border" />
          {options.map(opt => (
            <label key={opt.value} className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent cursor-pointer">
              <input type="checkbox" checked={selected.includes(opt.value)} onChange={() => toggle(opt.value)} className="h-3.5 w-3.5" />
              {opt.label}
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
