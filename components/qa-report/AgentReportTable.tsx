'use client'
import { useEffect, useState, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MultiAgentSelect } from './MultiAgentSelect'
import { StarRating } from './StarRating'
import { EXAMINEES } from '@/lib/updates/examinees'
import type { AgentFeedback } from '@/lib/qaReport/types'

export function AgentReportTable() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [agents, setAgents] = useState<string[]>([])
  const [feedback, setFeedback] = useState<AgentFeedback[]>([])
  const [loading, setLoading] = useState(true)

  const fetchFeedback = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (startDate) params.set('startDate', startDate)
      if (endDate) params.set('endDate', endDate)
      if (agents.length) params.set('agents', agents.join(','))
      const res = await fetch(`/api/qa-report/feedback?${params}`)
      const data = await res.json()
      setFeedback(data.feedback ?? [])
    } catch {
      setFeedback([])
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate, agents])

  useEffect(() => { fetchFeedback() }, [fetchFeedback])

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
        <div className="py-12 text-center text-sm text-muted-foreground">Loading agent feedback…</div>
      ) : feedback.length === 0 ? (
        <div className="py-12 text-center text-sm text-muted-foreground">No agent feedback matches the selected filters.</div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  {['Date', 'Agent', 'QA Feedback', 'Improvement Plan', 'Rating', 'Unique ID'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {feedback.map(f => (
                  <tr key={f.unique_id} className="hover:bg-muted/20 transition-colors align-top">
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{f.feedback_date}</td>
                    <td className="px-4 py-3 font-medium whitespace-nowrap">{f.agent_name}</td>
                    <td className="px-4 py-3 max-w-xs text-muted-foreground">{f.qa_feedback || '—'}</td>
                    <td className="px-4 py-3 max-w-xs text-muted-foreground">{f.personal_improvement_plan || '—'}</td>
                    <td className="px-4 py-3">
                      <StarRating value={f.qa_experience_rating ?? 0} readOnly size={14} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground font-mono">{f.unique_id}</td>
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
