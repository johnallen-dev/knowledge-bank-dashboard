'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EXAMINEES } from '@/lib/updates/examinees'
import { StarRating } from './StarRating'
import type { RecordType } from '@/lib/qaReport/types'

const EMPTY_FORM = {
  date: '',
  agentName: '',
  recordType: 'normal' as RecordType,
  qaFeedback: '',
  personalImprovementPlan: '',
  qaExperienceRating: 0,
}

export function AgentPortalForm() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [lastUniqueId, setLastUniqueId] = useState('')

  const today = new Date().toISOString().split('T')[0]

  function set<K extends keyof typeof EMPTY_FORM>(key: K, value: typeof EMPTY_FORM[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.date || !form.agentName || !form.qaExperienceRating) {
      toast.error('Date, agent name, and a rating are required')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/qa-report/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success(`Feedback submitted — Unique ID: ${data.uniqueId}`)
      setLastUniqueId(data.uniqueId)
      setForm(EMPTY_FORM)
    } catch {
      toast.error('Failed to submit feedback')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {lastUniqueId && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-2 text-sm text-green-800">
          Last submission Unique ID: <strong>{lastUniqueId}</strong>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date *</Label>
          <Input
            id="date"
            type="date"
            value={form.date}
            max={today}
            onChange={e => set('date', e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Agent Name *</Label>
          <Select value={form.agentName} onValueChange={v => set('agentName', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select agent…" />
            </SelectTrigger>
            <SelectContent>
              {EXAMINEES.map(n => (
                <SelectItem key={n} value={n}>{n}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Type of Audit *</Label>
        <Select value={form.recordType} onValueChange={v => set('recordType', v as RecordType)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="normal">Normal Audit</SelectItem>
            <SelectItem value="escalation">Escalation Audit</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="qaFeedback">QA Feedback</Label>
        <Textarea
          id="qaFeedback"
          value={form.qaFeedback}
          onChange={e => set('qaFeedback', e.target.value)}
          placeholder="Your feedback on the QA audit…"
          className="min-h-[100px]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="personalImprovementPlan">Personal Improvement Plan</Label>
        <Textarea
          id="personalImprovementPlan"
          value={form.personalImprovementPlan}
          onChange={e => set('personalImprovementPlan', e.target.value)}
          placeholder="What will you work on going forward?"
          className="min-h-[100px]"
        />
      </div>

      <div className="space-y-2">
        <Label>QA Experience Rating *</Label>
        <StarRating value={form.qaExperienceRating} onChange={v => set('qaExperienceRating', v)} />
      </div>

      <Button type="submit" disabled={saving}>
        {saving ? 'Submitting…' : 'Submit Feedback'}
      </Button>
    </form>
  )
}
