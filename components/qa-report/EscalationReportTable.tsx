'use client'
import { useEffect, useState, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'
import { MultiAgentSelect } from './MultiAgentSelect'
import { StarRating } from './StarRating'
import { PasswordPromptModal } from './PasswordPromptModal'
import { DeleteRecordButton, type DeleteTarget } from './DeleteRecordButton'
import { EXAMINEES } from '@/lib/updates/examinees'
import { qaReportAuthHeader } from '@/lib/qaReport/auth'
import type { EscalationReportRow } from '@/lib/qaReport/types'

function buildDeleteTargets(row: EscalationReportRow): DeleteTarget[] {
  const targets: DeleteTarget[] = []
  if (row.has_qa) {
    targets.push({
      key: 'qa',
      label: 'QA Portal entry',
      onDelete: async () => {
        const res = await fetch(`/api/qa-report/audits?uniqueId=${encodeURIComponent(row.unique_id)}&recordType=escalation`, {
          method: 'DELETE',
          headers: qaReportAuthHeader(),
        })
        if (!res.ok) throw new Error('Delete failed')
      },
    })
  }
  if (row.has_feedback) {
    targets.push({
      key: 'feedback',
      label: 'Agent Portal entry',
      onDelete: async () => {
        const res = await fetch(`/api/qa-report/feedback?uniqueId=${encodeURIComponent(row.unique_id)}&recordType=escalation`, {
          method: 'DELETE',
          headers: qaReportAuthHeader(),
        })
        if (!res.ok) throw new Error('Delete failed')
      },
    })
  }
  return targets
}

function QaRatingCell({ row, revealed, onReveal }: { row: EscalationReportRow; revealed: boolean; onReveal: () => void }) {
  const [promptOpen, setPromptOpen] = useState(false)

  if (!row.has_feedback) {
    return <span className="text-muted-foreground italic text-xs">Pending Agent Response</span>
  }

  if (revealed) {
    return <StarRating value={row.qa_experience_rating ?? 0} readOnly size={14} />
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground italic">QA Rating: Hidden</span>
      <Button variant="outline" size="sm" className="h-6 px-2 text-xs gap-1" onClick={() => setPromptOpen(true)}>
        <Eye className="h-3 w-3" />
        Unhide Rating
      </Button>
      {promptOpen && (
        <PasswordPromptModal
          title="Unhide QA Rating"
          message="Enter the password to reveal this agent's QA experience rating."
          onSuccess={() => { onReveal(); setPromptOpen(false) }}
          onCancel={() => setPromptOpen(false)}
        />
      )}
    </div>
  )
}

export function EscalationReportTable() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [agents, setAgents] = useState<string[]>([])
  const [rows, setRows] = useState<EscalationReportRow[]>([])
  const [loading, setLoading] = useState(true)
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set())

  const fetchRows = useCallback(async () => {
    setLoading(true)
    setRevealedIds(new Set())
    try {
      const params = new URLSearchParams()
      if (startDate) params.set('startDate', startDate)
      if (endDate) params.set('endDate', endDate)
      if (agents.length) params.set('agents', agents.join(','))
      const res = await fetch(`/api/qa-report/escalation?${params}`)
      const data = await res.json()
      setRows(data.rows ?? [])
    } catch {
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate, agents])

  useEffect(() => { fetchRows() }, [fetchRows])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Start Date</Label>
          <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>End Date</Label>
          <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Agents</Label>
          <MultiAgentSelect agents={EXAMINEES} selected={agents} onChange={setAgents} />
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-muted-foreground">Loading escalation report…</div>
      ) : rows.length === 0 ? (
        <div className="py-12 text-center text-sm text-muted-foreground">No escalation records match the selected filters.</div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  {['Date', 'Agent', 'Escalation Score', 'Escalation Summary', 'QA Feedback', 'Improvement Plan', 'QA Rating', 'Unique ID', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map(r => (
                  <tr key={r.unique_id} className="hover:bg-muted/20 transition-colors align-top">
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{r.date}</td>
                    <td className="px-4 py-3 font-medium whitespace-nowrap">{r.agent_name}</td>
                    <td className="px-4 py-3">
                      {r.escalation_score != null ? <Badge variant={r.escalation_score <= 5 ? 'danger' : 'warning'}>{r.escalation_score}</Badge> : '—'}
                    </td>
                    <td className="px-4 py-3 max-w-xs text-muted-foreground">
                      {r.has_qa ? (r.escalation_summary || '—') : <span className="italic">Pending QA Audit</span>}
                    </td>
                    <td className="px-4 py-3 max-w-xs text-muted-foreground">
                      {r.has_feedback ? (r.qa_feedback || '—') : <span className="italic">Pending Agent Response</span>}
                    </td>
                    <td className="px-4 py-3 max-w-xs text-muted-foreground">
                      {r.has_feedback ? (r.personal_improvement_plan || '—') : <span className="italic">Pending Agent Response</span>}
                    </td>
                    <td className="px-4 py-3">
                      <QaRatingCell
                        row={r}
                        revealed={revealedIds.has(r.unique_id)}
                        onReveal={() => setRevealedIds(prev => new Set(prev).add(r.unique_id))}
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground font-mono">{r.unique_id}</td>
                    <td className="px-4 py-3 text-right">
                      <DeleteRecordButton
                        recordLabel={`${r.agent_name} — ${r.date}`}
                        targets={buildDeleteTargets(r)}
                        onDeleted={fetchRows}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
