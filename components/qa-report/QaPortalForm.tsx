'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EXAMINEES } from '@/lib/updates/examinees'

const EMPTY_FORM = {
  date: '',
  agentName: '',
  chatEmailScore: '',
  callScore: '',
  chatEmailSummary: '',
  callSummary: '',
  remarks: '',
}

export function QaPortalForm() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [lastUniqueId, setLastUniqueId] = useState('')

  const today = new Date().toISOString().split('T')[0]

  function set(key: keyof typeof EMPTY_FORM, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.date || !form.agentName) {
      toast.error('Date and agent name are required')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/qa-report/audits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success(`QA audit submitted — Unique ID: ${data.uniqueId}`)
      setLastUniqueId(data.uniqueId)
      setForm(EMPTY_FORM)
    } catch {
      toast.error('Failed to submit QA audit')
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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="chatEmailScore">Chat/Email Audit Score</Label>
          <Input
            id="chatEmailScore"
            type="number"
            min={0}
            max={100}
            value={form.chatEmailScore}
            onChange={e => set('chatEmailScore', e.target.value)}
            placeholder="0–100"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="callScore">Call Audit Score</Label>
          <Input
            id="callScore"
            type="number"
            min={0}
            max={100}
            value={form.callScore}
            onChange={e => set('callScore', e.target.value)}
            placeholder="0–100"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="chatEmailSummary">Chat/Email Audit Summary</Label>
        <Textarea
          id="chatEmailSummary"
          value={form.chatEmailSummary}
          onChange={e => set('chatEmailSummary', e.target.value)}
          placeholder="Summary of the chat/email audit…"
          className="min-h-[100px]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="callSummary">Call Audit Summary</Label>
        <Textarea
          id="callSummary"
          value={form.callSummary}
          onChange={e => set('callSummary', e.target.value)}
          placeholder="Summary of the call audit…"
          className="min-h-[100px]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="remarks">Remarks</Label>
        <Textarea
          id="remarks"
          value={form.remarks}
          onChange={e => set('remarks', e.target.value)}
          placeholder="Any additional remarks…"
        />
      </div>

      <Button type="submit" disabled={saving}>
        {saving ? 'Submitting…' : 'Submit QA Audit'}
      </Button>
    </form>
  )
}
