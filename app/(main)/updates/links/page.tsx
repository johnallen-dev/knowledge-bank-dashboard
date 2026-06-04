'use client'
import { useState, useEffect } from 'react'
import { Copy, Check, ExternalLink, Link2, ClipboardList, Trash2, X, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export const dynamic = 'force-dynamic'

interface ExamRow {
  id: number
  share_token: string
  question_count: number
  document_title: string
  attempt_count: number
  created_at: string
}

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
            <h3 className="font-semibold">Delete Exam Link</h3>
          </div>
          <button onClick={onCancel} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground">
          You are about to permanently delete: <strong className="text-foreground">{label}</strong>.
          All exam attempts under this link will also be deleted. This cannot be undone.
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
          <Button variant="destructive" className="flex-1" disabled={!password || deleting} onClick={handleDelete}>
            {deleting ? 'Deleting…' : 'Delete'}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── Copy button ───────────────────────────────────────────────────────────────
function CopyButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    toast.success('Link copied!')
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <Button variant="ghost" size="icon" onClick={copy} className="h-8 w-8">
      {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
    </Button>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ExamLinksPage() {
  const [exams, setExams] = useState<ExamRow[]>([])
  const [loading, setLoading] = useState(true)
  const [origin, setOrigin] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; label: string } | null>(null)

  useEffect(() => {
    setOrigin(window.location.origin)
    fetchExams()
  }, [])

  function fetchExams() {
    setLoading(true)
    fetch('/api/updates/exams')
      .then(r => r.json())
      .then(d => setExams(d.exams ?? []))
      .catch(() => toast.error('Failed to load exam links'))
      .finally(() => setLoading(false))
  }

  async function handleDelete() {
    if (!deleteTarget) return
    const res = await fetch(`/api/updates/exams/${deleteTarget.id}`, {
      method: 'DELETE',
      headers: { Authorization: 'Bearer 00000' },
    })
    if (res.ok) {
      toast.success('Exam link deleted')
      setExams(prev => prev.filter(e => e.id !== deleteTarget.id))
    } else {
      toast.error('Failed to delete exam link')
    }
    setDeleteTarget(null)
  }

  return (
    <>
      {deleteTarget && (
        <DeleteDialog
          label={deleteTarget.label}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Link2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Generated Exam Links</h1>
            <p className="text-sm text-muted-foreground mt-0.5">All exams ever created — share or revisit anytime</p>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground py-12 text-center">Loading…</p>
        ) : exams.length === 0 ? (
          <div className="border rounded-xl p-12 text-center text-muted-foreground text-sm">
            No exams generated yet. Upload a document in the Updates page to create one.
          </div>
        ) : (
          <div className="border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  {['Document', 'Questions', 'Attempts', 'Created', 'Link', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {exams.map(exam => {
                  const url = `${origin}/exam/${exam.share_token}`
                  return (
                    <tr key={exam.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-medium max-w-[180px] truncate">{exam.document_title}</td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary">{exam.question_count}-item</Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <ClipboardList className="h-3 w-3" />
                          {exam.attempt_count}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {new Date(exam.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 max-w-[200px]">
                        <span className="text-xs font-mono text-muted-foreground truncate block">/exam/{exam.share_token}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <CopyButton url={url} />
                          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                            <a href={url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-red-50"
                            onClick={() => setDeleteTarget({
                              id: exam.id,
                              label: `${exam.document_title} (${exam.question_count}-item)`,
                            })}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
