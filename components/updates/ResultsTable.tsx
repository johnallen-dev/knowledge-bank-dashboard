'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Search, Download, ExternalLink, Trash2, X, AlertTriangle, Clock, Filter, Eye, CheckCircle2, XCircle } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { ExamQuestion } from '@/lib/updates/types'

function formatDuration(seconds: number): string {
  if (!seconds) return '—'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m === 0) return `${s}s`
  return `${m}m ${s}s`
}
import { toast } from 'sonner'
import type { ExamAttempt } from '@/lib/updates/types'

// ── Password-protected delete dialog ─────────────────────────────────────────
function DeleteDialog({
  label,
  onConfirm,
  onCancel,
}: {
  label: string
  onConfirm: () => Promise<void>
  onCancel: () => void
}) {
  const [password, setPassword] = useState('')
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (password !== '00000') { toast.error('Incorrect password'); return }
    setDeleting(true)
    await onConfirm()
    setDeleting(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <h3 className="font-semibold">Delete Entry</h3>
          </div>
          <button onClick={onCancel} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground">
          You are about to permanently delete: <strong className="text-foreground">{label}</strong>. This cannot be undone.
        </p>
        <div className="space-y-2">
          <Label>Enter admin password to confirm</Label>
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleDelete()}
            autoFocus
          />
        </div>
        <div className="flex gap-2 pt-1">
          <Button variant="outline" className="flex-1" onClick={onCancel}>Cancel</Button>
          <Button
            variant="destructive"
            className="flex-1"
            disabled={!password || deleting}
            onClick={handleDelete}
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── Exam view modal ───────────────────────────────────────────────────────────
function ExamViewModal({
  examinee,
  examDate,
  score,
  maxScore,
  questions,
  answers,
  onClose,
}: {
  examinee: string
  examDate: string
  score: number
  maxScore: number
  questions: ExamQuestion[]
  answers: Record<string, string>
  onClose: () => void
}) {
  function isCorrect(q: ExamQuestion): boolean {
    const given = (answers[q.id] ?? '').trim().toLowerCase()
    if (!given) return false
    if (q.type === 'multiple_choice' || q.type === 'true_false') {
      return given === q.correct_answer.trim().toLowerCase()
    }
    // fill_blank
    const variants = [q.correct_answer, ...(q.acceptable_variants ?? [])].map(v => v.trim().toLowerCase())
    return variants.includes(given)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b">
          <div>
            <h3 className="font-semibold text-lg">Exam Review</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {examinee} · {examDate} · Score: <strong>{score}/{maxScore}</strong>
            </p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground mt-0.5">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Questions */}
        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
          {questions.map((q, i) => {
            const correct = isCorrect(q)
            const given = answers[q.id] ?? ''
            return (
              <div
                key={q.id}
                className={`rounded-lg border p-4 ${correct ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}
              >
                <div className="flex items-start gap-2">
                  {correct
                    ? <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    : <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      <span className="text-muted-foreground mr-1">Q{i + 1}.</span>{q.question}
                    </p>

                    {/* Options for MC/TF */}
                    {q.options && q.options.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {q.options.map(opt => {
                          const isAnswer = opt.trim().toLowerCase() === q.correct_answer.trim().toLowerCase()
                          const isGiven = opt.trim().toLowerCase() === given.trim().toLowerCase()
                          return (
                            <li
                              key={opt}
                              className={`text-xs px-2 py-1 rounded ${
                                isAnswer
                                  ? 'bg-green-100 text-green-700 font-medium'
                                  : isGiven && !isAnswer
                                  ? 'bg-red-100 text-red-600 line-through'
                                  : 'text-muted-foreground'
                              }`}
                            >
                              {opt}
                              {isAnswer && ' ✓'}
                              {isGiven && !isAnswer && ' (your answer)'}
                            </li>
                          )
                        })}
                      </ul>
                    )}

                    {/* Fill-blank answer */}
                    {(!q.options || q.options.length === 0) && (
                      <div className="mt-2 space-y-1 text-xs">
                        <p>
                          <span className="text-muted-foreground">Your answer: </span>
                          <span className={correct ? 'text-green-700 font-medium' : 'text-red-600 font-medium'}>
                            {given || '(no answer)'}
                          </span>
                        </p>
                        {!correct && (
                          <p>
                            <span className="text-muted-foreground">Correct answer: </span>
                            <span className="text-green-700 font-medium">{q.correct_answer}</span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="px-6 py-3 border-t flex justify-end">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  )
}

// ── Main table ────────────────────────────────────────────────────────────────
interface ExamOption { id: number; share_token: string; document_title: string; question_count: number }

export function ResultsTable() {
  const [attempts, setAttempts] = useState<ExamAttempt[]>([])
  const [search, setSearch] = useState('')
  const [examFilter, setExamFilter] = useState('all')
  const [examOptions, setExamOptions] = useState<ExamOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; label: string } | null>(null)
  const [viewTarget, setViewTarget] = useState<typeof attempts[0] | null>(null)

  useEffect(() => {
    fetchResults()
    // Load exam list for filter dropdown
    fetch('/api/updates/exams')
      .then(r => r.json())
      .then(d => setExamOptions(d.exams ?? []))
      .catch(() => {})
  }, [])

  async function fetchResults(q?: string) {
    setLoading(true)
    try {
      const params = q ? `?search=${encodeURIComponent(q)}` : ''
      const res = await fetch(`/api/updates/results${params}`, { headers: { Authorization: 'Bearer 00000' } })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setAttempts(data.attempts)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load results')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    const res = await fetch(`/api/updates/attempts/${deleteTarget.id}`, {
      method: 'DELETE',
      headers: { Authorization: 'Bearer 00000' },
    })
    if (res.ok) {
      toast.success('Entry deleted')
      setAttempts(prev => prev.filter(a => a.id !== deleteTarget.id))
    } else {
      toast.error('Failed to delete entry')
    }
    setDeleteTarget(null)
  }

  function handleSearch(val: string) {
    setSearch(val)
    fetchResults(val)
  }

  function exportCsv() {
    const headers = ['Name', 'Date', 'Score', 'Max', 'Document', 'Submitted']
    const rows = attempts.map(a => [
      a.examinee_name, a.exam_date, String(a.score), String(a.max_score),
      a.document_title ?? '', a.submitted_at,
    ])
    const csv = [headers, ...rows].map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'exam-results.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  // Apply exam link filter client-side
  const filtered = examFilter === 'all'
    ? attempts
    : attempts.filter(a => a.share_token === examFilter)

  if (loading) return <div className="py-12 text-center text-sm text-muted-foreground">Loading results…</div>
  if (error)   return <div className="py-12 text-center text-sm text-destructive">{error}</div>

  return (
    <>
      {deleteTarget && (
        <DeleteDialog
          label={deleteTarget.label}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
      {viewTarget && viewTarget.questions && (
        <ExamViewModal
          examinee={viewTarget.examinee_name}
          examDate={viewTarget.exam_date}
          score={viewTarget.score}
          maxScore={viewTarget.max_score}
          questions={viewTarget.questions}
          answers={viewTarget.answers}
          onClose={() => setViewTarget(null)}
        />
      )}

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or date…"
              value={search}
              onChange={e => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          {/* Exam link filter */}
          <div className="flex items-center gap-2 shrink-0">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={examFilter} onValueChange={setExamFilter}>
              <SelectTrigger className="w-52">
                <SelectValue placeholder="Filter by exam…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All exams</SelectItem>
                {examOptions.map(e => (
                  <SelectItem key={e.share_token} value={e.share_token}>
                    {e.document_title} ({e.question_count}-item)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" onClick={exportCsv} disabled={!filtered.length} className="shrink-0">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {filtered.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            {attempts.length === 0 ? 'No exam results yet.' : 'No results match the selected filter.'}
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    {['Examinee', 'Date', 'Score', 'Duration', 'Document', 'Exam Link', 'Submitted', 'Signature', 'Exam', ''].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map(a => (
                    <tr key={a.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-medium">{a.examinee_name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{a.exam_date}</td>
                      <td className="px-4 py-3">
                        <Badge variant={a.score / a.max_score >= 0.7 ? 'default' : 'secondary'}>
                          {a.score}/{a.max_score}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />{formatDuration(a.duration_seconds)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground max-w-[140px] truncate">{a.document_title}</td>
                      <td className="px-4 py-3">
                        {a.share_token && (
                          <a href={`/exam/${a.share_token}`} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-primary hover:underline">
                            <ExternalLink className="h-3 w-3" />
                            /exam/{a.share_token}
                          </a>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(a.submitted_at).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        {a.signature_b64 && (
                          <img src={a.signature_b64} alt="signature"
                            className="h-8 w-20 object-contain border rounded bg-white" />
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {a.questions && a.questions.length > 0 ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1 text-xs h-7"
                            onClick={() => setViewTarget(a)}
                          >
                            <Eye className="h-3 w-3" />
                            View
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm"
                            onClick={() => {
                              const blob = new Blob([JSON.stringify(a, null, 2)], { type: 'application/json' })
                              const url = URL.createObjectURL(blob)
                              const link = document.createElement('a')
                              link.href = url
                              link.download = `${a.examinee_name.replace(/\s+/g, '_')}_${a.exam_date}.json`
                              link.click()
                              URL.revokeObjectURL(url)
                            }}>
                            <Download className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-red-50"
                            onClick={() => setDeleteTarget({
                              id: a.id,
                              label: `${a.examinee_name} — ${a.exam_date}`,
                            })}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
