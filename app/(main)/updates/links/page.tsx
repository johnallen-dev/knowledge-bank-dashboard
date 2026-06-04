'use client'
import { useState, useEffect } from 'react'
import { Copy, Check, ExternalLink, Link2, ClipboardList } from 'lucide-react'
import { Button } from '@/components/ui/button'
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

export default function ExamLinksPage() {
  const [exams, setExams] = useState<ExamRow[]>([])
  const [loading, setLoading] = useState(true)
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    setOrigin(window.location.origin)
    fetch('/api/updates/exams')
      .then(r => r.json())
      .then(d => setExams(d.exams ?? []))
      .catch(() => toast.error('Failed to load exam links'))
      .finally(() => setLoading(false))
  }, [])

  return (
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
  )
}
