'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Download, ExternalLink } from 'lucide-react'
import type { ExamAttempt } from '@/lib/updates/types'

export function ResultsTable() {
  const [attempts, setAttempts] = useState<ExamAttempt[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchResults()
  }, [])

  async function fetchResults(q?: string) {
    setLoading(true)
    try {
      const params = q ? `?search=${encodeURIComponent(q)}` : ''
      const res = await fetch(`/api/updates/results${params}`, {
        headers: { Authorization: 'Bearer 00000' },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setAttempts(data.attempts)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load results')
    } finally {
      setLoading(false)
    }
  }

  function handleSearch(val: string) {
    setSearch(val)
    fetchResults(val)
  }

  function exportCsv() {
    const headers = ['Name', 'Date', 'Score', 'Max', 'Document', 'Submitted']
    const rows = attempts.map(a => [
      a.examinee_name,
      a.exam_date,
      String(a.score),
      String(a.max_score),
      a.document_title ?? '',
      a.submitted_at,
    ])
    const csv = [headers, ...rows].map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'exam-results.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return <div className="py-12 text-center text-sm text-muted-foreground">Loading results…</div>
  if (error) return <div className="py-12 text-center text-sm text-destructive">{error}</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or date…"
            value={search}
            onChange={e => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" onClick={exportCsv} disabled={!attempts.length}>
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {attempts.length === 0 ? (
        <div className="py-12 text-center text-sm text-muted-foreground">No exam results yet.</div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  {['Examinee', 'Date', 'Score', 'Document', 'Exam Link', 'Submitted', 'Signature', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {attempts.map(a => (
                  <tr key={a.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium">{a.examinee_name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{a.exam_date}</td>
                    <td className="px-4 py-3">
                      <Badge variant={a.score / a.max_score >= 0.7 ? 'default' : 'secondary'}>
                        {a.score}/{a.max_score}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground max-w-[160px] truncate">{a.document_title}</td>
                    <td className="px-4 py-3">
                      {a.share_token && (
                        <a
                          href={`/exam/${a.share_token}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          /exam/{a.share_token}
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(a.submitted_at).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      {a.signature_b64 && (
                        <img
                          src={a.signature_b64}
                          alt="signature"
                          className="h-8 w-20 object-contain border rounded bg-white"
                        />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const blob = new Blob([JSON.stringify(a, null, 2)], { type: 'application/json' })
                          const url = URL.createObjectURL(blob)
                          const link = document.createElement('a')
                          link.href = url
                          link.download = `${a.examinee_name.replace(/\s+/g, '_')}_${a.exam_date}.json`
                          link.click()
                          URL.revokeObjectURL(url)
                        }}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
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
