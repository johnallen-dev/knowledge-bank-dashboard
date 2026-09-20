'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Sparkles, ThumbsUp, ThumbsDown, Repeat, GraduationCap } from 'lucide-react'
import type { AiAnalysisResult, AiAnalysisSection } from '@/lib/qaReport/types'

interface AiAnalysisPanelProps {
  startDate?: string
  endDate?: string
  agentNames: string[]
}

function Section({ title, section }: { title: string; section: AiAnalysisSection }) {
  const groups: { label: string; icon: React.ElementType; items: string[] }[] = [
    { label: 'Strengths', icon: ThumbsUp, items: section.strengths },
    { label: 'Weaknesses / Areas for Improvement', icon: ThumbsDown, items: section.weaknesses },
    { label: 'Recurring Patterns', icon: Repeat, items: section.recurringPatterns },
    { label: 'Coaching Opportunities', icon: GraduationCap, items: section.coachingOpportunities },
  ]

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <h4 className="font-semibold text-sm">{title}</h4>
      {groups.map(g => (
        <div key={g.label} className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            <g.icon className="h-3.5 w-3.5" />
            {g.label}
          </div>
          {g.items.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No data available</p>
          ) : (
            <ul className="list-disc list-inside text-sm space-y-0.5">
              {g.items.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          )}
        </div>
      ))}
    </div>
  )
}

export function AiAnalysisPanel({ startDate, endDate, agentNames }: AiAnalysisPanelProps) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AiAnalysisResult | null>(null)

  async function generate() {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/qa-report/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startDate, endDate, agentNames }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to generate AI analysis')
      if (data.auditCount === 0) {
        toast.error('No QA audits match the selected filters')
        return
      }
      setResult(data.analysis)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate AI analysis')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          AI-Powered QA Analysis
        </h3>
        <Button onClick={generate} disabled={loading} size="sm">
          {loading ? 'Analyzing…' : result ? 'Regenerate Analysis' : 'Generate AI Analysis'}
        </Button>
      </div>

      {result && (
        <div className="grid gap-4 md:grid-cols-3">
          <Section title="Chat / Email Audits" section={result.chatEmail} />
          <Section title="Call Audits" section={result.call} />
          <Section title="Overall" section={result.overall} />
        </div>
      )}
    </div>
  )
}
