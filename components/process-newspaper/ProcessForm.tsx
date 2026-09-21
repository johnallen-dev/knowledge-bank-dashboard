'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RichTextEditor } from './RichTextEditor'
import { CATEGORY_LABELS } from '@/lib/processNewspaper/types'
import type { NewspaperProcess, ProcessCategory, DurationType } from '@/lib/processNewspaper/types'

interface ProcessFormProps {
  process?: NewspaperProcess
  onSaved: () => void
  onCancel: () => void
}

const EMPTY_FORM = {
  category: '' as ProcessCategory | '',
  title: '',
  content_html: '',
  duration_type: '' as DurationType | '',
  duration_start: '',
  duration_end: '',
  duration_note: '',
  special_note: '',
}

export function ProcessForm({ process, onSaved, onCancel }: ProcessFormProps) {
  const [form, setForm] = useState(() => process ? {
    category: process.category,
    title: process.title,
    content_html: process.content_html,
    duration_type: process.duration_type,
    duration_start: process.duration_start ?? '',
    duration_end: process.duration_end ?? '',
    duration_note: process.duration_note ?? '',
    special_note: process.special_note ?? '',
  } : EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  function set<K extends keyof typeof EMPTY_FORM>(key: K, value: typeof EMPTY_FORM[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!form.category) { toast.error('Category is required'); return }
    if (!form.title.trim()) { toast.error('Title is required'); return }
    if (!form.content_html.trim()) { toast.error('Process content is required'); return }
    if (!form.duration_type) { toast.error('Duration is required'); return }
    if (form.duration_type === 'date_range') {
      if (!form.duration_start || !form.duration_end) { toast.error('Start date and end date are required'); return }
      if (form.duration_end < form.duration_start) { toast.error('End date must not be earlier than start date'); return }
    }
    if (form.duration_type === 'other' && !form.duration_note.trim()) {
      toast.error('Please describe the applicable duration')
      return
    }

    setSaving(true)
    try {
      const url = process ? `/api/process-newspaper/processes/${process.id}` : '/api/process-newspaper/processes'
      const method = process ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save process')
      toast.success(process ? 'Process updated' : 'Process created')
      onSaved()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save process')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Category *</Label>
          <Select value={form.category} onValueChange={v => set('category', v as ProcessCategory)}>
            <SelectTrigger>
              <SelectValue placeholder="Select category…" />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(CATEGORY_LABELS) as ProcessCategory[]).map(c => (
                <SelectItem key={c} value={c}>{CATEGORY_LABELS[c]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={form.title}
            onChange={e => set('title', e.target.value)}
            placeholder="e.g. Booking.com Refund Requests"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Process Content *</Label>
        <RichTextEditor value={form.content_html} onChange={v => set('content_html', v)} />
      </div>

      <div className="space-y-2">
        <Label>Duration *</Label>
        <Select value={form.duration_type} onValueChange={v => set('duration_type', v as DurationType)}>
          <SelectTrigger>
            <SelectValue placeholder="Select duration…" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date_range">Choose a Date</SelectItem>
            <SelectItem value="fixed">Fixed</SelectItem>
            <SelectItem value="other">Others</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {form.duration_type === 'date_range' && (
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="duration_start">Start Date *</Label>
            <Input
              id="duration_start"
              type="date"
              value={form.duration_start}
              onChange={e => set('duration_start', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration_end">End Date *</Label>
            <Input
              id="duration_end"
              type="date"
              value={form.duration_end}
              onChange={e => set('duration_end', e.target.value)}
            />
          </div>
        </div>
      )}

      {form.duration_type === 'other' && (
        <div className="space-y-2">
          <Label htmlFor="duration_note">Duration Note *</Label>
          <Textarea
            id="duration_note"
            value={form.duration_note}
            onChange={e => set('duration_note', e.target.value)}
            placeholder='e.g. "Applicable only during the winter season."'
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="special_note">Special Note (optional)</Label>
        <Textarea
          id="special_note"
          value={form.special_note}
          onChange={e => set('special_note', e.target.value)}
          placeholder="Any additional reminders, exceptions, or warnings…"
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving…' : process ? 'Update Process' : 'Create Process'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  )
}
