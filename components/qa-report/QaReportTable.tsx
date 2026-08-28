'use client'
import { useEffect, useState, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MultiAgentSelect } from './MultiAgentSelect'
import { AiAnalysisPanel } from './AiAnalysisPanel'
import { DeleteRecordButton } from './DeleteRecordButton'
import { EXAMINEES } from '@/lib/updates/examinees'
import { qaReportAuthHeader } from '@/lib/qaReport/auth'
import type { QaAudit, AuditType } from '@/lib/qaReport/types'

export function QaReportTable() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [agents, setAgents] = useState<string[]>([])
  const [auditType, setAuditType] = useState<AuditType>('all')
  const [audits, setAudits] = useState<QaAudit[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAudits = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (startDate) params.set('startDate', startDate)
      if (endDate) params.set('endDate', endDate)
      if (agents.length) params.set('agents', agents.join(','))
      if (auditType !== 'all') params.set('auditType', auditType)
      const res = await fetch(`/api/qa-report/audits?${params}`)
      const data = await res.json()
      setAudits(data.audits ?? [])
    } catch {
      setAudits([])
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate, agents, auditType])

  useEffect(() => { fetchAudits() }, [fetchAudits])

  const showChatEmail = auditType !== 'call'
  const showCall = auditType !== 'chat_email'

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
        <div className="space-y-2">
          <Label>Audit Type</Label>
          <Select value={auditType} onValueChange={v => setAuditType(v as AuditType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Audits</SelectItem>
              <SelectItem value="chat_email">Chat/Email Audit</SelectItem>
              <SelectItem value="call">Call Audit</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-muted-foreground">Loading QA audits…</div>
      ) : audits.length === 0 ? (
        <div className="py-12 text-center text-sm text-muted-foreground">No QA audits match the selected filters.</div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  {[
                    'Date', 'Agent',
                    ...(showChatEmail ? ['Chat/Email Score', 'Chat/Email Summary'] : []),
                    ...(showCall ? ['Call Score', 'Call Summary'] : []),
                    'Remarks', 'Unique ID', '',
                  ].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {audits.map(a => (
                  <tr key={a.unique_id} className="hover:bg-muted/20 transition-colors align-top">
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{a.audit_date}</td>
                    <td className="px-4 py-3 font-medium whitespace-nowrap">{a.agent_name}</td>
                    {showChatEmail && (
                      <>
                        <td className="px-4 py-3">
                          {a.chat_email_score != null ? <Badge variant={a.chat_email_score >= 70 ? 'success' : 'danger'}>{a.chat_email_score}</Badge> : '—'}
                        </td>
                        <td className="px-4 py-3 max-w-xs text-muted-foreground">{a.chat_email_summary || '—'}</td>
                      </>
                    )}
                    {showCall && (
                      <>
                        <td className="px-4 py-3">
                          {a.call_score != null ? <Badge variant={a.call_score >= 70 ? 'success' : 'danger'}>{a.call_score}</Badge> : '—'}
                        </td>
                        <td className="px-4 py-3 max-w-xs text-muted-foreground">{a.call_summary || '—'}</td>
                      </>
                    )}
                    <td className="px-4 py-3 max-w-xs text-muted-foreground">{a.remarks || '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground font-mono">{a.unique_id}</td>
                    <td className="px-4 py-3 text-right">
                      <DeleteRecordButton
                        recordLabel={`${a.agent_name} — ${a.audit_date}`}
                        targets={[{
                          key: 'qa',
                          label: 'QA Portal entry',
                          onDelete: async () => {
                            const res = await fetch(`/api/qa-report/audits?uniqueId=${encodeURIComponent(a.unique_id)}&recordType=normal`, {
                              method: 'DELETE',
                              headers: qaReportAuthHeader(),
                            })
                            if (!res.ok) throw new Error('Delete failed')
                          },
                        }]}
                        onDeleted={fetchAudits}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="border-t pt-6">
        <AiAnalysisPanel startDate={startDate || undefined} endDate={endDate || undefined} agentNames={agents} />
      </div>
    </div>
  )
}
