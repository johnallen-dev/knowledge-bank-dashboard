'use client'
import { useState, useEffect, useCallback } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import type { InventorySheet } from '@/lib/inventory/types'

interface RecountSelectorProps {
  isRecount: boolean
  originalSheetId: number | null
  originalSheetLabel: string
  onToggle: (isRecount: boolean) => void
  onSelect: (sheet: InventorySheet) => void
}

export function RecountSelector({ isRecount, originalSheetId, originalSheetLabel, onToggle, onSelect }: RecountSelectorProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<InventorySheet[]>([])
  const [loading, setLoading] = useState(false)

  const runSearch = useCallback(async (query: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ status: 'submitted', limit: '10' })
      if (query.trim()) params.set('search', query.trim())
      const res = await fetch(`/api/inventory/sheets?${params}`)
      const data = await res.json()
      setResults(data.sheets ?? [])
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    const timeout = setTimeout(() => runSearch(search), 250)
    return () => clearTimeout(timeout)
  }, [search, open, runSearch])

  return (
    <div className="space-y-2">
      <Label>Counted Again?</Label>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onToggle(false)}
          className={`border rounded-lg py-2 text-center text-sm transition-colors ${
            !isRecount ? 'border-primary bg-primary/5 text-primary font-semibold' : 'border-muted hover:border-primary/50 text-muted-foreground'
          }`}
        >
          No, first count
        </button>
        <button
          type="button"
          onClick={() => { onToggle(true); setOpen(true) }}
          className={`border rounded-lg py-2 text-center text-sm transition-colors ${
            isRecount ? 'border-primary bg-primary/5 text-primary font-semibold' : 'border-muted hover:border-primary/50 text-muted-foreground'
          }`}
        >
          Yes, this is a recount
        </button>
      </div>

      {isRecount && (
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen(o => !o)}
            className="w-full flex items-center gap-2 border rounded-md px-3 py-2 text-sm text-left"
          >
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className={originalSheetId ? '' : 'text-muted-foreground'}>
              {originalSheetId ? originalSheetLabel : 'Search original sheet by Sheet No. or location…'}
            </span>
          </button>

          {open && (
            <div className="absolute z-20 mt-1 w-full bg-white border rounded-md shadow-lg max-h-64 overflow-y-auto">
              <div className="p-2 border-b">
                <Input
                  autoFocus
                  placeholder="Search…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              {loading ? (
                <div className="p-3 text-xs text-muted-foreground">Searching…</div>
              ) : results.length === 0 ? (
                <div className="p-3 text-xs text-muted-foreground">No submitted sheets found.</div>
              ) : (
                results.map(sheet => (
                  <button
                    key={sheet.id}
                    type="button"
                    onClick={() => { onSelect(sheet); setOpen(false) }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-muted/50 border-b last:border-b-0"
                  >
                    <span className="font-semibold">{sheet.sheet_no}</span>
                    {' — '}{sheet.building}, {sheet.location_label}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
