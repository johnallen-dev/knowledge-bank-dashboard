'use client'
import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { SendHorizontal, Loader2 } from 'lucide-react'
import { AnswerCard } from './AnswerCard'
import type { PipelineResult } from '@/lib/ai/pipeline'

const GUEST_EXAMPLES = [
  'What time is check-in?',
  'Do you provide airport transfers?',
  'Is breakfast included?',
  'Where can I park my car?',
]

const USER_EXAMPLES = [
  'How do I process a refund?',
  'What is the breakfast reporting procedure?',
  'How do I update the apartment listing?',
  'What is the escalation process for maintenance?',
]

interface QuestionInputProps {
  section: 'guest' | 'user'
}

export function QuestionInput({ section }: QuestionInputProps) {
  const [question, setQuestion] = useState('')
  const [result, setResult] = useState<PipelineResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const examples = section === 'guest' ? GUEST_EXAMPLES : USER_EXAMPLES

  async function handleSubmit(q = question) {
    if (!q.trim() || loading) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q.trim(), section }),
      })
      if (!res.ok) throw new Error('Request failed')
      setResult(await res.json())
      setQuestion(q.trim())
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Input area */}
      <div className="space-y-3">
        <div className="relative">
          <Textarea
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() } }}
            placeholder={section === 'guest'
              ? 'How can we help you today? Ask any question about our property...'
              : 'Ask a question about internal procedures, operations, or policies...'}
            className="min-h-[120px] text-base resize-none pr-12"
            disabled={loading}
          />
          <Button
            size="icon"
            className="absolute bottom-3 right-3"
            onClick={() => handleSubmit()}
            disabled={!question.trim() || loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizontal className="h-4 w-4" />}
          </Button>
        </div>

        {/* Example questions */}
        <div className="flex flex-wrap gap-2">
          {examples.map(ex => (
            <button
              key={ex}
              onClick={() => { setQuestion(ex); handleSubmit(ex) }}
              className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {/* Answer */}
      {result && !loading && (
        <AnswerCard question={question} result={result} section={section} />
      )}
    </div>
  )
}
