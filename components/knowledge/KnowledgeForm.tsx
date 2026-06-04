'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { KnowledgeEntry } from '@/lib/db/queries/knowledge'
import type { Category } from '@/lib/db/queries/categories'

interface KnowledgeFormProps {
  entry?: KnowledgeEntry
  defaultQuestion?: string
}

export function KnowledgeForm({ entry, defaultQuestion }: KnowledgeFormProps) {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    question: entry?.question ?? defaultQuestion ?? '',
    answer: entry?.answer ?? '',
    category_id: entry?.category_id?.toString() ?? '',
    tags: entry ? JSON.parse(entry.tags ?? '[]').join(', ') : '',
    source_type: entry?.source_type ?? 'manual',
    source_url: entry?.source_url ?? '',
    change_note: '',
  })

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(setCategories).catch(() => {})
  }, [])

  function set(key: string, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.question.trim() || !form.answer.trim()) {
      toast.error('Question and answer are required')
      return
    }
    setSaving(true)
    try {
      const payload = {
        question: form.question.trim(),
        answer: form.answer.trim(),
        category_id: form.category_id ? Number(form.category_id) : null,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        source_type: form.source_type,
        source_url: form.source_url.trim() || null,
        ...(entry ? { change_note: form.change_note } : {}),
      }
      const url = entry ? `/api/knowledge/${entry.id}` : '/api/knowledge'
      const method = entry ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Failed to save')
      toast.success(entry ? 'Entry updated' : 'Entry created')
      router.push('/knowledge-base')
      router.refresh()
    } catch {
      toast.error('Failed to save entry')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="space-y-2">
        <Label htmlFor="question">Question *</Label>
        <Textarea
          id="question"
          value={form.question}
          onChange={e => set('question', e.target.value)}
          placeholder="What time is check-in?"
          className="min-h-[80px]"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="answer">Answer *</Label>
        <Textarea
          id="answer"
          value={form.answer}
          onChange={e => set('answer', e.target.value)}
          placeholder="Our standard check-in time starts at 3:00 PM..."
          className="min-h-[160px]"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={form.category_id} onValueChange={v => set('category_id', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select category..." />
            </SelectTrigger>
            <SelectContent>
              {categories.map(c => (
                <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Source type</Label>
          <Select value={form.source_type} onValueChange={v => set('source_type', v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manual">Manual</SelectItem>
              <SelectItem value="notion">Notion</SelectItem>
              <SelectItem value="ai_generated">AI Generated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Tags (comma separated)</Label>
        <Input
          id="tags"
          value={form.tags}
          onChange={e => set('tags', e.target.value)}
          placeholder="wifi, breakfast, parking"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="source_url">Source URL (optional)</Label>
        <Input
          id="source_url"
          type="url"
          value={form.source_url}
          onChange={e => set('source_url', e.target.value)}
          placeholder="https://notion.so/..."
        />
      </div>

      {entry && (
        <div className="space-y-2">
          <Label htmlFor="change_note">Change note (optional)</Label>
          <Input
            id="change_note"
            value={form.change_note}
            onChange={e => set('change_note', e.target.value)}
            placeholder="What was changed and why?"
          />
        </div>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving...' : entry ? 'Update Entry' : 'Create Entry'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
