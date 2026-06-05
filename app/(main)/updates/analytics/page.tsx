'use client'
import { useState, useEffect } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BarChart3, User, Link2, Trophy, ClipboardList, TrendingUp, CheckCircle, Clock, RefreshCw } from 'lucide-react'

function formatDuration(seconds: number): string {
  if (!seconds) return '—'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m === 0) return `${s}s`
  return `${m}m ${s}s`
}
import { toast } from 'sonner'

export const dynamic = 'force-dynamic'

interface Summary {
  total_attempts: number
  total_examinees: number
  overall_avg: number
  total_passed: number
}

interface AgentRow {
  examinee_name: string
  total_attempts: number
  avg_pct: number
  best_pct: number
  passed: number
  last_attempt: string
  avg_duration_seconds: number
}

interface LinkRow {
  share_token: string
  question_count: number
  document_title: string
  created_at: string
  total_attempts: number
  avg_pct: number
  passed: number
  avg_duration_seconds: number
}

function ScoreBadge({ pct }: { pct: number }) {
  const p = Math.round(pct ?? 0)
  if (p >= 80) return <Badge className="bg-green-100 text-green-700 border-green-200">{p}%</Badge>
  if (p >= 70) return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">{p}%</Badge>
  return <Badge className="bg-red-100 text-red-700 border-red-200">{p}%</Badge>
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string | number; color: string }) {
  return (
    <div className="border rounded-xl p-5 bg-card flex items-center gap-4">
      <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-bold">{value ?? '—'}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  )
}

export default function UpdatesAnalyticsPage() {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [byAgent, setByAgent] = useState<AgentRow[]>([])
  const [byLink, setByLink] = useState<LinkRow[]>([])
  const [loading, setLoading] = useState(true)
  const [origin, setOrigin] = useState('')

  function loadData() {
    setLoading(true)
    fetch('/api/updates/analytics')
      .then(async r => {
        const d = await r.json()
        if (!r.ok) throw new Error(d.error ?? `HTTP ${r.status}`)
        setSummary(d.summary)
        setByAgent(d.byAgent ?? [])
        setByLink(d.byLink ?? [])
      })
      .catch(err => toast.error(`Analytics error: ${err.message}`))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    setOrigin(window.location.origin)
    loadData()
  }, [])

  if (loading) return <div className="py-20 text-center text-sm text-muted-foreground">Loading analytics…</div>

  const passRate = summary?.total_attempts
    ? Math.round((Number(summary.total_passed) / Number(summary.total_attempts)) * 100)
    : 0

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Exam Analytics</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Performance breakdown by agent and exam link</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={ClipboardList} label="Total Attempts"   value={Number(summary?.total_attempts ?? 0)} color="bg-blue-50 text-blue-600" />
        <StatCard icon={User}          label="Total Examinees"  value={Number(summary?.total_examinees ?? 0)} color="bg-violet-50 text-violet-600" />
        <StatCard icon={TrendingUp}    label="Overall Avg Score" value={`${Math.round(Number(summary?.overall_avg ?? 0))}%`} color="bg-green-50 text-green-600" />
        <StatCard icon={CheckCircle}   label="Pass Rate (≥70%)"  value={`${passRate}%`} color="bg-amber-50 text-amber-600" />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="agent">
        <TabsList>
          <TabsTrigger value="agent" className="gap-2"><User className="h-4 w-4" />By Agent</TabsTrigger>
          <TabsTrigger value="link"  className="gap-2"><Link2 className="h-4 w-4" />By Exam Link</TabsTrigger>
        </TabsList>

        {/* ── By Agent ── */}
        <TabsContent value="agent" className="mt-5">
          {byAgent.length === 0 ? (
            <div className="border rounded-xl p-12 text-center text-sm text-muted-foreground">No exam attempts yet.</div>
          ) : (
            <div className="border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    {['#', 'Agent Name', 'Exams Taken', 'Avg Score', 'Best Score', 'Passed', 'Avg Duration', 'Last Attempt'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {byAgent.map((row, i) => (
                    <tr key={row.examinee_name} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {i === 0 ? <Trophy className="h-4 w-4 text-amber-500" /> : i + 1}
                      </td>
                      <td className="px-4 py-3 font-medium">{row.examinee_name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{row.total_attempts}</td>
                      <td className="px-4 py-3"><ScoreBadge pct={row.avg_pct} /></td>
                      <td className="px-4 py-3"><ScoreBadge pct={row.best_pct} /></td>
                      <td className="px-4 py-3">
                        <span className="text-green-700 font-medium">{row.passed}</span>
                        <span className="text-muted-foreground">/{row.total_attempts}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />{formatDuration(row.avg_duration_seconds)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {row.last_attempt ? new Date(row.last_attempt).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        {/* ── By Exam Link ── */}
        <TabsContent value="link" className="mt-5">
          {byLink.length === 0 ? (
            <div className="border rounded-xl p-12 text-center text-sm text-muted-foreground">No exams generated yet.</div>
          ) : (
            <div className="border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    {['Document', 'Questions', 'Attempts', 'Avg Score', 'Passed', 'Pass Rate', 'Avg Duration', 'Created', 'Link'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {byLink.map(row => {
                    const rate = row.total_attempts ? Math.round((Number(row.passed) / Number(row.total_attempts)) * 100) : 0
                    return (
                      <tr key={row.share_token} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 font-medium max-w-[160px] truncate">{row.document_title}</td>
                        <td className="px-4 py-3">
                          <Badge variant="secondary">{row.question_count}-item</Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{row.total_attempts}</td>
                        <td className="px-4 py-3">
                          {row.total_attempts ? <ScoreBadge pct={row.avg_pct} /> : <span className="text-muted-foreground text-xs">—</span>}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{row.passed ?? 0}</td>
                        <td className="px-4 py-3">
                          {row.total_attempts ? (
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                                <div className="h-full bg-green-500 rounded-full" style={{ width: `${rate}%` }} />
                              </div>
                              <span className="text-xs text-muted-foreground">{rate}%</span>
                            </div>
                          ) : <span className="text-muted-foreground text-xs">—</span>}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />{formatDuration(row.avg_duration_seconds)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {new Date(row.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <a
                            href={`${origin}/exam/${row.share_token}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline font-mono"
                          >
                            /exam/{row.share_token}
                          </a>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
