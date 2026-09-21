'use client'
import { useEffect, useState, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, PlusCircle, Eye, Pencil } from 'lucide-react'
import { ProcessForm } from './ProcessForm'
import { ArticleModal } from './ArticleModal'
import { DeleteProcessButton } from './DeleteProcessButton'
import { CATEGORY_LABELS, STATUS_LABELS } from '@/lib/processNewspaper/types'
import { buildPreview } from '@/lib/processNewspaper/preview'
import type { NewspaperProcessWithStatus, ProcessCategory, ProcessStatus } from '@/lib/processNewspaper/types'

const STATUS_BADGE_VARIANT: Record<ProcessStatus, 'success' | 'secondary' | 'warning' | 'danger'> = {
  active: 'success',
  upcoming: 'secondary',
  expired: 'danger',
  disabled: 'warning',
}

type View = 'list' | 'create' | 'edit'

export function ProcessContentsList() {
  const [view, setView] = useState<View>('list')
  const [entries, setEntries] = useState<NewspaperProcessWithStatus[]>([])
  const [total, setTotal] = useState(0)
  const [q, setQ] = useState('')
  const [category, setCategory] = useState<ProcessCategory | 'all'>('all')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<NewspaperProcessWithStatus | undefined>(undefined)
  const [viewing, setViewing] = useState<NewspaperProcessWithStatus | null>(null)
  const limit = 20

  const fetchEntries = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (q.trim()) params.set('q', q.trim())
      if (category !== 'all') params.set('category', category)
      params.set('page', String(page))
      params.set('limit', String(limit))
      const res = await fetch(`/api/process-newspaper/processes?${params}`)
      const data = await res.json()
      setEntries(data.entries ?? [])
      setTotal(data.total ?? 0)
    } catch {
      setEntries([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [q, category, page])

  useEffect(() => { fetchEntries() }, [fetchEntries])

  function handleSaved() {
    setView('list')
    setEditing(undefined)
    fetchEntries()
  }

  if (view === 'create') {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Add New Process</h2>
        <ProcessForm onSaved={handleSaved} onCancel={() => setView('list')} />
      </div>
    )
  }

  if (view === 'edit' && editing) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Edit Process</h2>
        <ProcessForm process={editing} onSaved={handleSaved} onCancel={() => { setView('list'); setEditing(undefined) }} />
      </div>
    )
  }

  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <div className="space-y-4">
      {viewing && <ArticleModal process={viewing} onClose={() => setViewing(null)} />}

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Process Library</h2>
        <Button onClick={() => setView('create')} className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Add New Process
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title or content…"
            value={q}
            onChange={e => { setQ(e.target.value); setPage(1) }}
            className="pl-9"
          />
        </div>
        <Select value={category} onValueChange={v => { setCategory(v as ProcessCategory | 'all'); setPage(1) }}>
          <SelectTrigger className="sm:w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {(Object.keys(CATEGORY_LABELS) as ProcessCategory[]).map(c => (
              <SelectItem key={c} value={c}>{CATEGORY_LABELS[c]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-muted-foreground">Loading processes…</div>
      ) : entries.length === 0 ? (
        <div className="py-12 text-center text-sm text-muted-foreground">
          {total === 0 && !q && category === 'all' ? 'No processes yet — add your first one above.' : 'No processes match your search.'}
        </div>
      ) : (
        <div className="border rounded-lg divide-y">
          {entries.map(p => (
            <div key={p.id} className="flex items-start justify-between gap-4 px-4 py-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium truncate">{p.title}</p>
                  <Badge variant="outline" className="text-[10px]">{CATEGORY_LABELS[p.category]}</Badge>
                  <Badge variant={STATUS_BADGE_VARIANT[p.status]} className="text-[10px]">{STATUS_LABELS[p.status]}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1 truncate">{buildPreview(p.content_html, 140)}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button variant="ghost" size="sm" onClick={() => setViewing(p)}>
                  <Eye className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => { setEditing(p); setView('edit') }}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <DeleteProcessButton id={p.id} title={p.title} onDeleted={fetchEntries} />
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <span className="text-muted-foreground">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  )
}
