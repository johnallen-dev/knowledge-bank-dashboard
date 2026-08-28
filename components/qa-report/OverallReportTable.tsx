'use client'
import { useEffect, useState, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { MultiAgentSelect } from './MultiAgentSelect'
import { StarRating } from './StarRating'
import { EXAMINEES } from '@/lib/updates/examinees'
import type { OverallReportRow } from '@/lib/qaReport/types'

export function OverallReportTable() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [agents, setAgents] = useState<string[]>([])
  const [rows, setRows] = useState<OverallReportRow[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRows = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (startDate) params.set('startDate', startDate)
      if (endDate) params.set('endDate', endDate)
      if (agents.length) params.set('agents', agents.join(','))
      const res = await fetch(`/api/qa-report/overall?${params}`)
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
        <div className="py-12 text-center text-sm text-muted-foreground">Loading overall report…</div>
      ) : rows.length === 0 ? (
        <div className="py-12 text-center text-sm text-muted-foreground">No records match the selected filters.</div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  {['Date', 'Agent', 'Chat/Email Score', 'Call Score', 'QA Rating', 'Status', 'Unique ID'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map(r => (
                  <tr key={r.unique_id} className="hover:bg-muted/20 transition-colors align-top">
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{r.date}</td>
                    <td className="px-4 py-3 font-medium whitespace-nowrap">{r.agent_name}</td>
                    <td className="px-4 py-3">{r.chat_email_score ?? '—'}</td>
                    <td className="px-4 py-3">{r.call_score ?? '—'}</td>
                    <td className="px-4 py-3">
                      {r.qa_experience_rating != null ? <StarRating value={r.qa_experience_rating} readOnly size={14} /> : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {r.has_qa && r.has_feedback ? (
                        <Badge variant="success">Complete</Badge>
                      ) : r.has_qa ? (
                        <Badge variant="warning">Missing Agent Report</Badge>
                      ) : (
                        <Badge variant="warning">Missing QA Report</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground font-mono">{r.unique_id}</td>
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
