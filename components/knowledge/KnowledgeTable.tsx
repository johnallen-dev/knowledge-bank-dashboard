'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Edit, Archive, Eye, BookMarked } from 'lucide-react'

const NOTION_SOURCES = new Set(['notion', 'notion_export'])
import type { KnowledgeEntry } from '@/lib/db/queries/knowledge'
import type { Category } from '@/lib/db/queries/categories'
import { formatRelativeTime } from '@/lib/utils'

export function KnowledgeTable() {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([])
  const [total, setTotal] = useState(0)
  const [categories, setCategories] = useState<Category[]>([])
  const [q, setQ] = useState('')
  const [category, setCategory] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const LIMIT = 20

  const fetchCategories = useCallback(() => {
    fetch('/api/categories').then(r => r.json()).then(setCategories).catch(() => {})
  }, [])

  const fetchEntries = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (category) params.set('category', category)
    params.set('page', page.toString())
    params.set('limit', LIMIT.toString())
    fetch(`/api/knowledge?${params}`)
      .then(r => r.json())
      .then(data => { setEntries(data.entries ?? []); setTotal(data.total ?? 0) })
      .catch(() => toast.error('Failed to load entries'))
      .finally(() => setLoading(false))
  }, [q, category, page])

  useEffect(() => { fetchCategories() }, [fetchCategories])
  useEffect(() => { fetchEntries() }, [fetchEntries])

  async function archive(entry: KnowledgeEntry) {
    const isNotion = NOTION_SOURCES.has(entry.source_type)
    const message = isNotion
      ? `This entry was imported from Notion and is protected.\n\n"${entry.question.slice(0, 120)}"\n\nAre you sure you want to archive it?`
      : 'Archive this entry?'
    if (!confirm(message)) return
    const url = `/api/knowledge/${entry.id}${isNotion ? '?force=true' : ''}`
    const res = await fetch(url, { method: 'DELETE' })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      toast.error(data.error ?? 'Failed to archive')
      return
    }
    toast.success('Entry archived')
    fetchEntries()
  }

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-3">
        <Input
          placeholder="Search knowledge base..."
          value={q}
          onChange={e => { setQ(e.target.value); setPage(1) }}
          className="max-w-sm"
        />
        <Select value={category} onValueChange={v => { setCategory(v === 'all' ? '' : v); setPage(1) }}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map(c => (
              <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-sm text-muted-foreground py-8 text-center">Loading...</div>
      ) : entries.length === 0 ? (
        <div className="text-sm text-muted-foreground py-8 text-center">
          No entries found. <Link href="/knowledge-base/new" className="text-primary hover:underline">Add the first one.</Link>
        </div>
      ) : (
        <div className="border rounded-lg divide-y">
          {entries.map(entry => (
            <div key={entry.id} className="p-4 hover:bg-muted/30 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm line-clamp-1">{entry.question}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">{entry.answer}</p>
                  <div className="flex items-center gap-3 mt-2">
                    {entry.category_name && (
                      <Badge variant="outline" className="text-xs">{entry.category_name}</Badge>
                    )}
                    {JSON.parse(entry.tags ?? '[]').slice(0, 3).map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                    {NOTION_SOURCES.has(entry.source_type) && (
                      <Badge variant="outline" className="text-xs gap-1 text-[#e16259] border-[#e16259]/40">
                        <BookMarked className="h-3 w-3" />Notion
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">{formatRelativeTime(entry.updated_at)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                    <Link href={`/knowledge-base/${entry.id}`}><Eye className="h-4 w-4" /></Link>
                  </Button>
                  <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                    <Link href={`/knowledge-base/${entry.id}?edit=1`}><Edit className="h-4 w-4" /></Link>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => archive(entry)}>
                    <Archive className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{total} entries</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 1}>Previous</Button>
            <span className="px-2 py-1">Page {page} of {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>Next</Button>
          </div>
        </div>
      )}
    </div>
  )
}
