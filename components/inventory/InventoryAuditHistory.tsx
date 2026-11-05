'use client'
import { useEffect, useState } from 'react'

interface FieldChange {
  field: string
  oldValue: string
  newValue: string
}

interface HistoryEntry {
  sheetNo: string
  sheetId: number
  eventType: string
  text: string
  actor: string | null
  eventAt: string
  changes?: FieldChange[]
}

export function InventoryAuditHistory({ sheetId }: { sheetId: number }) {
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/inventory/sheets/${sheetId}/history`)
      .then(res => res.json())
      .then(data => setHistory(data.history ?? []))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false))
  }, [sheetId])

  if (loading) return <div className="py-6 text-center text-sm text-muted-foreground">Loading history…</div>
  if (history.length === 0) return <div className="py-6 text-center text-sm text-muted-foreground">No history recorded yet.</div>

  return (
    <ol className="space-y-4 border-l pl-4">
      {history.map((entry, i) => (
        <li key={i} className="relative">
          <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-primary" />
          <p className="text-sm">{entry.text}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {new Date(entry.eventAt).toLocaleString()}{entry.actor ? ` · ${entry.actor}` : ''}
          </p>
          {entry.changes && entry.changes.length > 0 && (
            <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
              {entry.changes.map((c, j) => (
                <li key={j}>{c.field}: <span className="line-through opacity-70">{c.oldValue}</span> → <span className="text-foreground font-medium">{c.newValue}</span></li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ol>
  )
}
