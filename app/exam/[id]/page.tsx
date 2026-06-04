'use client'
import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { IntroScreen } from '@/components/exam/IntroScreen'
import { QuestionRenderer, type SafeQuestion } from '@/components/exam/QuestionRenderer'
import { SignaturePad, type SignaturePadHandle } from '@/components/exam/SignaturePad'
import { ScoreScreen } from '@/components/exam/ScoreScreen'
import { ClipboardList } from 'lucide-react'

type Stage = 'loading' | 'error' | 'intro' | 'taking' | 'signing' | 'done'

interface BreakdownItem { questionId: string; correct: boolean; given: string; expected: string }
interface ScoreData { score: number; maxScore: number; durationSeconds: number; breakdown: BreakdownItem[] }

export default function ExamPage() {
  const { id: token } = useParams<{ id: string }>()
  const [stage, setStage] = useState<Stage>('loading')
  const [questions, setQuestions] = useState<SafeQuestion[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [examineeName, setExamineeName] = useState('')
  const [examDate, setExamDate] = useState('')
  const [scoreData, setScoreData] = useState<ScoreData | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const sigRef = useRef<SignaturePadHandle>(null)
  const startedAtRef = useRef<number | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/updates/exams/${token}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Exam not found')
        setQuestions(data.questions)
        setStage('intro')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to load exam')
        setStage('error')
      }
    }
    if (token) load()
  }, [token])

  function handleStart(name: string, date: string) {
    setExamineeName(name)
    setExamDate(date)
    startedAtRef.current = Date.now()
    setStage('taking')
  }

  function handleSubmitAnswers() {
    const unanswered = questions.filter(q => !answers[q.id]?.trim())
    if (unanswered.length > 0) {
      toast.error(`Please answer all questions (${unanswered.length} remaining)`)
      return
    }
    setStage('signing')
  }

  async function handleSign() {
    if (!sigRef.current || sigRef.current.isEmpty()) {
      toast.error('Please sign before submitting')
      return
    }
    setSubmitting(true)
    try {
      const signatureB64 = sigRef.current.toDataURL()
      const durationSeconds = startedAtRef.current
        ? Math.round((Date.now() - startedAtRef.current) / 1000)
        : 0

      const res = await fetch('/api/updates/attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, examineeName, examDate, answers, signatureB64, durationSeconds }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Submission failed')
      setScoreData({ score: data.score, maxScore: data.maxScore, durationSeconds, breakdown: data.breakdown ?? [] })
      setStage('done')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (stage === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading exam…</p>
      </div>
    )
  }

  if (stage === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center space-y-2">
          <p className="font-medium">Exam not found</p>
          <p className="text-sm text-muted-foreground">The exam link may be invalid or expired.</p>
        </div>
      </div>
    )
  }

  if (stage === 'intro') return <IntroScreen questionCount={questions.length} onStart={handleStart} />

  if (stage === 'done' && scoreData) {
    return (
      <ScoreScreen
        score={scoreData.score}
        maxScore={scoreData.maxScore}
        examineeName={examineeName}
        examDate={examDate}
        durationSeconds={scoreData.durationSeconds}
        questions={questions}
        breakdown={scoreData.breakdown}
      />
    )
  }

  if (stage === 'taking') {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-6 pb-24">
        <div className="flex items-center gap-2 sticky top-0 bg-gray-50 py-3 z-10 border-b">
          <ClipboardList className="h-5 w-5 text-primary" />
          <span className="font-semibold text-sm">Exam</span>
          <span className="ml-auto text-xs text-muted-foreground">
            {Object.values(answers).filter(v => v.trim()).length}/{questions.length} answered
          </span>
        </div>

        <div className="space-y-4">
          {questions.map((q, i) => (
            <QuestionRenderer
              key={q.id}
              question={q}
              index={i}
              value={answers[q.id] ?? ''}
              onChange={val => setAnswers(prev => ({ ...prev, [q.id]: val }))}
            />
          ))}
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-center">
          <Button onClick={handleSubmitAnswers} className="w-full max-w-2xl">
            Submit Exam
          </Button>
        </div>
      </div>
    )
  }

  // Signing stage
  return (
    <div className="max-w-lg mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold">Almost done!</h2>
        <p className="text-sm text-muted-foreground">
          Please sign below to confirm your answers and submit the exam.
        </p>
      </div>

      <div className="border rounded-xl bg-card p-5 shadow-sm space-y-4">
        <div className="text-sm space-y-1">
          <p><span className="text-muted-foreground">Name:</span> <strong>{examineeName}</strong></p>
          <p><span className="text-muted-foreground">Date:</span> <strong>{examDate}</strong></p>
          <p><span className="text-muted-foreground">Questions answered:</span> <strong>{questions.length}/{questions.length}</strong></p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Digital Signature</p>
          <SignaturePad ref={sigRef} />
        </div>

        <Button onClick={handleSign} disabled={submitting} className="w-full">
          {submitting ? 'Submitting…' : 'Confirm & Submit'}
        </Button>
        <Button variant="ghost" className="w-full" onClick={() => setStage('taking')}>
          Back to answers
        </Button>
      </div>
    </div>
  )
}
